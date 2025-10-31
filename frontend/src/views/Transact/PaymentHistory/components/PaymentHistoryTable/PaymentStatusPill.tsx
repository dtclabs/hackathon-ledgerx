import { ProviderStatus } from '@/api-v2/payment-api'
import Pill from '@/components-v2/atoms/Pill'
import { useMemo } from 'react'

const PaymentStatusPill = ({ providerStatus }: { providerStatus: ProviderStatus }) => {
  const statusHandler = useMemo(() => {
    switch (providerStatus) {
      case ProviderStatus.COMPLETED:
        return {
          label: 'Completed',
          fontColor: '#0CB746',
          bgColor: '#E7F8ED'
        }
      case ProviderStatus.FAILED:
        return {
          label: 'Failed',
          fontColor: '#E9740B',
          bgColor: '#F9E8E8'
        }
      case ProviderStatus.CREATED:
      case ProviderStatus.PENDING:
        return {
          label: 'Processing',
          fontColor: '#E9740B',
          bgColor: '#FDF1E7'
        }
      default:
        return {
          label: 'Completed',
          fontColor: '#0CB746',
          bgColor: '#E7F8ED'
        }
    }
  }, [providerStatus])

  return (
    <Pill
      label={statusHandler.label}
      fontColor={statusHandler.fontColor}
      bgColor={statusHandler.bgColor}
      classNames="w-max whitespace-nowrap"
    />
  )
}

export default PaymentStatusPill
