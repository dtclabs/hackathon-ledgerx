import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../../../shared/logger/logger.service'
import { jwtTokenHelper } from '../../../shared/helpers/jwtToken.helper'
import { lastValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { Auth0UserInfo } from './interfaces'

@Injectable()
export class Auth0Service {
  constructor(private configService: ConfigService, private httpService: HttpService, private logger: LoggerService) {}

  async getAccessToken(code: string): Promise<string> {
    try {
      // Try Basic Authentication first
      const clientId = jwtTokenHelper.getAuthClientId()
      const clientSecret = jwtTokenHelper.getAuthClientSecret()
      const redirectUri = jwtTokenHelper.getAuthRedirectUrl()
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      
      this.logger.debug('Attempting Auth0 token exchange', {
        clientId: clientId?.substring(0, 8) + '...',
        redirectUri,
        codeLength: code?.length
      })
      
      const options = {
        url: `${jwtTokenHelper.getAuthIssuer()}/oauth/token`,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri
        }).toString()
      }
      
      let response: AxiosResponse<{ access_token: string }>
      
      try {
        // Try Basic Auth first
        response = await lastValueFrom(
          this.httpService.post(options.url, options.data, { headers: options.headers })
        )
      } catch (basicAuthError) {
        this.logger.error('Basic auth failed, trying POST body method', {
          status: basicAuthError?.response?.status,
          error: basicAuthError?.response?.data?.error,
          errorDescription: basicAuthError?.response?.data?.error_description
        })
        
        // Fallback to POST body method using application/x-www-form-urlencoded
        const fallbackUrl = `${jwtTokenHelper.getAuthIssuer()}/oauth/token`
        const fallbackData = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri
        }).toString()

        try {
          response = await lastValueFrom(
            this.httpService.post(fallbackUrl, fallbackData, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
          )
        } catch (fallbackError) {
          // If fallback also fails, log the response body (if available) to help debugging
          this.logger.error('Fallback POST body method failed', {
            message: fallbackError?.message,
            status: fallbackError?.response?.status,
            error: fallbackError?.response?.data?.error,
            errorDescription: fallbackError?.response?.data?.error_description,
            responseData: fallbackError?.response?.data
          })
          
          // Provide more specific error messages based on Auth0 error codes
          const auth0Error = fallbackError?.response?.data?.error
          const errorDescription = fallbackError?.response?.data?.error_description
          
          if (auth0Error === 'invalid_grant') {
            if (errorDescription?.includes('authorization code')) {
              throw new BadRequestException('Authorization code has expired or been used already. Please try logging in again.')
            } else if (errorDescription?.includes('redirect_uri')) {
              throw new BadRequestException('Redirect URI mismatch. Please contact support.')
            }
            throw new BadRequestException(`Auth0 error: ${errorDescription || 'Invalid grant'}`)
          } else if (auth0Error === 'invalid_client') {
            throw new BadRequestException('Invalid client credentials. Please contact support.')
          }
          
          throw fallbackError
        }
      }
      if (!response.data?.access_token) {
        throw new Error(`Access token is not found`)
      }

      return response.data.access_token
    } catch (e) {
      // If it's already a BadRequestException with a specific message, re-throw it
      if (e instanceof BadRequestException) {
        throw e
      }
      
      this.logger.error('Can not validate code', e, { code: code?.substring(0, 10) + '...' })
      throw new BadRequestException('Authentication failed. Please try logging in again.')
    }
  }

  async getUserInfo(providerAccessToken: string) {
    try {
      const options = {
        url: `${jwtTokenHelper.getAuthIssuer()}/userinfo`,
        headers: {
          Authorization: `Bearer ${providerAccessToken}`
        }
      }
      const response = await lastValueFrom<AxiosResponse<Auth0UserInfo>>(
        this.httpService.get(options.url, { headers: options.headers })
      )

      return response.data
    } catch (e) {
      this.logger.error('Can not get User Data', e)
      throw new BadRequestException('Can not get User Data')
    }
  }
}
