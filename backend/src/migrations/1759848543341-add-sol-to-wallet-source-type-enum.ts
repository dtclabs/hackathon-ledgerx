import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSolToWalletSourceTypeEnum1759848543341 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'sol' to wallet_source_type_enum
        await queryRunner.query(`
            ALTER TYPE wallet_source_type_enum ADD VALUE 'sol';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing values from enums directly
        // You would need to recreate the enum if you want to remove 'sol'
        // For this demo, we'll leave the enum value as it doesn't hurt to have it
    }

}
