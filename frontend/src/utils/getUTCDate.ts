const convertMinuteOffsetToTime = 60 * 1000

export const getUTCDate = (datevalue: Date | string | number): Date => {
  const date = new Date(datevalue)
  return new Date(date.getTime() + date.getTimezoneOffset() * convertMinuteOffsetToTime)
}
