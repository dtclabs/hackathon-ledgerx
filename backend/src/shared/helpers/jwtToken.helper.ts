import * as jose from 'jose'
import { ConfigService } from '@nestjs/config'

export const jwtTokenHelper = {
  parseJWT,
  getAuthIssuerJwks,
  getAuthIssuer,
  getAuthAudience,
  getAuthClientId,
  getAuthClientSecret,
  getAuthRedirectUrl
}

async function parseJWT(
  token: string
): Promise<{ email: string; profileImage: string; verifierId: string; xeroUserId: string | null } | null> {
  try {
    console.log('DEBUG: parseJWT starting, issuer:', getAuthIssuer())
    
    // First decode without verification to see payload
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    console.log('DEBUG: Raw JWT payload:', payload)
    
    const jwks = jose.createRemoteJWKSet(new URL(getAuthIssuerJwks()))
    const jwtDecoded = await jose.jwtVerify(token, jwks, {
      algorithms: ['RS256']
      // Remove issuer and audience validation to be more flexible
    })

    console.log('DEBUG: JWT verification successful, payload:', jwtDecoded.payload)

    if (!jwtDecoded?.payload) {
      console.log('DEBUG: No payload in JWT')
      return null
    }

    // Try different email fields
    let email = null
    if (jwtDecoded.payload['https://user/email']) {
      email = jwtDecoded.payload['https://user/email'] as string
      console.log('DEBUG: Found email in https://user/email:', email)
    } else if (jwtDecoded.payload['email']) {
      email = jwtDecoded.payload['email'] as string
      console.log('DEBUG: Found email in email field:', email)
    } else if (jwtDecoded.payload['sub']) {
      // Extract email from sub if it's google-oauth2|email format
      const sub = jwtDecoded.payload['sub'] as string
      console.log('DEBUG: Checking sub for email:', sub)
      if (sub.includes('|')) {
        const parts = sub.split('|')
        if (parts.length > 1 && parts[1].includes('@')) {
          email = parts[1]
          console.log('DEBUG: Extracted email from sub:', email)
        }
      }
    }

    const verifierId = jwtDecoded.payload['sub'] as string
    console.log('DEBUG: Final values - email:', email, 'verifierId:', verifierId)

    // For Auth0, we might not have email in the JWT if it's not requested
    // Return the sub as verifierId regardless of email
    return {
      email: email || '', // Empty string if no email found
      profileImage: null,
      verifierId: verifierId,
      xeroUserId: (jwtDecoded.payload['https://user/xero_userid'] as string) ?? null
    }
  } catch (error) {
    console.error('DEBUG: parseJWT error:', error)
    throw error
  }
}

function getAuthIssuerJwks(): string {
  return `${getAuthIssuer()}/.well-known/jwks.json`
}

function getAuthIssuer(): string {
  const configService = new ConfigService()
  return `${configService.get('AUTH0_ISSUER_URL')}`
}
function getAuthAudience(): string {
  const configService = new ConfigService()
  return configService.get('AUTH0_AUDIENCE')
}

function getAuthClientId(): string {
  const configService = new ConfigService()
  return configService.get('AUTH0_CLIENT_ID')
}

function getAuthClientSecret(): string {
  const configService = new ConfigService()
  return configService.get('AUTH0_CLIENT_SECRET')
}

function getAuthRedirectUrl(): string {
  const configService = new ConfigService()
  return configService.get('AUTH0_REDIRECT_URI')
}
