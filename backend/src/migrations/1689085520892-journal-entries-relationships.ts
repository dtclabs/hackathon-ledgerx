import { MigrationInterface, QueryRunner } from "typeorm";

export class journalEntriesRelationships1689085520892 implements MigrationInterface {
    name = 'journalEntriesRelationships1689085520892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD "public_id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD CONSTRAINT "UQ_9b2a7897e44edd46ee2b6802264" UNIQUE ("public_id")`);
        await queryRunner.query(`ALTER TABLE "journal_entry" ADD "workflow_id" bigint`);
        await queryRunner.query(`ALTER TABLE "journal_entry" ADD CONSTRAINT "FK_ece50f80a89511d9a83df47a571" FOREIGN KEY ("workflow_id") REFERENCES "journal_entry_export_workflow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_entry" DROP CONSTRAINT "FK_ece50f80a89511d9a83df47a571"`);
        await queryRunner.query(`ALTER TABLE "journal_entry" DROP COLUMN "workflow_id"`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP CONSTRAINT "UQ_9b2a7897e44edd46ee2b6802264"`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP COLUMN "public_id"`);
    }

}
