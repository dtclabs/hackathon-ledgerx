import { AxiosError } from 'axios'
import { captureException as sentryCaptureException, addBreadcrumb } from '@sentry/nextjs'


export interface IDataError {
  error?: string
  Error?: string
}
export const handleServiceError = (error: AxiosError | string): IDataError => {
  let message = ''
  if ((error as AxiosError).response)
    message =
      (error as AxiosError).response.data.message ||
      (error as any).response.message ||
      (error as AxiosError).response.data.error ||
      (error as AxiosError).response.data.error
  if (!message) message = (error as string) || 'Something wrong'
  addBreadcrumb({
    category: 'HQ-Log',
    data: {
      responseData: (error as AxiosError)?.response?.data
    }
  })
  sentryCaptureException(message)
  return { error: message }
}
export const instanceOfDataError = (object: any): object is IDataError => 'error' in object || 'Error' in object
