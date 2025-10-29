import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSolanaBlockchains1759847885580 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add Solana Mainnet
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
                'solana-mainnet', 
                'Solana Mainnet', 
                'mainnet-beta', 
                'true', 
                'false', 
                'https://solscan.io/', 
                'https://api.mainnet-beta.solana.com', 
                'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/solana.png'
            )
        `);
        
        // Add Solana Devnet (optional, for testing)
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove Solana blockchains
        await queryRunner.query(`DELETE FROM "blockchain" WHERE "public_id" IN ('solana-mainnet', 'solana-devnet')`);
        
        // Note: PostgreSQL doesn't support removing values from enums directly
        // You would need to recreate the enum if you want to remove 'sol'
        // For this demo, we'll leave the enum value as it doesn't hurt to have it
    }

}
