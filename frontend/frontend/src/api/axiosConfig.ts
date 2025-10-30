/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
// import { logOut } from '@/state/user/actions'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { getTime } from 'date-fns'
import jwtDecode from 'jwt-decode'
import { toast } from 'react-toastify'
import { getAccessToken, removeAccessToken } from '../utils/localStorageService'
import { IDecodeToken } from './interface'

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
  (res: AxiosResponse) => res,
  async (err) => {
    const accessToken = getAccessToken()

    if (err.response.status === 401) {
      const decodeToken: IDecodeToken = jwtDecode(accessToken)
      const currentTime = getTime(new Date()) / 1000
      if (currentTime >= decodeToken.exp) {
        const hasSessionTimeoutTriggered = window.sessionStorage.getItem('session_timeout_triggered')
        if (hasSessionTimeoutTriggered !== 'true') {
          toast.error('Session Timeout!', {
            position: 'top-right',
            pauseOnHover: false
          })
          removeAccessToken()
          window.sessionStorage.setItem('session_timeout_triggered', 'true')
        }
      }
      // removeAccessToken()
    }

    return Promise.reject(err)
  }
)

axiosConfig.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
)

export default axiosConfig
