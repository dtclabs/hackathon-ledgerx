import { MigrationInterface, QueryRunner } from 'typeorm'

export class createWalletSyncTable1681118638586 implements MigrationInterface {
  name = 'createWalletSyncTable1681118638586'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."wallet_sync_status_enum" AS ENUM('syncing', 'synced', 'failed')`)
    await queryRunner.query(
      `CREATE TABLE "wallet_sync" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."wallet_sync_status_enum", "blockchain_id" character varying NOT NULL, "last_synced_at" TIMESTAMP, "wallet_id" bigint, CONSTRAINT "PK_6870f9859738938db527060f796" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "wallet" DROP COLUMN "status_per_chain"`)
    await queryRunner.query(
      `ALTER TABLE "wallet_sync" ADD CONSTRAINT "FK_9c2ccd7dc8121308819056b281b" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wallet_sync" DROP CONSTRAINT "FK_9c2ccd7dc8121308819056b281b"`)
    await queryRunner.query(`ALTER TABLE "wallet" ADD "status_per_chain" json`)
    await queryRunner.query(`DROP TABLE "wallet_sync"`)
    await queryRunner.query(`DROP TYPE "public"."wallet_sync_status_enum"`)
  }
}
