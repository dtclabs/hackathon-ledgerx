/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
// import { logOut } from '@/state/user/actions'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { getAccessToken } from '../utils/localStorageService'

const axiosConfig = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosConfig.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const accessToken = getAccessToken()

    if (accessToken) {
      if (config && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosConfig.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
)

export default axiosConfig

export const getRemoteChartOfAccounts = async ({ organizationId, integration }) => {
  try {
    const response: any = await axiosConfig.get<any>(
      `${organizationId}/chart-of-accounts/pass-through/${integration}/import-new`,
      {
        timeout: 60000
      }
    )
    return response.data
  } catch (error: any) {
    return {
      isError: true,
      ...error?.response?.data
    }
  }
}
