const convertMinuteOffsetToTime = 60 * 1000
export const dayInMilliseconds = 1000 * 60 * 60 * 24

export const utcToZonedTime = (utcDate: Date | string, offsetMinutes: number) => {
  const date = new Date(new Date(utcDate).getTime() + offsetMinutes * convertMinuteOffsetToTime)
  const timeZonedDate = new Date(0)

  timeZonedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
  timeZonedDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())

  return timeZonedDate
}

export const getUTCTDate = (date: Date | string, offsetMinutes?: number): Date => {
  const offset = -offsetMinutes || new Date().getTimezoneOffset()
  return new Date(new Date(date).getTime() + offset * convertMinuteOffsetToTime)
}

export const getDateWithoutTimezone = (date: Date | string): Date =>
  new Date(new Date(date).getTime() - new Date().getTimezoneOffset() * convertMinuteOffsetToTime)
