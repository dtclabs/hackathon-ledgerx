import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSolanaFinancialTransactions1760081535998 implements MigrationInterface {
    name = 'CreateSolanaFinancialTransactions1760081535998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "portfolio_positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "wallet_id" character varying NOT NULL, "symbol" character varying NOT NULL, "address" character varying NOT NULL, "blockchain" character varying NOT NULL, "quantity" numeric(36,18) NOT NULL DEFAULT '0', "averageCostPrice" numeric(36,18) NOT NULL DEFAULT '0', "totalCost" numeric(36,18) NOT NULL DEFAULT '0', "currentPrice" numeric(36,18) NOT NULL DEFAULT '0', "currentValue" numeric(36,18) NOT NULL DEFAULT '0', "unrealizedPnL" numeric(36,18) NOT NULL DEFAULT '0', "unrealizedPnLPercentage" numeric(36,2) NOT NULL DEFAULT '0', "realizedPnL" numeric(36,18) NOT NULL DEFAULT '0', "totalFees" numeric(36,18) NOT NULL DEFAULT '0', "firstPurchaseDate" TIMESTAMP, "lastTransactionDate" TIMESTAMP, "priceLastUpdatedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" bigint, "walletId" bigint, CONSTRAINT "PK_40ad2ad5289b84d84729bb74b2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_59c2c6ba98c3e640e53563d302" ON "portfolio_positions" ("organization_id", "symbol") `);
        await queryRunner.query(`CREATE INDEX "IDX_6adac8f6d591f7a1c828f0339f" ON "portfolio_positions" ("organization_id", "wallet_id", "symbol") `);
        await queryRunner.query(`CREATE TYPE "public"."portfolio_transactions_type_enum" AS ENUM('BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT', 'STAKE', 'UNSTAKE', 'REWARD')`);
        await queryRunner.query(`CREATE TABLE "portfolio_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "wallet_id" character varying NOT NULL, "transactionHash" character varying NOT NULL, "blockchain" character varying NOT NULL, "symbol" character varying NOT NULL, "tokenAddress" character varying NOT NULL, "type" "public"."portfolio_transactions_type_enum" NOT NULL, "quantity" numeric(36,18) NOT NULL, "pricePerToken" numeric(36,18), "totalValue" numeric(36,18), "fees" numeric(36,18) NOT NULL DEFAULT '0', "realizedPnL" numeric(36,18), "transactionDate" TIMESTAMP NOT NULL, "blockNumber" bigint, "metadata" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" bigint, "walletId" bigint, CONSTRAINT "PK_591644ded84efdc708977f894a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_81c8b22b89d6d8ce4a41b005a6" ON "portfolio_transactions" ("transactionHash", "blockchain") `);
        await queryRunner.query(`CREATE INDEX "IDX_be84a46874e9acb45ad9259b32" ON "portfolio_transactions" ("organization_id", "wallet_id") `);
        await queryRunner.query(`CREATE TYPE "public"."sol_financial_transaction_child_metadata_status_enum" AS ENUM('SYNCED', 'PROCESSING', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."sol_financial_transaction_child_metadata_substatuses_enum" AS ENUM('PENDING_VALIDATION', 'VALIDATED', 'REQUIRES_MANUAL_REVIEW')`);
        await queryRunner.query(`CREATE TYPE "public"."sol_financial_transaction_child_metadata_gain_loss_inclusion_status_enum" AS ENUM('ALL', 'EXCLUDE', 'INCLUDE_ONLY_GAINS', 'INCLUDE_ONLY_LOSSES')`);
        await queryRunner.query(`CREATE TABLE "sol_financial_transaction_child_metadata" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "direction" character varying NOT NULL, "type" character varying NOT NULL, "status" "public"."sol_financial_transaction_child_metadata_status_enum" NOT NULL, "substatuses" "public"."sol_financial_transaction_child_metadata_substatuses_enum" array NOT NULL DEFAULT '{}', "fiat_currency" character varying, "fiat_amount" character varying, "fiat_amount_updated_by" character varying, "fiat_amount_updated_at" TIMESTAMP, "fiat_amount_per_unit" character varying, "fiat_amount_per_unit_updated_by" character varying, "fiat_amount_per_unit_updated_at" TIMESTAMP, "cost_basis" character varying, "cost_basis_updated_by" character varying, "cost_basis_updated_at" TIMESTAMP, "cost_basis_per_unit" character varying, "cost_basis_per_unit_updated_by" character varying, "cost_basis_per_unit_updated_at" TIMESTAMP, "gain_loss_inclusion_status" "public"."sol_financial_transaction_child_metadata_gain_loss_inclusion_status_enum" NOT NULL, "metadata" character varying, "solana_metadata" json, "corresponding_coa_updated_by" character varying, "note" character varying, "sol_financial_transaction_child_id" bigint, "category_id" bigint, "corresponding_coa_id" bigint, CONSTRAINT "REL_e0798c9a88bc9edb20f58d234c" UNIQUE ("sol_financial_transaction_child_id"), CONSTRAINT "PK_b6fec01b5d6efd9959674ccdae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sol_financial_transaction_child" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" character varying NOT NULL, "hash" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "from_address" character varying, "to_address" character varying, "token_address" character varying, "cryptocurrency_amount" character varying NOT NULL, "value_timestamp" TIMESTAMP NOT NULL, "organization_id" bigint NOT NULL, "transaction_id" character varying, "instruction_index" integer, "cryptocurrency_id" bigint, "sol_financial_transaction_parent_id" bigint, CONSTRAINT "PK_7f7212cd504e0408773124adf90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_sol_fin_txn_child_parent_id" ON "sol_financial_transaction_child" ("sol_financial_transaction_parent_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_sol_fin_txn_child_hash" ON "sol_financial_transaction_child" ("hash") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_sol_fin_txn_child_toAddr_fromAddr_orgId_blockchainId" ON "sol_financial_transaction_child" ("to_address", "from_address", "organization_id", "blockchain_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_sol_financial_transaction_child_publicId_organizationId" ON "sol_financial_transaction_child" ("public_id", "organization_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE TABLE "sol_financial_transaction_parent" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" character varying NOT NULL, "hash" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "activity" character varying NOT NULL, "organization_id" bigint NOT NULL, "status" character varying NOT NULL, "export_status" character varying NOT NULL, "export_status_reason" character varying, "value_timestamp" TIMESTAMP NOT NULL, "block_number" integer, "slot" integer, "fee" character varying, "remark" character varying, CONSTRAINT "PK_601481c7e1c737bef952397c537" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_sol_financial_transaction_parent_organizationId_exportStatus" ON "sol_financial_transaction_parent" ("organization_id", "export_status") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_sol_financial_transaction_parent_publicId_organizationId" ON "sol_financial_transaction_parent" ("public_id", "organization_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "portfolio_positions" ADD CONSTRAINT "FK_9eeefb8ffda6e6a9a59b4256f49" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_positions" ADD CONSTRAINT "FK_02516452071a2720a90a5815f91" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "FK_04e0f8dfe47df6693fbf862e7c7" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "FK_3bfd0f7263e3d5d887cd297e52a" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" ADD CONSTRAINT "FK_e0798c9a88bc9edb20f58d234c1" FOREIGN KEY ("sol_financial_transaction_child_id") REFERENCES "sol_financial_transaction_child"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" ADD CONSTRAINT "FK_ba5dfec4c9747ea3c71d9e82782" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" ADD CONSTRAINT "FK_344a2a7b09107f09bb1cf6bcb59" FOREIGN KEY ("corresponding_coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child" ADD CONSTRAINT "FK_c2c0a0d3a01c2780864950d6d5f" FOREIGN KEY ("cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child" ADD CONSTRAINT "FK_435a8dc348f3b318e23ef61afd8" FOREIGN KEY ("sol_financial_transaction_parent_id") REFERENCES "sol_financial_transaction_parent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child" DROP CONSTRAINT "FK_435a8dc348f3b318e23ef61afd8"`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child" DROP CONSTRAINT "FK_c2c0a0d3a01c2780864950d6d5f"`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" DROP CONSTRAINT "FK_344a2a7b09107f09bb1cf6bcb59"`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" DROP CONSTRAINT "FK_ba5dfec4c9747ea3c71d9e82782"`);
        await queryRunner.query(`ALTER TABLE "sol_financial_transaction_child_metadata" DROP CONSTRAINT "FK_e0798c9a88bc9edb20f58d234c1"`);
        await queryRunner.query(`ALTER TABLE "portfolio_transactions" DROP CONSTRAINT "FK_3bfd0f7263e3d5d887cd297e52a"`);
        await queryRunner.query(`ALTER TABLE "portfolio_transactions" DROP CONSTRAINT "FK_04e0f8dfe47df6693fbf862e7c7"`);
        await queryRunner.query(`ALTER TABLE "portfolio_positions" DROP CONSTRAINT "FK_02516452071a2720a90a5815f91"`);
        await queryRunner.query(`ALTER TABLE "portfolio_positions" DROP CONSTRAINT "FK_9eeefb8ffda6e6a9a59b4256f49"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_sol_financial_transaction_parent_publicId_organizationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sol_financial_transaction_parent_organizationId_exportStatus"`);
        await queryRunner.query(`DROP TABLE "sol_financial_transaction_parent"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_sol_financial_transaction_child_publicId_organizationId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sol_fin_txn_child_toAddr_fromAddr_orgId_blockchainId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sol_fin_txn_child_hash"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sol_fin_txn_child_parent_id"`);
        await queryRunner.query(`DROP TABLE "sol_financial_transaction_child"`);
        await queryRunner.query(`DROP TABLE "sol_financial_transaction_child_metadata"`);
        await queryRunner.query(`DROP TYPE "public"."sol_financial_transaction_child_metadata_gain_loss_inclusion_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sol_financial_transaction_child_metadata_substatuses_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sol_financial_transaction_child_metadata_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_be84a46874e9acb45ad9259b32"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81c8b22b89d6d8ce4a41b005a6"`);
        await queryRunner.query(`DROP TABLE "portfolio_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."portfolio_transactions_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6adac8f6d591f7a1c828f0339f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_59c2c6ba98c3e640e53563d302"`);
        await queryRunner.query(`DROP TABLE "portfolio_positions"`);
    }

}
