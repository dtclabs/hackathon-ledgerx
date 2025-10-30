import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resources = ['invoices']
const actions = ['read']
const blockchainPublicIdToRequestFinanceNameMap = {
  ethereum: 'mainnet',
  goerli: 'goerli',
  polygon: 'matic',
  bsc: 'bsc'
}

export class addRequestFinanceInvoiceAndInvoiceTable1691999928075 implements MigrationInterface {
  name = 'addRequestFinanceInvoiceAndInvoiceTable1691999928075'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "request_finance_invoice" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" character varying NOT NULL, "request_id" character varying NOT NULL, "invoice_number" character varying NOT NULL, "creation_date" TIMESTAMP NOT NULL, "transaction_hash" character varying, "request_blockchain_id" character varying, "status" character varying NOT NULL, "role" character varying NOT NULL, "is_linked" boolean NOT NULL DEFAULT false, "raw_data" json NOT NULL, CONSTRAINT "PK_e7b07a8596623976ec6844bd441" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_request_invoice_organizationId_status" ON "request_finance_invoice" ("organization_id", "status") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_request_invoice_organizationId_transactionHash" ON "request_finance_invoice" ("organization_id", "transaction_hash") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_request_invoice_organizationId_requestId" ON "request_finance_invoice" ("organization_id", "request_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "to"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "from"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "information"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "invoice_number"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "network"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "recipient"`)

    await queryRunner.query(`ALTER TABLE "organization_integration_auth"
        RENAME COLUMN "account_token" TO "access_token"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "refresh_token" character varying`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "expired_at" TIMESTAMP`)
    await queryRunner.query(`ALTER TABLE "integration" ALTER COLUMN "merge_id" DROP NOT NULL`)
    await queryRunner.query(`INSERT INTO "integration" ("name","display_name","status")
    SELECT 'request_finance', 'Request Finance', 'enabled' WHERE NOT EXISTS ( SELECT 1 FROM "integration" WHERE name = 'request_finance')`)
    await queryRunner.query(
      `UPDATE "integration" SET
                      "display_name" = 'Xero'
                      WHERE "name" = 'xero'`
    )

    await queryRunner.query(`ALTER TABLE "blockchain" ADD "request_finance_name" character varying`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "public_id" uuid NOT NULL DEFAULT uuid_generate_v4()`)
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "UQ_20443f9c43335b424b712be02b3" UNIQUE ("public_id")`
    )
    await queryRunner.query(`ALTER TABLE "invoice" ADD "source" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "source_id" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "counterpartyName" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "counterpartyEmail" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "currency" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "total_amount" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "role" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "view_url" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "metadata" json`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "financial_transaction_parent_id" bigint`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "organization_id" bigint`)
    await queryRunner.query(`ALTER TABLE "integration" ALTER COLUMN "merge_id" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_4c2bb27cdaea5cfaf94b49e84b2" FOREIGN KEY ("financial_transaction_parent_id") REFERENCES "financial_transaction_parent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_ecae1cafdc243779e75d31afd91" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    for (const role of roles) {
      const roleSqlResult = await queryRunner.query(`SELECT id
                                                    FROM "role"
                                                    WHERE "name" = '${role}'`)
      for (const resource of resources) {
        for (const action of actions) {
          await queryRunner.query(
            `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
                               VALUES (DEFAULT, DEFAULT, DEFAULT, '${resource}', '${action}', '${roleSqlResult[0].id}')`
          )
        }
      }
    }

    for (const [publicId, requestFinanceName] of Object.entries(blockchainPublicIdToRequestFinanceNameMap)) {
      await queryRunner.query(
        `UPDATE "blockchain" SET
                            "request_finance_name" = '${requestFinanceName}'
                            WHERE "public_id" = '${publicId}'`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const resource of resources) {
      await queryRunner.query(`DELETE FROM "permission" WHERE "resource" = '${resource}'`)
    }

    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_ecae1cafdc243779e75d31afd91"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_4c2bb27cdaea5cfaf94b49e84b2"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "organization_id"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "financial_transaction_parent_id"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "metadata"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "view_url"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "role"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "total_amount"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "currency"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "counterpartyEmail"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "counterpartyName"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "source_id"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "source"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "UQ_20443f9c43335b424b712be02b3"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "public_id"`)
    await queryRunner.query(`ALTER TABLE "blockchain" DROP COLUMN "request_finance_name"`)

    await queryRunner.query(`DELETE FROM "integration" WHERE "name"='request_finance'`)
    await queryRunner.query(`ALTER TABLE "integration" ALTER COLUMN "merge_id" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "expired_at"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "refresh_token"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth"
            RENAME COLUMN "access_token" TO "account_token"`)

    await queryRunner.query(`ALTER TABLE "invoice" ADD "recipient" character varying`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "network" character varying`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "invoice_number" character varying`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "information" character varying`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "from" json`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "to" json`)
    await queryRunner.query(`DROP INDEX "public"."UQ_request_invoice_organizationId_requestId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_request_invoice_organizationId_transactionHash"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_request_invoice_organizationId_status"`)
    await queryRunner.query(`DROP TABLE "request_finance_invoice"`)
  }
}
