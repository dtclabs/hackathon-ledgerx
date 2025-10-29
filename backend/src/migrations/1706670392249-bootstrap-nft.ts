import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resource = 'nfts'
const actions = ['read']

export class bootstrapNft1706670392249 implements MigrationInterface {
  name = 'bootstrapNft1706670392249'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_collection" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "contract_addresses" json NOT NULL, "source_id" character varying NOT NULL, "image_url" character varying, "banner_image_url" character varying, "description" character varying, "contract_standard" character varying, "token_count" numeric, "floor_prices" json, "floor_price_updated_at" TIMESTAMP, CONSTRAINT "UQ_8b8a4828b2acc9e2c0aa06e97c3" UNIQUE ("public_id"), CONSTRAINT "UQ_nftCollection_sourceId" UNIQUE ("source_id"), CONSTRAINT "PK_ffe58aa05707db77c2f20ecdbc3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "nft_organization_sync" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "organization_id" character varying NOT NULL, "completed_at" TIMESTAMP, "error" json, "operational_remark" character varying, CONSTRAINT "UQ_cb9c8da3db943ff3846ec9643e5" UNIQUE ("public_id"), CONSTRAINT "PK_b2f3fa5a02c2b56743e72c8038a" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_nftOrganizationSync_organizationId_status" ON "nft_organization_sync" ("organization_id", "status") `
    )
    await queryRunner.query(
      `CREATE TABLE "nft_address_sync" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "address" character varying NOT NULL, "blockchainId" character varying NOT NULL, "sync_id" character varying, "status" character varying NOT NULL, "organization_id" character varying NOT NULL, "wallet_id" character varying NOT NULL, "last_executed_at" TIMESTAMP, "completed_at" TIMESTAMP, "error" json, "metadata" json, "operational_remark" character varying, "nft_organization_sync_id" bigint, CONSTRAINT "PK_931d6ffb1ace91869a47c47f8b9" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_nftAddressSync_organizationId_status" ON "nft_address_sync" ("organization_id", "status") `
    )
    await queryRunner.query(
      `CREATE TABLE "nft" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "token_id" character varying NOT NULL, "source_id" character varying NOT NULL, "amount" integer NOT NULL, "image_url" character varying, "blockchain_id" character varying NOT NULL, "acquired_at" TIMESTAMP NOT NULL, "transaction_hash" character varying, "transaction_metadata" json, "gain_loss_metadata" json, "traits" json, "rarity_rank" character varying, "nft_collection_id" bigint, "wallet_id" bigint, "organization_id" bigint, CONSTRAINT "UQ_889b37f7b07951253cd6cca26a6" UNIQUE ("public_id"), CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_nft_organization_nftCollection" ON "nft" ("organization_id", "nft_collection_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_nft_organization_sourceId" ON "nft" ("organization_id", "source_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "nft_address_sync" ADD CONSTRAINT "FK_8e86f79aa950b1ccd64947bb376" FOREIGN KEY ("nft_organization_sync_id") REFERENCES "nft_organization_sync"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_ebc9da7612a3fd6f277d300dc95" FOREIGN KEY ("nft_collection_id") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_5ee1c77855cbd6be6f8db2b01fe" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "nft" ADD CONSTRAINT "FK_0c22fb911a0e4ec611600fee9fb" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    for (const role of roles) {
      const roleSqlResult = await queryRunner.query(`SELECT id
                                                                  FROM "role"
                                                                  WHERE "name" = '${role}'`)

      for (const action of actions) {
        await queryRunner.query(
          `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
                                             VALUES (DEFAULT, DEFAULT, DEFAULT, '${resource}', '${action}', '${roleSqlResult[0].id}')`
        )
      }
    }

    await queryRunner.query(
      `INSERT INTO "feature_flag" ("name", "is_enabled") VALUES ('nft_get_ignore_update_after', false)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "feature_flag" WHERE "name" = 'nft_get_ignore_update_after'`)
    await queryRunner.query(`DELETE FROM "permission" WHERE "resource" = '${resource}'`)

    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_0c22fb911a0e4ec611600fee9fb"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_5ee1c77855cbd6be6f8db2b01fe"`)
    await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_ebc9da7612a3fd6f277d300dc95"`)
    await queryRunner.query(`ALTER TABLE "nft_address_sync" DROP CONSTRAINT "FK_8e86f79aa950b1ccd64947bb376"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_nft_organization_sourceId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_nft_organization_nftCollection"`)
    await queryRunner.query(`DROP TABLE "nft"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_nftAddressSync_organizationId_status"`)
    await queryRunner.query(`DROP TABLE "nft_address_sync"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_nftOrganizationSync_organizationId_status"`)
    await queryRunner.query(`DROP TABLE "nft_organization_sync"`)
    await queryRunner.query(`DROP TABLE "nft_collection"`)
  }
}
