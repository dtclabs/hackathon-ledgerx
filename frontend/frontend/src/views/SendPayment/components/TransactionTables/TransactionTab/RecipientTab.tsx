import React from 'react'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import TotalAmount from '../../TotalAmount/TotalAmount'
import TokenImage from '@/components/TokenImage/TokenImage'

export interface IRecipientTab {
  address: string
  tokenAddress: string
  transaction: any
  price: any
  timestamp?: any
  hash: string
  index: number
}

const RecipientTab: React.FC<IRecipientTab> = ({ address, tokenAddress, transaction, price, timestamp, hash, index }) => (
  <div className="w-full flex justify-between items-center rounded-b-lg">
    <div className="py-6 text-grey-900 font-semibold flex items-center gap-4">
      <WalletAddress address={address} noColor showFirst={5} showLast={4} />
    </div>
    <div className="py-2 ">
      <div className="flex justify-end items-center gap-2 text-grey-900 font-semibold">
        <TokenImage className="h-4 w-auto" tokenAddress={tokenAddress} />
        <TotalAmount index={index} price={price} transaction={transaction} hash={hash} type="TOKEN" />
      </div>
      {timestamp ? (
        <div className="text-sm w-full flex justify-end text-grey-50 font-medium pl-6 gap-1">
          ~ <TotalAmount index={index} price={price} transaction={transaction} hash={hash} type="USD" /> USD
        </div>
      ) : (
        <div className="text-sm w-full flex justify-end text-grey-50 font-medium pl-6 gap-1">
          ~ <TotalAmount index={index} price={price} transaction={transaction} hash={hash} type="USD" noPastPrice /> USD
        </div>
      )}
    </div>
  </div>
)

export default RecipientTab
