import { MigrationInterface, QueryRunner } from "typeorm";

export class addJournalEntryAndJournalLine1688117851636 implements MigrationInterface {
    name = 'addJournalEntryAndJournalLine1688117851636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "journal_entry" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "remote_id" character varying, "remote_created_at" TIMESTAMP, "status" character varying NOT NULL, "status_reason" character varying, "transaction_date" TIMESTAMP, "memo" character varying, "integration_params" json, "financial_transaction_parent_id" bigint, "organization_id" bigint, CONSTRAINT "PK_69167f660c807d2aa178f0bd7e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "journal_line" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "remote_id" character varying, "net_amount" integer NOT NULL, "description" character varying, "modified_at" TIMESTAMP, "journal_entry_id" bigint, "account_id" bigint, CONSTRAINT "PK_4158ea7f291d9234ae64221898a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "journal_entry" ADD CONSTRAINT "FK_25798b73e678520b6e2e98e73a7" FOREIGN KEY ("financial_transaction_parent_id") REFERENCES "financial_transaction_parent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_entry" ADD CONSTRAINT "FK_ff92eb936fa40fd2294bc8c9123" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_line" ADD CONSTRAINT "FK_69085ffc4aca6982f5d19db0592" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_line" ADD CONSTRAINT "FK_bc2ac4c300875420cfb53985bd1" FOREIGN KEY ("account_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_line" DROP CONSTRAINT "FK_bc2ac4c300875420cfb53985bd1"`);
        await queryRunner.query(`ALTER TABLE "journal_line" DROP CONSTRAINT "FK_69085ffc4aca6982f5d19db0592"`);
        await queryRunner.query(`ALTER TABLE "journal_entry" DROP CONSTRAINT "FK_ff92eb936fa40fd2294bc8c9123"`);
        await queryRunner.query(`ALTER TABLE "journal_entry" DROP CONSTRAINT "FK_25798b73e678520b6e2e98e73a7"`);
        await queryRunner.query(`DROP TABLE "journal_line"`);
        await queryRunner.query(`DROP TABLE "journal_entry"`);
    }

}
