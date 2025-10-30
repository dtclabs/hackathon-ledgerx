import { intervalToDuration } from 'date-fns'
import { useEffect, useState } from 'react'

export const useTimeDistance = (from: string) => {
  const [time, setTime] = useState('')
  useEffect(() => {
    const getTime = setInterval(() => {
      if (from) {
        const start = new Date(from)
        const now = new Date()
        const interval = intervalToDuration({
          start,
          end: now
        })
        if (interval.years > 0) setTime(`${interval.years} year${interval.years !== 1 ? 's' : ''} ago`)
        else if (interval.months > 0) setTime(`${interval.months} month${interval.months !== 1 ? 's' : ''} ago`)
        else if (interval.weeks > 0) setTime(`${interval.weeks} week${interval.weeks !== 1 ? 's' : ''} ago`)
        else if (interval.days > 0) setTime(`${interval.days} day${interval.days !== 1 ? 's' : ''} ago`)
        else if (interval.minutes > 0) setTime(`${interval.minutes} min${interval.minutes !== 1 ? 's' : ''} ago`)
        else setTime('Just now')
      }
    }, 1000)
    return () => clearInterval(getTime)
  }, [from])
  return time
}
