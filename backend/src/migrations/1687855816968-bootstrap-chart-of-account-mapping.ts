import { MigrationInterface, QueryRunner } from "typeorm";

export class bootstrapChartOfAccountMapping1687855816968 implements MigrationInterface {
    name = 'bootstrapChartOfAccountMapping1687855816968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chart_of_account_mapping" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "organization_id" bigint, "chart_of_account_id" bigint, "wallet_id" bigint, "cryptocurrency_id" bigint, CONSTRAINT "UQ_a022b0b4c9aa067435792c2b49b" UNIQUE ("public_id"), CONSTRAINT "PK_f99004806bddadb10fc2ae738a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_coa_map_organization" ON "chart_of_account_mapping" ("organization_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum" RENAME TO "permission_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permission_resource_enum" AS ENUM('source_of_funds', 'transactions', 'transfers', 'invitations', 'recipients', 'categories', 'members', 'payment_links', 'financial_transactions', 'wallets', 'wallet_groups', 'assets', 'cryptocurrencies', 'settings', 'organizations', 'organization_integrations', 'integration_whitelist_requests', 'chart_of_accounts', 'chart_of_account_mappings')`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum" USING "resource"::"text"::"public"."permission_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permission_resource_enum_old"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "remote_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" ADD CONSTRAINT "FK_342d891009250f46a484d962a27" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" ADD CONSTRAINT "FK_50ccf5e7b88f245f4942165d960" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" ADD CONSTRAINT "FK_ad563a663019e25cf946b25b368" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" ADD CONSTRAINT "FK_0d9a45a0b1ba469ac962fc79e24" FOREIGN KEY ("cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP CONSTRAINT "FK_0d9a45a0b1ba469ac962fc79e24"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP CONSTRAINT "FK_ad563a663019e25cf946b25b368"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP CONSTRAINT "FK_50ccf5e7b88f245f4942165d960"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP CONSTRAINT "FK_342d891009250f46a484d962a27"`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "remote_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."permission_resource_enum_old" AS ENUM('source_of_funds', 'transactions', 'transfers', 'invitations', 'recipients', 'categories', 'members', 'payment_links', 'financial_transactions', 'wallets', 'wallet_groups', 'assets', 'cryptocurrencies', 'settings', 'organizations', 'organization_integrations', 'integration_whitelist_requests', 'chart_of_accounts')`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum_old" USING "resource"::"text"::"public"."permission_resource_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum_old" RENAME TO "permission_resource_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_coa_map_organization"`);
        await queryRunner.query(`DROP TABLE "chart_of_account_mapping"`);
    }

}
