import { MigrationInterface, QueryRunner } from 'typeorm'

export class indexExperimentBoostrap1687334117537 implements MigrationInterface {
  name = 'indexExperimentBoostrap1687334117537'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_cryptocurrency_address_chain_type_address"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_parent_publicId_organizationId"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_child_publicId_organizationId"`)
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_parent" ALTER COLUMN "organization_id" TYPE bigint USING "organization_id"::bigint`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child" ALTER COLUMN "organization_id" TYPE bigint USING "organization_id"::bigint`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_file" ALTER COLUMN "financial_transaction_child_id" TYPE bigint USING "financial_transaction_child_id"::bigint`
    )
    await queryRunner.query(
      `ALTER TABLE "tax_lot" ALTER COLUMN "financial_transaction_child_id" TYPE bigint USING "financial_transaction_child_id"::bigint`
    )
    await queryRunner.query(`ALTER TABLE "tax_lot" ALTER COLUMN "wallet_id" TYPE bigint USING "wallet_id"::bigint`)
    await queryRunner.query(
      `ALTER TABLE "tax_lot" ALTER COLUMN "organization_id" TYPE bigint USING "organization_id"::bigint`
    )
    await queryRunner.query(
      `ALTER TABLE "tax_lot_sale" ALTER COLUMN "financial_transaction_child_id" TYPE bigint USING "financial_transaction_child_id"::bigint`
    )
    await queryRunner.query(`ALTER TABLE "tax_lot_sale" ALTER COLUMN "wallet_id" TYPE bigint USING "wallet_id"::bigint`)
    await queryRunner.query(
      `ALTER TABLE "tax_lot_sale" ALTER COLUMN "organization_id" TYPE bigint USING "organization_id"::bigint`
    )

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cryptocurrency_address_chain_address_type" ON "cryptocurrency_address" ("address", "type") `
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_financial_transaction_parent_publicId_organizationId" ON "financial_transaction_parent" ("public_id", "organization_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_child_hash" ON "financial_transaction_child" ("hash") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId" ON "financial_transaction_child" ("to_address", "from_address", "organization_id", "blockchain_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_financial_transaction_child_publicId_organizationId" ON "financial_transaction_child" ("public_id", "organization_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_file_childId" ON "financial_transaction_file" ("financial_transaction_child_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_preprocess_toAddr_fromAddr_blockchainId_status" ON "financial_transaction_preprocess" ("to_address", "from_address", "blockchain_id", "status") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_preprocess_hash_status" ON "financial_transaction_preprocess" ("hash", "status") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_tax_lot_organizationId_blockchainId" ON "tax_lot" ("organization_id", "blockchain_id") `
    )
    await queryRunner.query(`CREATE INDEX "IDX_tax_lot_childId" ON "tax_lot" ("financial_transaction_child_id") `)
    await queryRunner.query(
      `CREATE INDEX "IDX_tax_lot_walletId_blockchainId" ON "tax_lot" ("wallet_id", "blockchain_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_tax_lot_sale_childId" ON "tax_lot_sale" ("financial_transaction_child_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_tax_lot_sale_walletId_blockchainId" ON "tax_lot_sale" ("wallet_id", "blockchain_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_raw_transaction_address_blockchainId_status" ON "raw_transaction" ("address", "blockchain_id", "status") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_raw_transaction_address_blockchainId_status"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tax_lot_sale_walletId_blockchainId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tax_lot_sale_childId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tax_lot_walletId_blockchainId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tax_lot_childId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tax_lot_organizationId_blockchainId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_preprocess_hash_status"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_preprocess_toAddr_fromAddr_blockchainId_status"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_file_childId"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_child_publicId_organizationId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_child_hash"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_parent_publicId_organizationId"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_cryptocurrency_address_chain_address_type"`)

    await queryRunner.query(
      `ALTER TABLE "financial_transaction_parent" ALTER COLUMN "organization_id" TYPE varchar USING "organization_id"::varchar`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child" ALTER COLUMN "organization_id" TYPE varchar USING "organization_id"::varchar`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_file" ALTER COLUMN "financial_transaction_child_id" TYPE varchar USING "financial_transaction_child_id"::varchar`
    )
    await queryRunner.query(
      `ALTER TABLE "tax_lot" ALTER COLUMN "financial_transaction_child_id" TYPE varchar USING "financial_transaction_child_id"::varchar`
    )
    await queryRunner.query(`ALTER TABLE "tax_lot" ALTER COLUMN "wallet_id" TYPE varchar USING "wallet_id"::varchar`)
    await queryRunner.query(
      `ALTER TABLE "tax_lot" ALTER COLUMN "organization_id" TYPE varchar USING "organization_id"::varchar`
    )
    await queryRunner.query(
      `ALTER TABLE "tax_lot_sale" ALTER COLUMN "financial_transaction_child_id" TYPE varchar USING "financial_transaction_child_id"::varchar`
    )
    await queryRunner.query(
      `ALTER TABLE "tax_lot_sale" ALTER COLUMN "wallet_id" TYPE varchar USING "wallet_id"::varchar`
    )
    await queryRunner.query(
      `ALTER TABLE "tax_lot_sale" ALTER COLUMN "organization_id" TYPE varchar USING "organization_id"::varchar`
    )

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_financial_transaction_child_publicId_organizationId" ON "financial_transaction_child" ("deleted_at", "public_id", "organization_id") WHERE (deleted_at IS NOT NULL)`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_financial_transaction_parent_publicId_organizationId" ON "financial_transaction_parent" ("deleted_at", "public_id", "organization_id") WHERE (deleted_at IS NOT NULL)`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cryptocurrency_address_chain_type_address" ON "cryptocurrency_address" ("type", "address") `
    )
  }
}
