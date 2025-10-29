import { MigrationInterface, QueryRunner } from 'typeorm'

export class addReviewRequestedAtReviewRequestedByToPayment1703816531280 implements MigrationInterface {
  name = 'addReviewRequestedAtReviewRequestedByToPayment1703816531280'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" ADD "review_requested_at" TIMESTAMP`)
    await queryRunner.query(`ALTER TABLE "payment" ADD "review_requested_by" bigint`)
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_bddff40419a446e50e0cdd94adf" FOREIGN KEY ("review_requested_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_bddff40419a446e50e0cdd94adf"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "review_requested_by"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "review_requested_at"`)
  }
}
