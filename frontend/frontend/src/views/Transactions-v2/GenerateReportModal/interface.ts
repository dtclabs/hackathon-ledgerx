import { PlanName } from '@/api-v2/subscription-api'
import { ExportTo } from '../ExportModalV2/interface'

export const MAX_REPORT_MONTHS = {
  [PlanName.FREE_TRIAL]: 3,
  [PlanName.BUSINESS]: 12,
  [PlanName.STARTER]: 3
}

export enum ReportInterval {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export const REPORT_OPTIONS = [
  { value: ReportInterval.YEARLY, label: 'Yearly Closing Balance (Coming soon)', disabled: true },
  { value: ReportInterval.QUARTERLY, label: 'Quarterly Closing Balance (Coming soon)', disabled: true },
  { value: ReportInterval.MONTHLY, label: 'Monthly Closing Balance' },
  { value: ReportInterval.DAILY, label: 'Daily Closing Balance (Coming soon)', disabled: true }
]

export const REPORT_INTERVAL_MAP = {
  [ReportInterval.DAILY]: 'Day',
  [ReportInterval.MONTHLY]: 'Month',
  [ReportInterval.QUARTERLY]: 'Quarter',
  [ReportInterval.YEARLY]: 'Year'
}

interface IReportPayLoad {
  exportTo: ExportTo
  reportInterval: ReportInterval
  startTime: string
  endTime: string
}

export interface IGenerateReportModal {
  provider: any
  onClickPrimary: (payload: IReportPayLoad) => void
  isLoading: boolean
  isSuccess: boolean
}
