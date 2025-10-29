import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCryptocurrencyImageUrls1760366422171 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update cryptocurrency images to use CoinGecko public URLs instead of private S3 URLs
        
        // Bitcoin (BTC)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", "small": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"}'::json
            WHERE symbol = 'BTC'
        `);

        // Ethereum (ETH)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/279/large/ethereum.png", "small": "https://assets.coingecko.com/coins/images/279/small/ethereum.png", "thumb": "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png"}'::json
            WHERE symbol = 'ETH'
        `);

        // USD Coin (USDC)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png", "small": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png", "thumb": "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png"}'::json
            WHERE symbol = 'USDC'
        `);

        // Tether (USDT)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/325/large/Tether.png", "small": "https://assets.coingecko.com/coins/images/325/small/Tether.png", "thumb": "https://assets.coingecko.com/coins/images/325/thumb/Tether.png"}'::json
            WHERE symbol = 'USDT'
        `);

        // BNB (Binance Coin)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", "small": "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", "thumb": "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"}'::json
            WHERE symbol = 'BNB'
        `);

        // Solana (SOL)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/4128/large/solana.png", "small": "https://assets.coingecko.com/coins/images/4128/small/solana.png", "thumb": "https://assets.coingecko.com/coins/images/4128/thumb/solana.png"}'::json
            WHERE symbol = 'SOL'
        `);

        // Cardano (ADA)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/975/large/cardano.png", "small": "https://assets.coingecko.com/coins/images/975/small/cardano.png", "thumb": "https://assets.coingecko.com/coins/images/975/thumb/cardano.png"}'::json
            WHERE symbol = 'ADA'
        `);

        // XRP (XRP)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", "small": "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", "thumb": "https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png"}'::json
            WHERE symbol = 'XRP'
        `);

        // Dogecoin (DOGE)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", "small": "https://assets.coingecko.com/coins/images/5/small/dogecoin.png", "thumb": "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png"}'::json
            WHERE symbol = 'DOGE'
        `);

        // Avalanche (AVAX)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png", "small": "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png", "thumb": "https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png"}'::json
            WHERE symbol = 'AVAX'
        `);

        // Chainlink (LINK)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png", "small": "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png", "thumb": "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png"}'::json
            WHERE symbol = 'LINK'
        `);

        // BONK (Bonk)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg", "small": "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg", "thumb": "https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpg"}'::json
            WHERE symbol = 'BONK'
        `);

        // Jupiter (JUP)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/34188/large/jup.png", "small": "https://assets.coingecko.com/coins/images/34188/small/jup.png", "thumb": "https://assets.coingecko.com/coins/images/34188/thumb/jup.png"}'::json
            WHERE symbol = 'JUP'
        `);

        // Polygon (MATIC)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png", "small": "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png", "thumb": "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png"}'::json
            WHERE symbol = 'MATIC'
        `);

        // Polkadot (DOT)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/12171/large/polkadot.png", "small": "https://assets.coingecko.com/coins/images/12171/small/polkadot.png", "thumb": "https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png"}'::json
            WHERE symbol = 'DOT'
        `);

        // Litecoin (LTC)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/2/large/litecoin.png", "small": "https://assets.coingecko.com/coins/images/2/small/litecoin.png", "thumb": "https://assets.coingecko.com/coins/images/2/thumb/litecoin.png"}'::json
            WHERE symbol = 'LTC'
        `);

        // === SOLANA ECOSYSTEM TOKENS ===

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

        // Mango Markets (MNGO)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/17119/large/mango.png", "small": "https://assets.coingecko.com/coins/images/17119/small/mango.png", "thumb": "https://assets.coingecko.com/coins/images/17119/thumb/mango.png"}'::json
            WHERE symbol = 'MNGO'
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

        // Render Token (RNDR) - also on Solana
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/11636/large/rndr.png", "small": "https://assets.coingecko.com/coins/images/11636/small/rndr.png", "thumb": "https://assets.coingecko.com/coins/images/11636/thumb/rndr.png"}'::json
            WHERE symbol = 'RNDR'
        `);

        // Solend (SLND)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/21841/large/solend.png", "small": "https://assets.coingecko.com/coins/images/21841/small/solend.png", "thumb": "https://assets.coingecko.com/coins/images/21841/thumb/solend.png"}'::json
            WHERE symbol = 'SLND'
        `);

        // Star Atlas (ATLAS)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/17659/large/Icon_Reverse.png", "small": "https://assets.coingecko.com/coins/images/17659/small/Icon_Reverse.png", "thumb": "https://assets.coingecko.com/coins/images/17659/thumb/Icon_Reverse.png"}'::json
            WHERE symbol = 'ATLAS'
        `);

        // Star Atlas DAO (POLIS)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/17658/large/POLIS.png", "small": "https://assets.coingecko.com/coins/images/17658/small/POLIS.png", "thumb": "https://assets.coingecko.com/coins/images/17658/thumb/POLIS.png"}'::json
            WHERE symbol = 'POLIS'
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

        // Drift Protocol (DRIFT)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/33629/large/drift.png", "small": "https://assets.coingecko.com/coins/images/33629/small/drift.png", "thumb": "https://assets.coingecko.com/coins/images/33629/thumb/drift.png"}'::json
            WHERE symbol = 'DRIFT'
        `);

        // Helium (HNT) - migrated to Solana
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/4284/large/Helium_HNT.png", "small": "https://assets.coingecko.com/coins/images/4284/small/Helium_HNT.png", "thumb": "https://assets.coingecko.com/coins/images/4284/thumb/Helium_HNT.png"}'::json
            WHERE symbol = 'HNT'
        `);

        // Helium Mobile (MOBILE)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/27045/large/mobile.png", "small": "https://assets.coingecko.com/coins/images/27045/small/mobile.png", "thumb": "https://assets.coingecko.com/coins/images/27045/thumb/mobile.png"}'::json
            WHERE symbol = 'MOBILE'
        `);

        // Helium IOT (IOT)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/32693/large/helium-iot.png", "small": "https://assets.coingecko.com/coins/images/32693/small/helium-iot.png", "thumb": "https://assets.coingecko.com/coins/images/32693/thumb/helium-iot.png"}'::json
            WHERE symbol = 'IOT'
        `);

        // Wormhole (W)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/35087/large/wormhole.png", "small": "https://assets.coingecko.com/coins/images/35087/small/wormhole.png", "thumb": "https://assets.coingecko.com/coins/images/35087/thumb/wormhole.png"}'::json
            WHERE symbol = 'W'
        `);

        // Kamino (KMNO)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/35118/large/kamino.png", "small": "https://assets.coingecko.com/coins/images/35118/small/kamino.png", "thumb": "https://assets.coingecko.com/coins/images/35118/thumb/kamino.png"}'::json
            WHERE symbol = 'KMNO'
        `);

        // Sanctum (CLOUD)
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/35219/large/sanctum.png", "small": "https://assets.coingecko.com/coins/images/35219/small/sanctum.png", "thumb": "https://assets.coingecko.com/coins/images/35219/thumb/sanctum.png"}'::json
            WHERE symbol = 'CLOUD'
        `);

        // === ADDITIONAL SOLANA MEME TOKENS & TRENDING COINS ===

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

        // === FALLBACK FOR UNKNOWN TOKENS ===
        // Update any remaining tokens that don't have images with a generic Solana token placeholder
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = '{"large": "https://assets.coingecko.com/coins/images/4128/large/solana.png", "small": "https://assets.coingecko.com/coins/images/4128/small/solana.png", "thumb": "https://assets.coingecko.com/coins/images/4128/thumb/solana.png"}'::json
            WHERE image IS NULL 
            AND (
                name ILIKE '%solana%' 
                OR name ILIKE '%sol-%'
                OR EXISTS (
                    SELECT 1 FROM cryptocurrency_address ca 
                    INNER JOIN blockchain b ON ca.blockchain_id = b.id 
                    WHERE ca.cryptocurrency_id = cryptocurrency.id 
                    AND b.public_id = 'solana'
                )
            )
        `);

        console.log('✅ Updated cryptocurrency images to use CoinGecko URLs (including all Solana ecosystem tokens and meme coins)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes by setting images back to null or original S3 URLs
        // Note: This is a simplified rollback - in production, you might want to backup original URLs
        
        await queryRunner.query(`
            UPDATE cryptocurrency 
            SET image = NULL
            WHERE symbol IN (
                'BTC', 'ETH', 'USDC', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE', 'AVAX', 'LINK', 'BONK', 'JUP', 'MATIC', 'DOT', 'LTC',
                'wSOL', 'SRM', 'RAY', 'ORCA', 'MNGO', 'PYTH', 'JTO', 'RNDR', 'SLND', 'ATLAS', 'POLIS', 'mSOL', 'stSOL', 
                'DRIFT', 'HNT', 'MOBILE', 'IOT', 'W', 'KMNO', 'CLOUD', 'FARTCOIN', 'PBTC', 'ZENAI', 'MOONPIG', 'KLED', 'DIS'
            )
            OR (
                image IS NOT NULL 
                AND (
                    name ILIKE '%solana%' 
                    OR name ILIKE '%sol-%'
                    OR EXISTS (
                        SELECT 1 FROM cryptocurrency_address ca 
                        INNER JOIN blockchain b ON ca.blockchain_id = b.id 
                        WHERE ca.cryptocurrency_id = cryptocurrency.id 
                        AND b.public_id = 'solana'
                    )
                )
            )
        `);

        console.log('⏪ Reverted cryptocurrency images (including all Solana ecosystem tokens and meme coins)');
    }

}
