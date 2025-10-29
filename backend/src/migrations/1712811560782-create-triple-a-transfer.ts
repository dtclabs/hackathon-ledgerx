import { MigrationInterface, QueryRunner } from 'typeorm'

export class createTripleATransfer1712811560782 implements MigrationInterface {
  name = 'createTripleATransfer1712811560782'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "triple_a_transfer" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "payment_id" bigint NOT NULL, "quote_id" character varying, "transfer_id" character varying, "status" character varying, "expires_at" TIMESTAMP, "transfer" json NOT NULL, "error" json, CONSTRAINT "PK_d56c61f45035774dcd5803e8dfa" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_triple_a_transfer_payment_id" ON "triple_a_transfer" ("payment_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_triple_a_transfer_quote_id" ON "triple_a_transfer" ("quote_id") `)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_triple_a_transfer_transfer_id" ON "triple_a_transfer" ("transfer_id") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_triple_a_transfer_transfer_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_triple_a_transfer_quote_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_triple_a_transfer_payment_id"`)
    await queryRunner.query(`DROP TABLE "triple_a_transfer"`)
  }
}
