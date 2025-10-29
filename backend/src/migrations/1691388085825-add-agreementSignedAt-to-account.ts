import { MigrationInterface, QueryRunner } from 'typeorm'

export class addAgreementSignedAtToAccount1691388085825 implements MigrationInterface {
  name = 'addAgreementSignedAtToAccount1691388085825'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" ADD "agreement_signed_at" TIMESTAMP`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "agreement_signed_at"`)
  }
}
