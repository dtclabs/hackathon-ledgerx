import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOperationRemarksColumn1700540338003 implements MigrationInterface {
  name = 'addOperationRemarksColumn1700540338003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration" ADD "operation_remarks" json`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration" DROP COLUMN "operation_remarks"`)
  }
}
