import { MigrationInterface, QueryRunner } from 'typeorm'

export class addServerDeploymentFeatureFlag1681195072024 implements MigrationInterface {
  name = 'addServerDeploymentFeatureFlag1681195072024'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`insert into feature_flag (name, is_enabled) values ('server_deployment', false)`)
    await queryRunner.query(`insert into feature_flag (name, is_enabled) values ('financial_transaction', false)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from feature_flag where name = 'server_deployment'`)
    await queryRunner.query(`delete from feature_flag where name = 'financial_transaction'`)
  }
}
