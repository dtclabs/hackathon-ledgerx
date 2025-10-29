import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGainLossToSolMetadata1760457317242 implements MigrationInterface {
    name = 'AddGainLossToSolMetadata1760457317242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add gain/loss columns to sol_financial_transaction_child_metadata table
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" ADD "gain_loss" character varying`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" ADD "gain_loss_updated_by" character varying`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" ADD "gain_loss_updated_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove gain/loss columns from sol_financial_transaction_child_metadata table
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" DROP COLUMN "gain_loss_updated_at"`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" DROP COLUMN "gain_loss_updated_by"`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" DROP COLUMN "gain_loss"`);
    }

}
