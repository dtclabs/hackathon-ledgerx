import React from 'react'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Typography from '@/components-v2/atoms/Typography'
import ArrowRight from '@/public/svg/icons/arrow-narrow-right.svg'
import { Button } from '@/components-v2'
import AssetChip from '../AssetChip'

interface IMappedRow {
  walletName: string
  mappedAssets: { id: string; symbol: string; image: string }[]
}

const MappedRow: React.FC<IMappedRow> = ({ mappedAssets, walletName }) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const MAX_ASSETS_ON_ROW = window?.innerWidth > 1280 ? 10 : 8

  const handleRedirectToDefaultMapping = () => {
    router.push(`/${organizationId}/chart-of-accounts/default-mapping`)
  }
  return (
    <div className="rounded border-[1px] border-dashboard-border-200 p-6">
      <div className="flex items-center justify-between">
        <Typography variant="body2" styleVariant="semibold" color="primary">
          {walletName}
        </Typography>
        <Button rightIcon={ArrowRight} variant="contained" color="white" onClick={handleRedirectToDefaultMapping}>
          <Typography variant="body2">Go to account rules</Typography>
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {mappedAssets?.length &&
          mappedAssets
            .slice(0, MAX_ASSETS_ON_ROW)
            .map((asset) => <AssetChip icon={asset.image} symbol={asset.symbol} />)}
        {mappedAssets?.length > MAX_ASSETS_ON_ROW && (
          <Typography classNames="rounded-[100px] border-[1px] border-neutral-300 px-[10px] py-[6px]" variant="body2">
            {`+ ${mappedAssets.length - MAX_ASSETS_ON_ROW}`}
          </Typography>
        )}
      </div>
    </div>
  )
}

export default MappedRow
