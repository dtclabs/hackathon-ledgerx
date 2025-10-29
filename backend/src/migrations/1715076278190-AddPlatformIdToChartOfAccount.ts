import { QueryRunner } from 'typeorm'

export class addPlatformIdToChartOfAccount1715076278190 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE chart_of_account ADD COLUMN "platform_id" VARCHAR')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE chart_of_account DROP COLUMN "platform_id"')
  }
}
