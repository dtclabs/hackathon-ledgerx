import React from 'react'
import Image from 'next/legacy/image'
import ETH from '@/public/svg/logos/import-ethereum.svg'
import Safe from '@/public/svg/logos/import-safe.svg'
import Typography from '@/components-v2/atoms/Typography'

interface ISelectFundType {
  onAddWallet: () => void
  onAddSafe: () => void
  title: string
  subTitle?: string
}

const SelectFundType: React.FC<ISelectFundType> = ({ onAddSafe, onAddWallet, title, subTitle }) => (
  <div className="pt-[92px] px-6">
    <Typography variant="heading3" color="primary" classNames="text-center">
      {title}
    </Typography>
    {subTitle && (
      <Typography variant="body2" classNames="text-center pt-2 !text-grey-700">
        {subTitle}
      </Typography>
    )}

    <div className="flex items-center justify-center pt-8 gap-4">
      <button
        type="button"
        className="rounded-lg border border-dashboard-border-200 py-6 w-[200px] flex flex-col items-center gap-4 hover:bg-grey-200 hover:border-grey-200"
        onClick={onAddWallet}
      >
        <div className="p-2 w-max flex items-center">
          <Image src={ETH} />
        </div>
        <Typography variant="body2" color="primary" styleVariant="semibold">
          Ethereum (Wallet)
        </Typography>
      </button>
      <button
        type="button"
        className="rounded-lg border border-dashboard-border-200 py-6 w-[200px] flex flex-col items-center gap-4 hover:bg-grey-200 hover:border-grey-200"
        onClick={onAddSafe}
      >
        <div className="p-2 w-max flex items-center">
          <Image src={Safe} />
        </div>
        <Typography variant="body2" color="primary" styleVariant="semibold">
          Safe
        </Typography>
      </button>
    </div>
  </div>
)

export default SelectFundType
