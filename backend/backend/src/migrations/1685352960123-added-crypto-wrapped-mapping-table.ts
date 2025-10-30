import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedCryptoWrappedMappingTable1685352960123 implements MigrationInterface {
  name = 'addedCryptoWrappedMappingTable1685352960123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "crypto_wrapped_mapping" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cryptocurrency_id" bigint, "wrapped_cryptocurrency_id" bigint, CONSTRAINT "PK_bbc58bc60b15eff4915f7b994ab" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "crypto_wrapped_mapping" ADD CONSTRAINT "FK_b9783164e5f04e89631d1eaf146" FOREIGN KEY ("cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "crypto_wrapped_mapping" ADD CONSTRAINT "FK_1493078d348e14fef7b4859cca0" FOREIGN KEY ("wrapped_cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "crypto_wrapped_mapping" DROP CONSTRAINT "FK_1493078d348e14fef7b4859cca0"`)
    await queryRunner.query(`ALTER TABLE "crypto_wrapped_mapping" DROP CONSTRAINT "FK_b9783164e5f04e89631d1eaf146"`)
    await queryRunner.query(`DROP TABLE "crypto_wrapped_mapping"`)
  }
}
