import syncButton from '@/public/svg/SyncButton.svg'
import syncButtonOrgange from '@/public/svg/SyncButtonOrange.svg'
import Image from 'next/legacy/image'
import { FC } from 'react'

interface ISyncButton {
  wrapperClassName?: string
  onClick?: any
  isSyncing: boolean
  lastUpdated: string
  disabled?: boolean
  title?: string
}

/* eslint-disable no-else-return */
const getText = (isDataLoading, isSyncing, lastUpdated, title) => {
  if (isDataLoading) return 'Loading'
  else if (isSyncing) return 'Syncing Data'
  else if (lastUpdated) return `Synced: ${lastUpdated}`
  return `Sync ${title}`
}

const SyncChip: FC<ISyncButton> = ({
  isSyncing,
  wrapperClassName,
  lastUpdated,
  onClick,
  disabled,
  title = 'Wallets'
}) => {
  const isDataLoading = lastUpdated === '' && !isSyncing
  return (
    <div
      className={`${
        disabled ? ' opacity-50 cursor-not-allowed' : ''
      } text-sm max-h-8  bg-dashboard-background px-2 py-2 rounded-lg flex items-center justify-end gap-2 text-dashboard-sub whitespace-nowrap font-inter  ${
        isSyncing || isDataLoading ? 'bg-warning-50 text-warning-500  px-2' : ''
      } ${wrapperClassName}`}
    >
      {getText(isDataLoading, isSyncing, lastUpdated, title)}
      <button
        disabled={isSyncing || isDataLoading || disabled}
        onClick={onClick}
        type="button"
        className="flex items-center text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSyncing || isDataLoading ? (
          <Image src={syncButtonOrgange} alt="greenLoader" width={15} height={15} className="animate-spin" />
        ) : (
          <Image src={syncButton} alt="greenLoader" width={15} height={15} />
        )}
      </button>
    </div>
  )
}

export default SyncChip
