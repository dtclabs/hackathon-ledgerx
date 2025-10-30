/* eslint-disable react/no-array-index-key */
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import { ITransactionRecipient } from '@/slice/old-tx/interface'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { currencyToWord, toNearestDecimal } from '@/utils-v2/numToWord'
import TokenImage from '../TokenImage/TokenImage'

export interface IRecipientsModal {
  recipients: ITransactionRecipient[]
  decimal?: number
  isRejectTransaction?: boolean
}

const RecipientsModal: React.FC<IRecipientsModal> = ({ recipients, decimal, isRejectTransaction }) => {
  const {
    timezone: timeZonesetting,
    country: countrySetting,
    fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)

  return (
    <div className="rounded-lg border border-dashboard-border-200 font-inter">
      <div className="first-of-type:rounded-t-lg flex items-center p-4 bg-gray-50 font-medium text-xs text-dashboard-sub">
        <div className="flex-1">Recipient</div>
        <div className="flex-1">Token Amount</div>
      </div>
      {recipients &&
        recipients.map((item, index) => (
          <div key={index} className={`flex items-center justify-between p-4 ${index % 2 !== 0 ? 'bg-gray-50' : ''}`}>
            <WalletAddressV2 className="flex-1" address={item.address} noColor showFirst={5} showLast={4} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <TokenImage
                  className="w-4 h-4"
                  type="tokenURL"
                  imageSrc={item.cryptocurrency.image.thumb}
                  symbol={item.cryptocurrency.symbol}
                />
                <div className="text-sm text-[#344054] font-medium font-inter">
                  {item.cryptocurrencyAmount && toNearestDecimal(item.cryptocurrencyAmount, countrySetting?.iso, 5)}{' '}
                  {item.cryptocurrency.symbol}
                </div>
              </div>
              <div className="text-xs text-[#475467] font-normal font-inter">
                {isRejectTransaction
                  ? ''
                  : item.fiatAmount
                  ? `~ ${fiatCurrencySetting?.symbol}${currencyToWord(
                      item.fiatAmount,
                      null,
                      countrySetting?.iso,
                      3
                    )} ${item.fiatCurrency?.toUpperCase()}`
                  : 'Unsupported Token'}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
export default RecipientsModal
