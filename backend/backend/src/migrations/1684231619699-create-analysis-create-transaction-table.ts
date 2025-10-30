import { MigrationInterface, QueryRunner } from "typeorm";

export class createAnalysisCreateTransactionTable1684231619699 implements MigrationInterface {
    name = 'createAnalysisCreateTransactionTable1684231619699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "analysis_create_transaction" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" character varying, "from_wallet" json, "from_address" character varying, "value_at" TIMESTAMP NOT NULL, "hash" character varying NOT NULL, "total_amount" character varying NOT NULL, "total_recipient" integer, "recipients" json, "blockchain_id" character varying, "application_name" character varying, "categories" json, "notes" json, "attachments" json, CONSTRAINT "PK_560db8c8de24cbbaa97ac5900a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "eventType"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "accountId"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "traceId"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "event_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "organization_id" character varying`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "account_id" character varying`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "trace_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "trace_id"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "organization_id"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" DROP COLUMN "event_type"`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "traceId" character varying`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "accountId" character varying`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "organizationId" character varying`);
        await queryRunner.query(`ALTER TABLE "analysis_event_tracker" ADD "eventType" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "analysis_create_transaction"`);
    }

}
