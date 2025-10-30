import { IDecodeToken } from '@/api/interface'
import jwtDecode from 'jwt-decode'

const accessToken = 'id_token'

export const setAccessToken = (token: string) =>
  typeof window !== 'undefined' && window.localStorage.setItem(accessToken, token)

export const getAccessToken = () => (typeof window !== 'undefined' ? localStorage.getItem(accessToken) : '')

export const removeAccessToken = () => typeof window !== 'undefined' && window.localStorage.removeItem(accessToken)

export const decodeAccessToken = (): IDecodeToken | null => {
  const accessTokenReturn = localStorage.getItem(accessToken)
  if (accessTokenReturn) return jwtDecode(accessTokenReturn) as IDecodeToken
  return null
}


