import { useAppSelector } from '@/state'
import { format } from 'date-fns'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { utcTimeBasedOnOffset } from '@/utils-v2/date-utils'

interface IUtcTimeBasedOnOffset {
  date: Date
  dateFormat?: string
  offsetInMinutes?: number
}

export const useDateUtils = () => {
  const orgSettings = useAppSelector(orgSettingsSelector)

  const utcDateBasedOnOffset = ({ date, dateFormat, offsetInMinutes }: IUtcTimeBasedOnOffset) => {
    const utcDate = utcTimeBasedOnOffset({ date, offsetInMinutes: offsetInMinutes ?? orgSettings?.timezone?.utcOffset })
    return format(utcDate, dateFormat ?? 'yyyy-MM-dd HH:mm:ss')
  }

  return { utcDateBasedOnOffset }
}
