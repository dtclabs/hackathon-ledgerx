import { AxiosError, AxiosRequestConfig } from 'axios'
import axiosConfig from '@/api/axiosConfig'
import { handleServiceError } from './apiErrorService'

export interface IResponse<T> {
  data: T
}

export const getApi = async <T>(path: string, config?: AxiosRequestConfig): Promise<IResponse<T>> => {
  try {
    const response = await axiosConfig.get<IResponse<T>>(path, config)
    return response.data
  } catch (error) {
    return handleServiceError(error as AxiosError) as IResponse<T>
  }
}

export const postApi = async <TRequest, T>(
  path: string,
  payload: TRequest,
  config?: AxiosRequestConfig
): Promise<IResponse<T>> => {
  try {
    const response = await axiosConfig.post<IResponse<T>>(path, payload, config)
    return response.data
  } catch (error) {
    return handleServiceError(error as AxiosError) as IResponse<T>
  }
}

export const putApi = async <TRequest, T>(
  path: string,
  payload: TRequest,
  config?: AxiosRequestConfig
): Promise<IResponse<T>> => {
  try {
    const response = await axiosConfig.put<IResponse<T>>(path, payload, config)
    return response.data
  } catch (error) {
    return handleServiceError(error as AxiosError) as IResponse<T>
  }
}

export const deleteApi = async <T>(path: string, config?: AxiosRequestConfig): Promise<IResponse<T>> => {
  try {
    const response = await axiosConfig.delete<IResponse<T>>(path, config)
    return response.data
  } catch (error) {
    return handleServiceError(error as AxiosError) as IResponse<T>
  }
}
