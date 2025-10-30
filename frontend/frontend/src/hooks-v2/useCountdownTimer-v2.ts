import { useState, useEffect } from 'react'
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'

const useCountdownTimerV2 = (expiryDate) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const timeDifference = differenceInMinutes(new Date(expiryDate), now)

      if (timeDifference <= 0) {
        setTimeLeft('Expired')
      } else {
        const days = Math.floor(timeDifference / (24 * 60))
        const hours = Math.floor((timeDifference % (24 * 60)) / 60)
        const minutes = timeDifference % 60

        const formattedDays = days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''
        const formattedHours = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
        const formattedMinutes = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''

        const formattedTimeLeft = `${formattedDays} ${formattedHours} and ${formattedMinutes}`
        setTimeLeft(formattedTimeLeft)
      }
    }

    const intervalId = setInterval(calculateTimeLeft, 60000)

    calculateTimeLeft() // Initial calculation

    return () => {
      clearInterval(intervalId)
    }
  }, [expiryDate])

  return timeLeft
}

export default useCountdownTimerV2
