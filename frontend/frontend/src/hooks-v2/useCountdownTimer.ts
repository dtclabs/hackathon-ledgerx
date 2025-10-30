import { useState, useEffect } from 'react'
import { differenceInMinutes, differenceInHours } from 'date-fns'

function useCountdownTimer(expiryDate) {
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime())

  function calculateRemainingTime() {
    const currentDate = new Date()
    const minutesRemaining = differenceInMinutes(new Date(expiryDate), currentDate)
    const hoursRemaining = differenceInHours(new Date(expiryDate), currentDate)

    return {
      hours: hoursRemaining,
      minutes: minutesRemaining % 60
    }
  }

  useEffect(() => {
    // Function to update the remaining time and check if it's expired
    function updateRemainingTime() {
      const newRemainingTime = calculateRemainingTime()
      setRemainingTime(newRemainingTime)

      // If remaining time is less than or equal to zero, clear the interval
      if (newRemainingTime.hours <= 0 && newRemainingTime.minutes <= 0) {
        clearInterval(interval)
      }
    }

    // Initial update
    updateRemainingTime()

    // Update the remaining time every minute
    const interval = setInterval(updateRemainingTime, 60000) // 60000 milliseconds = 1 minute

    return () => {
      // Clear the interval when the component unmounts
      clearInterval(interval)
    }
  }, [expiryDate])

  return remainingTime
}

export default useCountdownTimer
