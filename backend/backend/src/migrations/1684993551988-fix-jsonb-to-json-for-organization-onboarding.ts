import { MigrationInterface, QueryRunner } from "typeorm";

export class fixJsonbToJsonForOrganizationOnboarding1684993551988 implements MigrationInterface {
    name = 'fixJsonbToJsonForOrganizationOnboarding1684993551988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_onboarding" DROP COLUMN "contact"`);
        await queryRunner.query(`ALTER TABLE "organization_onboarding" ADD "contact" json NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_onboarding" DROP COLUMN "contact"`);
        await queryRunner.query(`ALTER TABLE "organization_onboarding" ADD "contact" jsonb NOT NULL`);
    }

}
