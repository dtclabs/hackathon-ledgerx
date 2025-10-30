import WalletAddress from '@/components/WalletAddress/WalletAddress'
import { IToken } from '@/hooks/useNetwork'
import { ITransaction } from '@/slice/old-tx/interface'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import { currencyToWord, toNearestDecimal } from '@/utils-v2/numToWord'
import { format } from 'date-fns'
import TokenImage from '../TokenImage/TokenImage'

export interface IOverviewTransactionDetail {
  transactionValueOverview: ITransaction
  submitTime: string
  isExecuted: boolean
  executedTime: string
  amount: string
  price: string | number
  token: IToken
  recipients: string
  from?: string
  to?: string
  isIncoming: boolean
  fee: string | number
  nativeToken: IToken
}

const OverviewTransactionDetail: React.FC<IOverviewTransactionDetail> = ({
  transactionValueOverview,
  to,
  amount,
  price,
  fee,
  recipients,
  executedTime,
  isExecuted,
  submitTime,
  from,
  isIncoming,
  nativeToken,
  token
}) => {
  const {
    timezone: timeZonesetting,
    country: countrySetting,
    fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)

  return (
    <>
      <div className="flex justify-between font-medium text-base border-b border-dashboard-border">
        <div className="text-dashboard-sub">
          <div className="mb-6 h-6 text-transform: capitalize">{!isExecuted && 'Safe'} Transaction Hash</div>
          {submitTime && <div className="mb-6 h-6 text-transform: capitalize">Date of Submitting Transfer</div>}
          {isExecuted && <div className="mb-6 h-6 text-transform: capitalize">Executed On</div>}
        </div>
        <div className="text-right text-dashboard-main">
          <div className="mb-6 h-6">
            <WalletAddress
              address={
                isExecuted
                  ? transactionValueOverview.hash
                  : transactionValueOverview.safeTransaction && transactionValueOverview.safeTransaction.safeTxHash
              }
              noScan={!isExecuted}
              noAvatar
              noColor
              showFirst={5}
              textAlign="right"
              showLast={4}
              scanType="txHash"
            />
          </div>

          {(submitTime &&
            formatTimeBasedonUTCOffset(submitTime, timeZonesetting?.utcOffset || 480, countrySetting?.iso || 'SG')) ||
            ''}

          <div className="mb-6 h-6">
            {(executedTime && format(new Date(executedTime), 'dd MMM yyyy, hh:mm a')) || ''}
          </div>
        </div>
      </div>
      {amount && !transactionValueOverview.isRejectTransaction && (
        <div className="flex justify-between font-medium text-base  border-dashboard-border mt-6">
          <div className=" capitalize text-dashboard-sub ">Amount</div>
          <div className=" h-6 text-right text-dashboard-main min-w-max flex gap-2 items-center">
            <TokenImage
              className="h-4 w-4"
              type="tokenURL"
              symbol={transactionValueOverview.recipients[0]?.cryptocurrency.symbol} // TODO: Refactor to support multitokens when we support it from BE
              imageSrc={transactionValueOverview.recipients[0]?.cryptocurrency.image.thumb}
            />
            <div>
              {toNearestDecimal(amount, countrySetting?.iso, 5)}{' '}
              {transactionValueOverview.recipients[0]?.cryptocurrency.symbol}
            </div>
          </div>
        </div>
      )}
      {fee && (
        <div className="flex justify-between font-medium text-base  border-dashboard-border mt-6">
          <div className=" capitalize text-dashboard-sub ">Gas fee</div>

          <div className=" h-6 text-right text-dashboard-main min-w-max flex gap-2 items-center">
            {nativeToken && (
              <TokenImage
                className="h-4 w-4"
                type="tokenURL"
                symbol={nativeToken.symbol}
                imageSrc={nativeToken.logoUrl}
              />
            )}
            <div>{`${fee} ${nativeToken.symbol}`}</div>
          </div>
        </div>
      )}
      {transactionValueOverview.recipients[0]?.cryptocurrency.symbol && (
        <div className="flex justify-between font-medium text-base  border-dashboard-border mt-6">
          <div className=" capitalize text-dashboard-sub ">Value at time of payment</div>
          <div className=" h-6  text-right text-dashboard-main min-w-max">
            {(price &&
              `${fiatCurrencySetting?.symbol}${currencyToWord(
                `${price}`,
                null,
                countrySetting?.iso,
                3
              )} ${transactionValueOverview.recipients[0]?.fiatCurrency?.toUpperCase()}`) ||
              'Unable to fetch price'}
          </div>
        </div>
      )}
      <div className="flex justify-between font-medium text-base  border-dashboard-border mt-6">
        <div className="text-dashboard-sub ">
          <div className=" capitalize">From</div>
        </div>
        <div className="text-right text-dashboard-main min-w-max">
          <div className=" h-6">
            {from && (
              <WalletAddress
                address={from}
                noAvatar
                noColor
                showFirst={5}
                showLast={4}
                textAlign="right"
                scanType="address"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between font-medium text-base py-6">
        <div className="text-dashboard-sub ">
          <div className=" capitalize truncate">To</div>
        </div>
        <div className=" text-right text-dashboard-main min-w-max">
          <div className="h-6">
            {isIncoming ? (
              <WalletAddress
                textAlign="right"
                address={transactionValueOverview.to}
                noAvatar
                noColor
                showFirst={5}
                showLast={4}
                scanType="address"
              />
            ) : recipients && recipients !== '1' ? (
              `${recipients} Recipient${recipients !== '1' ? 's' : ''}`
            ) : (
              to && (
                <WalletAddress
                  address={to}
                  noAvatar
                  textAlign="right"
                  noColor
                  showFirst={5}
                  showLast={4}
                  scanType="address"
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}
export default OverviewTransactionDetail
