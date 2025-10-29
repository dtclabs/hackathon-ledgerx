import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSolanaBlockchainIds1759847885581 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update solana-mainnet to solana
        await queryRunner.query(`
            UPDATE "blockchain" 
            SET "public_id" = 'solana', "name" = 'Solana', "chain_id" = 'solana'
            WHERE "public_id" = 'solana-mainnet'
        `);
        
        // Remove solana-devnet if exists
        await queryRunner.query(`
            DELETE FROM "blockchain" WHERE "public_id" = 'solana-devnet'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to original names
        await queryRunner.query(`
            UPDATE "blockchain" 
            SET "public_id" = 'solana-mainnet', "name" = 'Solana Mainnet', "chain_id" = 'mainnet-beta'
            WHERE "public_id" = 'solana'
        `);
        
        // Re-add solana-devnet
        await queryRunner.query(`
            INSERT INTO "blockchain" (
                "public_id", 
                "name", 
                "chain_id", 
                "is_enabled", 
                "is_testnet", 
                "block_explorer", 
                "api_url", 
                "image_url"
            ) VALUES (
                'solana-devnet', 
                'Solana Devnet', 
                'devnet', 
                'false', 
                'true', 
                'https://solscan.io/', 
                'https://api.devnet.solana.com', 
                'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/solana.png'
            )
        `);
    }

}