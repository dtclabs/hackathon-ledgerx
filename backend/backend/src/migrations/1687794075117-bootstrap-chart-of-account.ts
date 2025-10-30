import { MigrationInterface, QueryRunner } from "typeorm";

export class bootstrapChartOfAccount1687794075117 implements MigrationInterface {
    name = 'bootstrapChartOfAccount1687794075117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chart_of_account" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "code" integer NOT NULL, "type" character varying NOT NULL, "remote_id" character varying NOT NULL, "source" character varying NOT NULL, "status" character varying NOT NULL, "integration_name" character varying, "organization_id" bigint, "created_by" bigint, CONSTRAINT "UQ_11b695d02ec0c055dbed648885a" UNIQUE ("public_id"), CONSTRAINT "PK_365a21e0767428d1ca45472f57c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_chart_of_account_remoteId" ON "chart_of_account" ("remote_id") `);
        await queryRunner.query(`CREATE TABLE "integration_sync_request" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "requested_by" character varying NOT NULL, "requested_for" character varying NOT NULL, "status" character varying NOT NULL, "synced_at" TIMESTAMP NOT NULL, "integration_name" character varying, "organization_id" bigint, CONSTRAINT "PK_d3f06e926eb6776df29330c2b85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_metadata" ADD "coa_id" bigint`);
        await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum" RENAME TO "permission_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permission_resource_enum" AS ENUM('source_of_funds', 'transactions', 'transfers', 'invitations', 'recipients', 'categories', 'members', 'payment_links', 'financial_transactions', 'wallets', 'wallet_groups', 'assets', 'cryptocurrencies', 'settings', 'organizations', 'organization_integrations', 'integration_whitelist_requests', 'chart_of_accounts')`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum" USING "resource"::"text"::"public"."permission_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permission_resource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ADD CONSTRAINT "FK_6950e1bad45dedd831eca0c4a2c" FOREIGN KEY ("integration_name") REFERENCES "integration"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ADD CONSTRAINT "FK_3da761bcf6cd04c71008a1ab31e" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ADD CONSTRAINT "FK_18a42b2b911873a8f8f05c487f5" FOREIGN KEY ("created_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_metadata" ADD CONSTRAINT "FK_d10ee7caad116f26fe11be04a94" FOREIGN KEY ("coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "integration_sync_request" ADD CONSTRAINT "FK_a975f37720ac30f5e8cefbca16f" FOREIGN KEY ("integration_name") REFERENCES "integration"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "integration_sync_request" ADD CONSTRAINT "FK_7ce5a55c3229c4a07c8e7bbb153" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration_sync_request" DROP CONSTRAINT "FK_7ce5a55c3229c4a07c8e7bbb153"`);
        await queryRunner.query(`ALTER TABLE "integration_sync_request" DROP CONSTRAINT "FK_a975f37720ac30f5e8cefbca16f"`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_metadata" DROP CONSTRAINT "FK_d10ee7caad116f26fe11be04a94"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" DROP CONSTRAINT "FK_18a42b2b911873a8f8f05c487f5"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" DROP CONSTRAINT "FK_3da761bcf6cd04c71008a1ab31e"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" DROP CONSTRAINT "FK_6950e1bad45dedd831eca0c4a2c"`);
        await queryRunner.query(`CREATE TYPE "public"."permission_resource_enum_old" AS ENUM('assets', 'categories', 'cryptocurrencies', 'financial_transactions', 'integration_whitelist_request', 'invitations', 'members', 'organization_integration', 'organizations', 'payment_links', 'recipients', 'settings', 'source_of_funds', 'transactions', 'transfers', 'wallet_groups', 'wallets')`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum_old" USING "resource"::"text"::"public"."permission_resource_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum_old" RENAME TO "permission_resource_enum"`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_metadata" DROP COLUMN "coa_id"`);
        await queryRunner.query(`DROP TABLE "integration_sync_request"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_chart_of_account_remoteId"`);
        await queryRunner.query(`DROP TABLE "chart_of_account"`);
    }

}
