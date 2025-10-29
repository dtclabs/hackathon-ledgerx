import { eachMonthOfInterval, endOfDay, endOfMonth, format, isThisMonth } from 'date-fns'

export const dateHelper = {
  getUTCTimestamp,
  getUTCTimestampFrom,
  utcToZonedTime,
  getMinutesAndSecondsDifferenceFromTime,
  getUTCTimestampMinutesAgo,
  getUTCTimestampHoursAgo,
  fromUnixTimestampToDate,
  getUTCTimestampMillisecondsForward,
  getUTCTimestampSecondsForward,
  getUTCTimestampForward,
  getDateComponentFromDateTimestamp,
  getTimeComponentFromDateTimestamp,
  getDateTimeComponentFromDateTimestamp,
  isToday,
  toISO8061String,
  getShortDateFormat,
  getEndOfMonthsInRangeOrNow,
  getMonthYearFromTimestamp,
  getMonthsDiff,
  getDaysDifferenceFromTime
}
// https://date-fns.org/v2.29.3/docs/parse
// Below are the same with postgresql date and time data.
export const shortDateFormat = 'dd/MM/yyyy'
export const dateComponentFormat = 'yyyy-MM-dd'
export const timeComponentFormat = 'HH:mm'
export const dateTimeComponentFormat = 'yyyy-MM-dd HH:mm:ss'
export const monthYearFormat = 'MMM yyyy'
export const dayInMilliseconds = 1000 * 60 * 60 * 24

const convertMinuteOffsetToTime = 60 * 1000
const convertHourOffsetToTime = 60 * 60 * 1000

function getUTCTimestamp(): Date {
  return new Date(new Date(Date.now()).getTime() + new Date().getTimezoneOffset() * convertMinuteOffsetToTime)
}

function getMinutesAndSecondsDifferenceFromTime(date: Date): { minutes: number; seconds: number } {
  const currentTime = getUTCTimestamp()
  const timeDifference = currentTime.getTime() - date.getTime()
  const minutes = Math.floor(timeDifference / 1000 / 60)
  const seconds = Math.floor((timeDifference / 1000) % 60)
  return { minutes, seconds }
}

function getDaysDifferenceFromTime(date: Date): number {
  const currentTime = getUTCTimestamp()
  const timeDifference = currentTime.getTime() - date.getTime()
  return timeDifference > 0 ? timeDifference / dayInMilliseconds : 0
}

function getUTCTimestampMinutesAgo(minutes: number): Date {
  const timestampSecondsAgo = new Date(new Date().getTime() - minutes * convertMinuteOffsetToTime)
  return new Date(timestampSecondsAgo.getTime() + timestampSecondsAgo.getTimezoneOffset() * convertMinuteOffsetToTime)
}

function getUTCTimestampHoursAgo(hours: number): Date {
  const timestampHoursAgo = new Date(new Date().getTime() - hours * convertHourOffsetToTime)
  return new Date(timestampHoursAgo.getTime() + timestampHoursAgo.getTimezoneOffset() * convertHourOffsetToTime)
}

function getUTCTimestampFrom(datevalue: Date | string | number): Date {
  const date = new Date(datevalue)
  return new Date(date.getTime() + date.getTimezoneOffset() * convertMinuteOffsetToTime)
}

function fromUnixTimestampToDate(unixTimestamp: number): Date {
  const date = new Date(unixTimestamp * 1000)
  return new Date(date.getTime() + date.getTimezoneOffset() * convertMinuteOffsetToTime)
}

function utcToZonedTime(dirtyDate: Date, offsetMinutes: number) {
  const d = new Date(dirtyDate.getTime() + offsetMinutes * convertMinuteOffsetToTime)
  const resultDate = new Date(0)

  resultDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
  resultDate.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())

  return resultDate
}

function getUTCTimestampMillisecondsForward(milliseconds: number): Date {
  const timestampMsAfter = new Date(new Date().getTime() + milliseconds)
  return new Date(timestampMsAfter.getTime() + timestampMsAfter.getTimezoneOffset() * convertMinuteOffsetToTime)
}

function getUTCTimestampSecondsForward(seconds: number): Date {
  const timestampMsAfter = new Date(new Date().getTime() + seconds * 1000)
  return new Date(timestampMsAfter.getTime() + timestampMsAfter.getTimezoneOffset() * convertMinuteOffsetToTime)
}

function getUTCTimestampForward(options: {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
}): Date {
  const days = options.days ?? 0
  let hours = options.hours ?? 0
  let minutes = options.minutes ?? 0
  let seconds = options.seconds ?? 0
  let milliseconds = options.milliseconds ?? 0

  hours += days * 24
  minutes += hours * 60
  seconds += minutes * 60
  milliseconds = seconds * 1000

  const timestampAfter = new Date(new Date().getTime() + milliseconds)
  return new Date(timestampAfter.getTime() + timestampAfter.getTimezoneOffset() * convertMinuteOffsetToTime)
}

function getDateComponentFromDateTimestamp(date: Date): string {
  return format(date, dateComponentFormat)
}

function getTimeComponentFromDateTimestamp(date: Date): string {
  return format(date, timeComponentFormat)
}

function getDateTimeComponentFromDateTimestamp(date: Date): string {
  return format(date, dateTimeComponentFormat)
}
function getMonthYearFromTimestamp(date: Date): string {
  return format(date, monthYearFormat)
}

function isToday(date: Date): boolean {
  return (
    dateHelper.getDateComponentFromDateTimestamp(date) ===
    dateHelper.getDateComponentFromDateTimestamp(getUTCTimestamp())
  )
}

function getShortDateFormat(date: Date): string {
  return format(date, shortDateFormat)
}

function toISO8061String(date: Date, offsetMinutes: number): string {
  const dateString = date.toISOString()

  const dif = offsetMinutes > 0 ? '+' : '-'

  const timezoneString =
    dif +
    Math.floor(Math.abs(offsetMinutes) / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0')

  return dateString.replace('Z', timezoneString)
}

function getEndOfMonthsInRangeOrNow(startDate: Date, endDate: Date): Date[] {
  // Generate an array of months in the range
  const months = eachMonthOfInterval({ start: startDate, end: endDate })

  // if date is current month we need to add only today instead of end of month
  return months.map((month) => {
    if (isThisMonth(month)) {
      return getUTCTimestamp()
    }
    return endOfDay(endOfMonth(month))
  })
}

function getMonthsDiff(startDate: Date, endDate: Date): number {
  return eachMonthOfInterval({ start: startDate, end: endDate }).length
}
