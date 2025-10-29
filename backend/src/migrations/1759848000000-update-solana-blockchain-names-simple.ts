import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSolanaBlockchainNamesSimple1759848000000 implements MigrationInterface {
    name = 'UpdateSolanaBlockchainNamesSimple1759848000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Starting Solana blockchain name update...');
        
        // 1. Check if blockchain table exists
        const blockchainTableExists = await this.tableExists(queryRunner, 'blockchain');
        
        if (blockchainTableExists) {
            console.log('✅ Blockchain table found, updating records...');
            
            // Update blockchain public_ids from 'solana-mainnet' to 'solana'
            const result = await queryRunner.query(`
                UPDATE "blockchain" 
                SET "public_id" = 'solana' 
                WHERE "public_id" = 'solana-mainnet'
                RETURNING "public_id"
            `);
            
            console.log(`✅ Updated ${result.length} blockchain record(s)`);
        } else {
            console.log('⚠️  Blockchain table not found, skipping blockchain update');
        }

        // 2. Check if wallet table exists
        const walletTableExists = await this.tableExists(queryRunner, 'wallet');
        
        if (walletTableExists) {
            console.log('✅ Wallet table found, updating supported_blockchains...');
            
            // Update wallet supported_blockchains JSON field
            const walletResult = await queryRunner.query(`
                UPDATE "wallet" 
                SET "supported_blockchains" = replace("supported_blockchains"::text, '"solana-mainnet"', '"solana"')::json
                WHERE "supported_blockchains"::text LIKE '%"solana-mainnet"%'
                RETURNING "id"
            `);
            
            console.log(`✅ Updated ${walletResult.length} wallet record(s)`);
        } else {
            console.log('⚠️  Wallet table not found, skipping wallet update');
        }

        // 3. Handle other tables dynamically (optional)
        try {
            const otherTables = await this.findTablesWithBlockchainId(queryRunner);
            
            for (const tableName of otherTables) {
                console.log(`🔄 Updating table: ${tableName}`);
                
                const updateResult = await queryRunner.query(`
                    UPDATE "${tableName}" 
                    SET "blockchain_id" = 'solana'
                    WHERE "blockchain_id" = 'solana-mainnet'
                    RETURNING "id"
                `);
                
                console.log(`✅ Updated ${updateResult.length} record(s) in ${tableName}`);
            }
        } catch (error) {
            console.log('⚠️  Error updating other tables (non-critical):', error.message);
        }

        console.log('🎉 Migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Reverting Solana blockchain name changes...');
        
        // Revert blockchain table
        const blockchainTableExists = await this.tableExists(queryRunner, 'blockchain');
        
        if (blockchainTableExists) {
            await queryRunner.query(`
                UPDATE "blockchain" 
                SET "public_id" = 'solana-mainnet' 
                WHERE "public_id" = 'solana'
            `);
            console.log('✅ Reverted blockchain table');
        }

        // Revert wallet table
        const walletTableExists = await this.tableExists(queryRunner, 'wallet');
        
        if (walletTableExists) {
            await queryRunner.query(`
                UPDATE "wallet" 
                SET "supported_blockchains" = replace("supported_blockchains"::text, '"solana"', '"solana-mainnet"')::json
                WHERE "supported_blockchains"::text LIKE '%"solana"%'
                AND "supported_blockchains"::text NOT LIKE '%"solana-devnet"%'
            `);
            console.log('✅ Reverted wallet table');
        }

        // Revert other tables
        try {
            const otherTables = await this.findTablesWithBlockchainId(queryRunner);
            
            for (const tableName of otherTables) {
                await queryRunner.query(`
                    UPDATE "${tableName}" 
                    SET "blockchain_id" = 'solana-mainnet'
                    WHERE "blockchain_id" = 'solana'
                `);
            }
            console.log('✅ Reverted other tables');
        } catch (error) {
            console.log('⚠️  Error reverting other tables (non-critical):', error.message);
        }

        console.log('🎉 Revert completed successfully!');
    }

    private async tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
        try {
            const result = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = '${tableName}'
                );
            `);
            return result[0].exists;
        } catch (error) {
            console.log(`⚠️  Error checking if table ${tableName} exists:`, error.message);
            return false;
        }
    }

    private async findTablesWithBlockchainId(queryRunner: QueryRunner): Promise<string[]> {
        try {
            const result = await queryRunner.query(`
                SELECT DISTINCT table_name 
                FROM information_schema.columns 
                WHERE column_name = 'blockchain_id' 
                AND table_schema = 'public'
                AND table_name NOT IN ('blockchain', 'wallet')
            `);
            return result.map(row => row.table_name);
        } catch (error) {
            console.log('⚠️  Error finding tables with blockchain_id:', error.message);
            return [];
        }
    }
}