import { MigrationInterface, QueryRunner } from "typeorm";

export class changeUniqueIndexOfPreprocessTable1684937687280 implements MigrationInterface {
    name = 'changeUniqueIndexOfPreprocessTable1684937687280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_preprocess_uniqueId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_financial_transaction_preprocess_uniqueId" ON "financial_transaction_preprocess" ("unique_id", "deleted_at") WHERE "deleted_at" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_preprocess_uniqueId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_financial_transaction_preprocess_uniqueId" ON "financial_transaction_preprocess" ("unique_id") `);
    }

}
