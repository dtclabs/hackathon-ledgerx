import { MigrationInterface, QueryRunner } from 'typeorm'

export class createRecipientBankAccount1710394565322 implements MigrationInterface {
  name = 'createRecipientBankAccount1710394565322'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recipient_bank_account" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "triple_a_id" character varying NOT NULL, "bank_name" character varying NOT NULL, "account_number_last_4" character varying NOT NULL, "recipient_id" bigint NOT NULL, "fiat_currency_id" bigint NOT NULL, CONSTRAINT "UQ_25dd48ea73719f742efcc649f77" UNIQUE ("public_id"), CONSTRAINT "UQ_recipient_bank_account_triple_a_id" UNIQUE ("triple_a_id"), CONSTRAINT "PK_85d53c784269fe655a3a2664cc4" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "recipient_bank_account" ADD CONSTRAINT "FK_c90af849c0708c5f112d35512c3" FOREIGN KEY ("recipient_id") REFERENCES "recipient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "recipient_bank_account" ADD CONSTRAINT "FK_b7c7d1bbe1070faa967b96b34a5" FOREIGN KEY ("fiat_currency_id") REFERENCES "fiat_currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipient_bank_account" DROP CONSTRAINT "FK_b7c7d1bbe1070faa967b96b34a5"`)
    await queryRunner.query(`ALTER TABLE "recipient_bank_account" DROP CONSTRAINT "FK_c90af849c0708c5f112d35512c3"`)
    await queryRunner.query(`DROP TABLE "recipient_bank_account"`)
  }
}
