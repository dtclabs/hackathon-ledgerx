import { MigrationInterface, QueryRunner } from 'typeorm'

export class multichainFixBscGnosisUrl1691486527980 implements MigrationInterface {
  name = 'multichainFixBscGnosisUrl1691486527980'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`update blockchain
                                 set safe_url = 'https://safe-transaction-bsc.safe.global'
                                 where public_id = 'bsc'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
