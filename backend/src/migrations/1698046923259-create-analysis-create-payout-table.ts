import { MigrationInterface, QueryRunner } from 'typeorm'

export class createAnalysisCreatePayoutTable1698046923259 implements MigrationInterface {
  name = 'createAnalysisCreatePayoutTable1698046923259'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "analysis_create_payout" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "blockchain_id" character varying, "organization_id" character varying, "application_name" character varying, "type" character varying, "source_type" character varying, "source_wallet_id" character varying, "source_address" character varying, "hash" character varying, "notes" character varying, "total_line_items" integer, "line_items" json, "value_at" TIMESTAMP, CONSTRAINT "PK_bb1f42b7f3d4be052780ff143bb" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analysis_create_payout"`)
  }
}
