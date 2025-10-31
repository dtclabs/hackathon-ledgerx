import { postApi } from '@/utils/apiHelper'
import { CreateAnalysisDto } from './interface'

export const logEventApi = async (payload: CreateAnalysisDto) => {
  const res = await postApi('/analysis', payload)
  return res
}
