import { addMinutes, parseISO, format } from 'date-fns'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

export const formatTimeBasedonUTCOffset = (
  timestamp: string,
  utcOffset: number,
  countryLocale: string,
  option?: Intl.DateTimeFormatOptions
): string => {
  try {
    const parsedDateFromTimeStamp = parseISO(timestamp?.slice(0, -1))
    const finalConvertedDate = addMinutes(parsedDateFromTimeStamp, utcOffset)
    let result
    try {
      result = new Intl.DateTimeFormat(
        `en-${countryLocale}`,
        option
          ? { ...option }
          : {
              dateStyle: 'short',
              timeStyle: 'medium'
            }
      ).format(finalConvertedDate)
    } catch {
      result = format(finalConvertedDate, 'yyyy-MM-dd hh:mm:ss')
    }
    return result
  } catch (e) {
    sentryCaptureException(e)
    if (!timestamp) return ''
    const parsedDateFromTimeStamp = parseISO(timestamp.slice(0, -1))
    return format(parsedDateFromTimeStamp, 'yyyy-MM-dd hh:mm:ss')
  }
}

export const minutesTohhmm = (minutes: number): string => {
  const hours = `${Math.floor(minutes / 60)}`
  let minutesStringified = `${minutes % 60}`
  if (minutesStringified.length === 1) minutesStringified = `0${minutesStringified}`

  return `${hours}:${minutesStringified}`
}
