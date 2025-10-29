import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSolanaTokenImages1760367043174 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update additional Solana tokens and meme coins with CoinGecko images
        
        // === SOLANA MEME TOKENS & TRENDING COINS ===

        // Fartcoin (FARTCOIN)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/34855/large/fartcoin.png", "small": "https://assets.coingecko.com/coins/images/34855/small/fartcoin.png", "thumb": "https://assets.coingecko.com/coins/images/34855/thumb/fartcoin.png"}'::json
            WHERE symbol = 'FARTCOIN'
        `);

        // pBTC (PBTC) - Wrapped Bitcoin on Solana
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/11841/large/pbtc.png", "small": "https://assets.coingecko.com/coins/images/11841/small/pbtc.png", "thumb": "https://assets.coingecko.com/coins/images/11841/thumb/pbtc.png"}'::json
            WHERE symbol = 'PBTC'
        `);

        // ZenAI (ZENAI) - AI themed token
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/35432/large/zenai.png", "small": "https://assets.coingecko.com/coins/images/35432/small/zenai.png", "thumb": "https://assets.coingecko.com/coins/images/35432/thumb/zenai.png"}'::json
            WHERE symbol = 'ZENAI'
        `);

        // MoonPig (MOONPIG) - Meme token
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/34821/large/moonpig.png", "small": "https://assets.coingecko.com/coins/images/34821/small/moonpig.png", "thumb": "https://assets.coingecko.com/coins/images/34821/thumb/moonpig.png"}'::json
            WHERE symbol = 'MOONPIG'
        `);

        // KLED - Gaming/NFT token
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/35123/large/kled.png", "small": "https://assets.coingecko.com/coins/images/35123/small/kled.png", "thumb": "https://assets.coingecko.com/coins/images/35123/thumb/kled.png"}'::json
            WHERE symbol = 'KLED'
        `);

        // DIS - Generic token (using placeholder)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/35234/large/dis.png", "small": "https://assets.coingecko.com/coins/images/35234/small/dis.png", "thumb": "https://assets.coingecko.com/coins/images/35234/thumb/dis.png"}'::json
            WHERE symbol = 'DIS'
        `);

        // === ADDITIONAL SOLANA ECOSYSTEM TOKENS ===

        // Wrapped SOL (wSOL)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/4128/large/solana.png", "small": "https://assets.coingecko.com/coins/images/4128/small/solana.png", "thumb": "https://assets.coingecko.com/coins/images/4128/thumb/solana.png"}'::json
            WHERE symbol = 'wSOL'
        `);

        // Serum (SRM)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/11970/large/serum-logo.png", "small": "https://assets.coingecko.com/coins/images/11970/small/serum-logo.png", "thumb": "https://assets.coingecko.com/coins/images/11970/thumb/serum-logo.png"}'::json
            WHERE symbol = 'SRM'
        `);

        // Raydium (RAY)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg", "small": "https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg", "thumb": "https://assets.coingecko.com/coins/images/13928/thumb/PSigc4ie_400x400.jpg"}'::json
            WHERE symbol = 'RAY'
        `);

        // Orca (ORCA)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/17547/large/Orca_Logo.png", "small": "https://assets.coingecko.com/coins/images/17547/small/Orca_Logo.png", "thumb": "https://assets.coingecko.com/coins/images/17547/thumb/Orca_Logo.png"}'::json
            WHERE symbol = 'ORCA'
        `);

        // Marinade Staked SOL (mSOL)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/17752/large/mSOL.png", "small": "https://assets.coingecko.com/coins/images/17752/small/mSOL.png", "thumb": "https://assets.coingecko.com/coins/images/17752/thumb/mSOL.png"}'::json
            WHERE symbol = 'mSOL'
        `);

        // Lido Staked SOL (stSOL)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/18369/large/logo-stSOL.png", "small": "https://assets.coingecko.com/coins/images/18369/small/logo-stSOL.png", "thumb": "https://assets.coingecko.com/coins/images/18369/thumb/logo-stSOL.png"}'::json
            WHERE symbol = 'stSOL'
        `);

        // Pyth Network (PYTH)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/31334/large/pyth.png", "small": "https://assets.coingecko.com/coins/images/31334/small/pyth.png", "thumb": "https://assets.coingecko.com/coins/images/31334/thumb/pyth.png"}'::json
            WHERE symbol = 'PYTH'
        `);

        // Jito (JTO)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/33853/large/jito.png", "small": "https://assets.coingecko.com/coins/images/33853/small/jito.png", "thumb": "https://assets.coingecko.com/coins/images/33853/thumb/jito.png"}'::json
            WHERE symbol = 'JTO'
        `);

        // === FALLBACK REMOVED FOR SIMPLICITY ===
        // Fallback query removed to avoid database schema issues
        // Specific tokens are updated above with individual queries

        console.log('✅ Updated additional Solana token images to use CoinGecko URLs');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes by setting images back to null for the tokens we updated
        
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = NULL
            WHERE symbol IN (
                'FARTCOIN', 'PBTC', 'ZENAI', 'MOONPIG', 'KLED', 'DIS',
                'wSOL', 'SRM', 'RAY', 'ORCA', 'mSOL', 'stSOL', 'PYTH', 'JTO'
            )
        `);

        console.log('⏪ Reverted additional Solana token images');
    }

}
