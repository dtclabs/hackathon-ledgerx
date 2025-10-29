import { MigrationInterface, QueryRunner } from "typeorm";

export class addJournalEntryWorkflowCounts1689132829929 implements MigrationInterface {
    name = 'addJournalEntryWorkflowCounts1689132829929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD "generated_successful_count" integer`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD "generated_failed_count" integer`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD "exported_successful_count" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP COLUMN "exported_successful_count"`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP COLUMN "generated_failed_count"`);
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP COLUMN "generated_successful_count"`);
    }

}
