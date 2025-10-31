import Typography from '@/components-v2/atoms/Typography'
import InfoIcon from '@/public/svg/icons/info-icon-circle-black.svg'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { IReviewItem } from '@/views/Transfer/Transfer.types'
import { PopupDialog } from '@/views/Transfer/components'
import { differenceInSeconds, format } from 'date-fns'
import Image from 'next/legacy/image'
import { useEffect, useMemo, useState } from 'react'

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return format(new Date(0, 0, 0, hours, minutes, seconds), 'HH:mm:ss')
}

const FiatQuotePopup = ({ item }: { item: IReviewItem }) => {
  const [remainingTime, setRemainingTime] = useState(999)

  const price = useMemo(() => {
    const convertedAmount = parseFloat(item?.sourceCurrency?.amount) - parseFloat(item?.quote?.fee)
    const convertRate = convertedAmount / parseFloat(item?.currency?.amount)

    return {
      convertedAmount,
      convertRate
    }
  }, [item])

  const expiresSeconds = useMemo(() => {
    if (item?.quote?.expiresAt) {
      const totalSeconds = differenceInSeconds(new Date(item?.quote?.expiresAt), new Date())
      setRemainingTime(totalSeconds)
      return totalSeconds
    }
    return 0
  }, [item?.quote?.expiresAt])

  useEffect(() => {
    let interval = null

    if (remainingTime <= 0) {
      clearInterval(interval)
    } else if (expiresSeconds > 0 && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((seconds) => seconds - 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [expiresSeconds, remainingTime])

  return (
    <PopupDialog
      placement="below"
      width="340px"
      trigger={
        <div className="flex items-center">
          <Image alt="info-icon" src={InfoIcon} width={14} height={14} />
        </div>
      }
    >
      <div data-tip="asset-grid" data-for="asset-grid">
        <Typography color="secondary" variant="caption" classNames="mb-4">
          This amount will be sent to a unique deposit address provided by Triple-A. Triple-A will convert the
          cryptocurrency to fiat and transfer the corresponding fiat amounts to the recipient.
        </Typography>
        <div className="flex items-center justify-between mb-2">
          <Typography>Amount to be converted</Typography>
          <div className="flex flex-row items-center gap-[6px]">
            <Image alt="token-img" src={item?.sourceCurrency?.image} width={14} height={14} />
            <Typography>
              {toNearestDecimal(String(price.convertedAmount), 'SG', 2)} {item?.sourceCurrency?.symbol}
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <Typography>Transaction Fees</Typography>
          <div className="flex flex-row items-center gap-[6px]">
            <Image alt="token-img" src={item?.sourceCurrency?.image} width={14} height={14} />
            <Typography>
              {toNearestDecimal(String(item?.quote?.fee), 'SG', 2)} {item?.sourceCurrency?.symbol}
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <Typography styleVariant="semibold">You Pay</Typography>
          <div className="flex flex-row items-center gap-[6px]">
            <Image alt="token-img" src={item?.sourceCurrency?.image} width={14} height={14} />
            <Typography>
              {toNearestDecimal(String(item?.sourceCurrency?.amount), 'SG', 2)} {item?.sourceCurrency?.symbol}
            </Typography>
          </div>
        </div>

        <Typography variant="caption" classNames="mb-2">
          1 {item?.currency?.code} = {toNearestDecimal(String(price.convertRate), 'SG', 6)}{' '}
          {item?.sourceCurrency?.symbol}
        </Typography>
        {remainingTime > 0 ? (
          <Typography variant="caption" styleVariant="semibold" classNames="mb-2">
            Quote expires in {formatTime(remainingTime)}
          </Typography>
        ) : (
          item?.quote?.expiresAt && (
            <Typography variant="caption" styleVariant="semibold" classNames="mb-2">
              Quote expired at {format(new Date(item?.quote?.expiresAt), 'dd/MM/yyyy hh:mm:ss')}
            </Typography>
          )
        )}
        <Typography variant="caption" color="secondary" classNames="mb-2 italic">
          *The price will refresh once the quote expires. Additional gas fees will be applied at the time of transfer.
        </Typography>
      </div>
    </PopupDialog>
  )
}
export default FiatQuotePopup
