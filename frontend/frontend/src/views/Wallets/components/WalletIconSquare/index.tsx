import React from 'react'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'

interface IWalletIconSquare {
  walletImage: any
  walletName: string
}

const WalletIconSquare: React.FC<IWalletIconSquare> = ({ walletImage, walletName }) => (
  <div className="flex items-center justify-center pt-8 gap-4 rounded-lg border border-dashboard-border-200 py-6 w-[200px] flex flex-col items-center gap-4 hover:bg-grey-200 hover:border-grey-200">
    <div className="p-2 w-max flex items-center">
      <Image src={walletImage} />
    </div>
    <Typography variant="subtitle2">{walletName}</Typography>
  </div>
)

export default WalletIconSquare
