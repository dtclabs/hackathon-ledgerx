/**
 * Manual Testing Guide for Solana Wallet Authentication
 * 
 * Follow these steps to test the Solana wallet authentication manually
 */

import { Keypair } from '@solana/web3.js'
import * as nacl from 'tweetnacl'

// 1. Generate a test Solana keypair
export function generateTestSolanaWallet() {
  const keypair = Keypair.generate()
  
  console.log('=== Test Solana Wallet Generated ===')
  console.log('Address:', keypair.publicKey.toString())
  console.log('Private Key (for testing only):', Buffer.from(keypair.secretKey).toString('hex'))
  
  return {
    keypair,
    address: keypair.publicKey.toString(),
    secretKey: keypair.secretKey
  }
}

// 2. Sign a message with the test wallet
export function signMessageWithTestWallet(keypair: Keypair, message: string) {
  const messageBytes = new TextEncoder().encode(message)
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
  const signatureBase64 = Buffer.from(signature).toString('base64')
  
  console.log('=== Message Signed ===')
  console.log('Message:', message)
  console.log('Signature (base64):', signatureBase64)
  
  return signatureBase64
}

// 3. Test the complete flow
export async function testSolanaWalletFlow() {
  console.log('🚀 Starting Solana Wallet Authentication Test')
  console.log('=' .repeat(50))
  
  // Step 1: Generate test wallet
  const wallet = generateTestSolanaWallet()
  
  // Step 2: Test POST /providers/wallet (create wallet if not exists)
  console.log('\n📝 Step 1: Creating/Getting wallet...')
  try {
    const createWalletResponse = await fetch('https://api.30781337.com/api/v1/providers/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: wallet.address,
        name: 'test',
        firstName: 'Test',
        lastName: 'User',
        agreementSignedAt: new Date().toISOString()
      })
    })

    console.log('Create Wallet Response:', createWalletResponse.status, createWalletResponse.statusText)
    
    if (!createWalletResponse.ok) {
      throw new Error(`Failed to create wallet: ${createWalletResponse.statusText}`)
    }
    
    const walletData = await createWalletResponse.json()
    console.log('✅ Wallet created/retrieved:', walletData)
    
    // Try to use nonce from wallet creation response first
    let nonce = walletData.nonce || walletData.data?.nonce
    
    if (!nonce) {
      // Step 3: Get nonce for signing if not available from creation
      console.log('\n🔐 Step 2: Getting nonce...')
      const nonceResponse = await fetch(`https://api.30781337.com/api/v1/providers/wallet/${wallet.address}`)
      
      if (!nonceResponse.ok) {
        throw new Error(`Failed to get nonce: ${nonceResponse.statusText}`)
      }
      
      const nonceData = await nonceResponse.json()
      console.log('✅ Nonce response:', nonceData)
      
      // Extract nonce from response (handle different response structures)
      nonce = nonceData.nonce || nonceData.data?.nonce
    } else {
      console.log('\n🔐 Step 2: Using nonce from wallet creation response')
    }
    
    console.log('✅ Final nonce:', nonce)
    
    if (!nonce || typeof nonce !== 'string') {
      throw new Error('Failed to extract valid nonce from response')
    }
    
    // Step 4: Sign the message
    console.log('\n✍️  Step 3: Signing message...')
    const signature = signMessageWithTestWallet(wallet.keypair, nonce)
    
    // Step 5: Login with signature
    console.log('\n🔑 Step 4: Logging in...')
    const loginResponse = await fetch('https://api.30781337.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: wallet.address,
        signature: signature,
        token: '',
        provider: 'wallet'
      })
    })
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      throw new Error(`Login failed: ${loginResponse.statusText} - ${errorText}`)
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Login successful!')
    console.log('Access Token:', loginData.accessToken)
    console.log('Account:', loginData.account)
    
    return {
      success: true,
      wallet: wallet.address,
      accessToken: loginData.accessToken,
      account: loginData.account
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// 4. Test with invalid signature
export async function testInvalidSignature() {
  console.log('\n🧪 Testing invalid signature...')
  
  const wallet = generateTestSolanaWallet()
  
  try {
    // Create wallet first
    await fetch('https://api.30781337.com/api/v1/providers/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: wallet.address,
        name: 'test',
        firstName: 'Test',
        lastName: 'User',
        agreementSignedAt: new Date().toISOString()
      })
    })
    
    // Try login with invalid signature
    const loginResponse = await fetch('https://api.30781337.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: wallet.address,
        signature: 'invalid-signature',
        token: '',
        provider: 'wallet'
      })
    })
    
    if (loginResponse.ok) {
      console.log('❌ Test failed: Invalid signature was accepted')
      return false
    } else {
      console.log('✅ Test passed: Invalid signature was rejected')
      return true
    }
    
  } catch (error) {
    console.log('✅ Test passed: Invalid signature caused error as expected')
    return true
  }
}

// 5. Run all tests
export async function runAllTests() {
  console.log('🎯 Running All Solana Wallet Tests')
  console.log('=' .repeat(60))
  
  console.log('\n🧪 Test 1: Valid Solana Wallet Flow')
  const validTest = await testSolanaWalletFlow()
  
  console.log('\n🧪 Test 2: Invalid Signature')
  const invalidTest = await testInvalidSignature()
  
  console.log('\n📊 Test Results:')
  console.log('Valid flow:', validTest.success ? '✅ PASSED' : '❌ FAILED')
  console.log('Invalid signature:', invalidTest ? '✅ PASSED' : '❌ FAILED')
  
  return {
    validFlow: validTest.success,
    invalidSignature: invalidTest
  }
}

// Export for manual testing
if (require.main === module) {
  runAllTests().catch(console.error)
}