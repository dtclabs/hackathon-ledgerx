import { MigrationInterface, QueryRunner } from "typeorm";

export class addMetadataToOrganizationIntegration1690432130681 implements MigrationInterface {
    name = 'addMetadataToOrganizationIntegration1690432130681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_integration" ADD "metadata" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_integration" DROP COLUMN "metadata"`);
    }

}
