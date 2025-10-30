import { PaymentStatus } from '@/api-v2/payment-api'
import Pill from '@/components-v2/atoms/Pill'
import RedErrorIcon from '@/public/svg/icons/red-big-x-icon.svg'
import GreenCheck from '@/public/svg/icons/check-success.svg'
import ClockWarning from '@/public/svg/icons/clock-warning.svg'
import { useMemo } from 'react'

const DraftStatusPill = ({ status }) => {
  const statusHandler = useMemo(() => {
    switch (status) {
      case PaymentStatus.APPROVED: {
        return {
          label: 'Reviewed',
          fontColor: '#0CB746',
          bgColor: '#E7F8ED',
          img: GreenCheck
        }
      }
      case PaymentStatus.PENDING: {
        return {
          label: 'Pending Review',
          fontColor: '#E9740B',
          bgColor: '#FDF1E7',
          img: ClockWarning
        }
      }
      case PaymentStatus.FAILED: {
        return {
          label: 'Failed',
          fontColor: '#C61616',
          bgColor: '#F9E8E8',
          img: RedErrorIcon
        }
      }
      default:
        return {
          label: 'Reviewed',
          fontColor: '#0CB746',
          bgColor: '#E7F8ED',
          img: GreenCheck
        }
    }
  }, [status])

  return (
    <Pill
      label={statusHandler.label}
      fontColor={statusHandler.fontColor}
      bgColor={statusHandler.bgColor}
      icon={statusHandler.img}
      classNames="w-max whitespace-nowrap"
    />
  )
}

export default DraftStatusPill
