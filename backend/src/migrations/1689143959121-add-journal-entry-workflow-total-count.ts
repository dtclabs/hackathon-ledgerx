import { MigrationInterface, QueryRunner } from "typeorm";

export class addJournalEntryWorkflowTotalCount1689143959121 implements MigrationInterface {
    name = 'addJournalEntryWorkflowTotalCount1689143959121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD "total_count" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP COLUMN "total_count"`);
    }

}
