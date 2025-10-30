import { subMinutes } from 'date-fns'

interface IUtcTimeBasedOnOffset {
  date: Date
  offsetInMinutes: number
}

export const utcTimeBasedOnOffset = ({ date, offsetInMinutes }: IUtcTimeBasedOnOffset) => {
  const utcDate = subMinutes(date, offsetInMinutes)
  return utcDate
}
