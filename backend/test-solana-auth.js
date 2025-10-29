#!/usr/bin/env node

/**
 * Simple Solana Wallet Test Script
 * Run this to get access token for Postman testing
 */

const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');

async function testSolanaAuth() {
  console.log('🚀 Testing Solana Authentication...\n');
  
  try {
    // 1. Generate test wallet
    const keypair = Keypair.generate();
    const address = keypair.publicKey.toString();
    
    console.log('📝 Step 1: Generated test wallet');
    console.log('Address:', address);
    console.log('');
    
    // 2. Create/Get wallet and nonce
    console.log('📝 Step 2: Creating wallet...');
    const createWalletResponse = await fetch('https://api.30781337.com/providers/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: address,
        firstName: 'Test',
        lastName: 'Solana',
        agreementSignedAt: new Date().toISOString()
      })
    });
    
    if (!createWalletResponse.ok) {
      throw new Error(`Create wallet failed: ${createWalletResponse.status} ${createWalletResponse.statusText}`);
    }
    
    const walletData = await createWalletResponse.json();
    console.log('✅ Wallet created:', walletData);
    
    let nonce = walletData.nonce;
    
    // 3. Get nonce if not in create response
    if (!nonce) {
      console.log('📝 Step 3: Getting nonce...');
      const nonceResponse = await fetch(`https://api.30781337.com/providers/wallet/${address}`);
      
      if (!nonceResponse.ok) {
        throw new Error(`Get nonce failed: ${nonceResponse.status}`);
      }
      
      const nonceData = await nonceResponse.json();
      nonce = nonceData.nonce;
    }
    
    console.log('✅ Nonce:', nonce);
    console.log('');
    
    // 4. Sign message
    console.log('📝 Step 4: Signing message...');
    const messageBytes = new TextEncoder().encode(nonce);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    const signatureBase64 = Buffer.from(signature).toString('base64');
    
    console.log('✅ Signature created');
    console.log('');
    
    // 5. Authorize (login)
    console.log('📝 Step 5: Authorizing...');
    const authResponse = await fetch('https://api.30781337.com/auth/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: address,
        signature: signatureBase64,
        provider: 'wallet'
      })
    });
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Auth failed: ${authResponse.status} ${authResponse.statusText}\n${errorText}`);
    }
    
    const authData = await authResponse.json();
    
    console.log('🎉 SUCCESS! Authentication completed');
    console.log('');
    console.log('=' .repeat(60));
    console.log('📋 RESULTS FOR POSTMAN:');
    console.log('=' .repeat(60));
    console.log('');
    console.log('✅ Access Token:');
    console.log(authData.accessToken);
    console.log('');
    console.log('✅ Solana Address:');
    console.log(address);
    console.log('');
    console.log('✅ Nonce Message (for manual testing):');
    console.log(nonce);
    console.log('');
    console.log('✅ Signature (for manual testing):');
    console.log(signatureBase64);
    console.log('');
    console.log('=' .repeat(60));
    console.log('📝 HOW TO USE IN POSTMAN:');
    console.log('=' .repeat(60));
    console.log('1. Copy the Access Token above');
    console.log('2. Set it in Postman Environment variable "access_token"');
    console.log('3. Set the Solana Address in "solana_address" variable');
    console.log('4. Now you can test other endpoints with authentication!');
    console.log('');
    
    return {
      success: true,
      accessToken: authData.accessToken,
      address: address,
      nonce: nonce,
      signature: signatureBase64
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('1. Make sure backend server is running: npm run start:dev');
    console.log('2. Check if database is connected');
    console.log('3. Verify all dependencies are installed');
    
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  testSolanaAuth();
}

module.exports = { testSolanaAuth };