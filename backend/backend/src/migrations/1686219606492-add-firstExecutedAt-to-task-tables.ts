import { MigrationInterface, QueryRunner } from "typeorm";

export class addFirstExecutedAtToTaskTables1686219606492 implements MigrationInterface {
    name = 'addFirstExecutedAtToTaskTables1686219606492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "additional_transformation_per_wallet_group_task" ADD "first_executed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "additional_transformation_per_wallet_task" ADD "first_executed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "core_transformation_task" ADD "first_executed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "preprocess_raw_task" ADD "first_executed_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "preprocess_raw_task" DROP COLUMN "first_executed_at"`);
        await queryRunner.query(`ALTER TABLE "core_transformation_task" DROP COLUMN "first_executed_at"`);
        await queryRunner.query(`ALTER TABLE "additional_transformation_per_wallet_task" DROP COLUMN "first_executed_at"`);
        await queryRunner.query(`ALTER TABLE "additional_transformation_per_wallet_group_task" DROP COLUMN "first_executed_at"`);
    }

}
