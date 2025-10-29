import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeGnosisWalletMetadata1715072904594 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`update wallet
                             set metadata = ('[]' || metadata::jsonb)::json
                             where metadata is not null
                               and source_type = 'gnosis'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT w.metadata -> 0
                             from wallet w
                             where w.metadata is not null
                               and w.source_type = 'gnosis'`)
  }
}
