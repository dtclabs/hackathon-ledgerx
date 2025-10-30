import { MigrationInterface, QueryRunner } from 'typeorm'

export class addTripleAIntegration1710730049663 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO integration(name, display_name, status) VALUES ('triple_a', 'Triple A', 'disabled') ON CONFLICT DO NOTHING`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "integration" WHERE name = 'triple_a'`)
  }
}
