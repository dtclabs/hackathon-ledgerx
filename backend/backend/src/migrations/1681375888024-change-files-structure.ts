import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeFilesStructure1681375888024 implements MigrationInterface {
  name = 'changeFilesStructure1681375888024'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "financial_transaction_file" ADD "bucket" character varying NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "financial_transaction_file" DROP COLUMN "bucket"`)
  }
}
