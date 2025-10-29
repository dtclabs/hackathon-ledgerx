-- SQL script to ensure required cryptocurrencies exist for Solana testing
-- Run this in your PostgreSQL database before generating test data

-- Insert SOL (Solana native token) if it doesn't exist
INSERT INTO cryptocurrency (name, symbol, coingecko_id, is_verified, image)
SELECT 'Solana', 'SOL', 'solana', true, 
  '{"thumb": "https://assets.coingecko.com/coins/images/4128/thumb/solana.png", "small": "https://assets.coingecko.com/coins/images/4128/small/solana.png", "large": "https://assets.coingecko.com/coins/images/4128/large/solana.png"}'::json
WHERE NOT EXISTS (SELECT 1 FROM cryptocurrency WHERE symbol = 'SOL');

-- Insert USDC if it doesn't exist
INSERT INTO cryptocurrency (name, symbol, coingecko_id, is_verified, image)
SELECT 'USD Coin', 'USDC', 'usd-coin', true,
  '{"thumb": "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png", "small": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png", "large": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png"}'::json
WHERE NOT EXISTS (SELECT 1 FROM cryptocurrency WHERE symbol = 'USDC');

-- Insert BONK (meme token for testing) if it doesn't exist
INSERT INTO cryptocurrency (name, symbol, coingecko_id, is_verified, image)
SELECT 'Bonk', 'BONK', 'bonk', true,
  '{"thumb": "https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpg", "small": "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg", "large": "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg"}'::json
WHERE NOT EXISTS (SELECT 1 FROM cryptocurrency WHERE symbol = 'BONK');

-- Add Solana blockchain addresses for these tokens
-- First, add SOL address (SOL is the native coin)
INSERT INTO cryptocurrency_address (cryptocurrency_id, blockchain_id, address, type, decimal)
SELECT c.id, 'solana', 'So11111111111111111111111111111111111111112', 'Coin', 9
FROM cryptocurrency c
WHERE c.symbol = 'SOL'
ON CONFLICT (address, type, blockchain_id) DO NOTHING;

-- Add USDC address (USDC is a token)
INSERT INTO cryptocurrency_address (cryptocurrency_id, blockchain_id, address, type, decimal)
SELECT c.id, 'solana', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'Token', 6
FROM cryptocurrency c
WHERE c.symbol = 'USDC'
ON CONFLICT (address, type, blockchain_id) DO NOTHING;

-- Add BONK address (BONK is a token)
INSERT INTO cryptocurrency_address (cryptocurrency_id, blockchain_id, address, type, decimal)
SELECT c.id, 'solana', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'Token', 5
FROM cryptocurrency c
WHERE c.symbol = 'BONK'
ON CONFLICT (address, type, blockchain_id) DO NOTHING;

-- Verify the data
SELECT 
  c.symbol,
  c.name,
  ca.address,
  ca.blockchain_id
FROM cryptocurrency c
LEFT JOIN cryptocurrency_address ca ON c.id = ca.cryptocurrency_id AND ca.blockchain_id = 'solana'
WHERE c.symbol IN ('SOL', 'USDC', 'BONK')
ORDER BY c.symbol;