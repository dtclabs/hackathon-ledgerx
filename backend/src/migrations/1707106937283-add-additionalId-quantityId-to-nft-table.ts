import { MigrationInterface, QueryRunner } from "typeorm";

export class addAdditionalIdQuantityIdToNftTable1707106937283 implements MigrationInterface {
    name = 'addAdditionalIdQuantityIdToNftTable1707106937283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_nft_organization_sourceId"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "source_additional_id" character varying`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "quantity_id" integer`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_nft_organization_sourceId_additionalId" ON "nft" ("organization_id", "source_id", "source_additional_id", "quantity_id") WHERE "deleted_at" IS NULL AND "source_additional_id" IS NOT NULL AND "quantity_id" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_nft_organization_sourceId_additionalIdNull" ON "nft" ("organization_id", "source_id") WHERE "deleted_at" IS NULL AND "source_additional_id" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_nft_organization_sourceId_additionalIdNull"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_nft_organization_sourceId_additionalId"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "quantity_id"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP COLUMN "source_additional_id"`);
        await queryRunner.query(`ALTER TABLE "nft" ADD "amount" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_nft_organization_sourceId" ON "nft" ("source_id", "organization_id") WHERE (deleted_at IS NULL)`);
    }

}
