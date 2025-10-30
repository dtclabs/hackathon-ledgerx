import { MigrationInterface, QueryRunner } from 'typeorm'

export class onboardingApiTables1687174785400 implements MigrationInterface {
  name = 'onboardingApiTables1687174785400'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "integration" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "merge_id" character varying NOT NULL, "display_name" character varying NOT NULL, "image" character varying, "status" character varying NOT NULL, "website" character varying, "important_links" character varying, CONSTRAINT "UQ_52d7fa32a7832b377fc2d7f6199" UNIQUE ("name"), CONSTRAINT "UQ_edb545ad7e2276157bfba86b471" UNIQUE ("merge_id"), CONSTRAINT "PK_f348d4694945d9dc4c7049a178a" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "integration_whitelist_request" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "requested_by" character varying NOT NULL, "addressed_by" character varying, "comment" character varying, "contact_email" character varying NOT NULL, "status" character varying NOT NULL, "integration_name" character varying, "organization_id" bigint, CONSTRAINT "PK_1cbade3c462b94fc28c6346cc7a" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_integration_whitelist_request_integrationName_organizationId" ON "integration_whitelist_request" ("integration_name", "organization_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "organization_integration" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" character varying NOT NULL, "integration_name" character varying, "organization_id" bigint, CONSTRAINT "PK_ef609299d3cb01e76683624e433" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_organization_integration_integrationName_organizationId" ON "organization_integration" ("integration_name", "organization_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "organization_integration_auth" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "account_token" character varying NOT NULL, "metadata" character varying, "organization_integration_id" bigint, CONSTRAINT "REL_d664a2472b9df382afce46b648" UNIQUE ("organization_integration_id"), CONSTRAINT "PK_36a01f41b29c9975b3ca039f95d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum" RENAME TO "permission_resource_enum_old"`)
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum" AS ENUM('source_of_funds', 'transactions', 'transfers', 'invitations', 'recipients', 'categories', 'members', 'payment_links', 'financial_transactions', 'wallets', 'wallet_groups', 'assets', 'cryptocurrencies', 'settings', 'organizations', 'organization_integration', 'integration_whitelist_request')`
    )
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum" USING "resource"::"text"::"public"."permission_resource_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum_old"`)
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "files"`)
    await queryRunner.query(`ALTER TABLE "transaction" ADD "files" text`)
    await queryRunner.query(
      `ALTER TABLE "integration_whitelist_request" ADD CONSTRAINT "FK_97529e8fe37bf8172231745be1f" FOREIGN KEY ("integration_name") REFERENCES "integration"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_whitelist_request" ADD CONSTRAINT "FK_78c08745c2363b596484635b012" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_integration" ADD CONSTRAINT "FK_c0bcb72abfec509b97b30db0c10" FOREIGN KEY ("integration_name") REFERENCES "integration"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_integration" ADD CONSTRAINT "FK_dc230d1dccea090ea4d6bc0f583" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "organization_integration_auth" ADD CONSTRAINT "FK_d664a2472b9df382afce46b6487" FOREIGN KEY ("organization_integration_id") REFERENCES "organization_integration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_integration_auth" DROP CONSTRAINT "FK_d664a2472b9df382afce46b6487"`
    )
    await queryRunner.query(`ALTER TABLE "organization_integration" DROP CONSTRAINT "FK_dc230d1dccea090ea4d6bc0f583"`)
    await queryRunner.query(`ALTER TABLE "organization_integration" DROP CONSTRAINT "FK_c0bcb72abfec509b97b30db0c10"`)
    await queryRunner.query(
      `ALTER TABLE "integration_whitelist_request" DROP CONSTRAINT "FK_78c08745c2363b596484635b012"`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_whitelist_request" DROP CONSTRAINT "FK_97529e8fe37bf8172231745be1f"`
    )
    await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "files"`)
    await queryRunner.query(`ALTER TABLE "transaction" ADD "files" text array`)
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum_old" AS ENUM('assets', 'categories', 'cryptocurrencies', 'financial_transactions', 'invitations', 'members', 'organizations', 'payment_links', 'recipients', 'settings', 'source_of_funds', 'transactions', 'transfers', 'wallet_groups', 'wallets')`
    )
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum_old" USING "resource"::"text"::"public"."permission_resource_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum_old" RENAME TO "permission_resource_enum"`)
    await queryRunner.query(`DROP TABLE "organization_integration_auth"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_organization_integration_integrationName_organizationId"`)
    await queryRunner.query(`DROP TABLE "organization_integration"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_integration_whitelist_request_integrationName_organizationId"`)
    await queryRunner.query(`DROP TABLE "integration_whitelist_request"`)
    await queryRunner.query(`DROP TABLE "integration"`)
  }
}
