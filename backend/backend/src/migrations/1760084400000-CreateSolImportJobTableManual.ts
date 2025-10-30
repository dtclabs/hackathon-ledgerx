import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSolImportJobTableManual1760084400000 implements MigrationInterface {
    name = 'CreateSolImportJobTableManual1760084400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for status first
        await queryRunner.query(`
            CREATE TYPE "public"."sol_import_job_status_enum" AS ENUM('pending', 'running', 'completed', 'failed')
        `);

        // Create SolImportJob table with enum type directly
        await queryRunner.query(`
            CREATE TABLE "sol_import_job" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "wallet_public_id" character varying NOT NULL,
                "organization_id" bigint NOT NULL,
                "status" "public"."sol_import_job_status_enum" NOT NULL DEFAULT 'pending',
                "started_at" TIMESTAMP NOT NULL,
                "completed_at" TIMESTAMP,
                "total_transactions" integer NOT NULL DEFAULT '0',
                "processed_transactions" integer NOT NULL DEFAULT '0',
                "error" character varying,
                "metadata" json,
                CONSTRAINT "PK_sol_import_job" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_sol_import_job_wallet_status" ON "sol_import_job" ("wallet_public_id", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_sol_import_job_organization" ON "sol_import_job" ("organization_id", "started_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_sol_import_job_organization"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sol_import_job_wallet_status"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "sol_import_job"`);
        
        // Drop enum type
        await queryRunner.query(`DROP TYPE "public"."sol_import_job_status_enum"`);
    }
}