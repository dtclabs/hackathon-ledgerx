import { MigrationInterface, QueryRunner } from 'typeorm'

export class addDtcpayIntegration1694523624009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO integration(name, display_name, status) VALUES ('dtcpay', 'dtcpay', 'disabled') ON CONFLICT DO NOTHING`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "integration" WHERE name = 'dtcpay'`)
  }
}
