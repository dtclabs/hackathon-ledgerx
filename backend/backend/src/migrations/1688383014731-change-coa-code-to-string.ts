import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeCoaCodeToString1688383014731 implements MigrationInterface {
  name = 'changeCoaCodeToString1688383014731'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "code" TYPE varchar USING "code"::varchar`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "code" TYPE integer USING "code"::integer`)
  }
}
