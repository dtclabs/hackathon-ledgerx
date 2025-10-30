import { FC } from 'react'
import Image from 'next/legacy/image'
import warning from '@/public/svg/warningCategory.svg'
import warningIconGreen from '@/public/svg/warningIconGreen.svg'
import error from '@/public/svg/warning-icon.svg'
import Typography from '@/components-v2/atoms/Typography'
import Button from '@/components-v2/atoms/Button'
import { OrgIntegrationStatus } from '@/slice/org-integration/org-integration-slice'

interface IXeroIntegrationBannerProps {
  integration: string
  onClickUpgrade: () => void
  migrationStatus?: OrgIntegrationStatus
  onHandleBannerClose?: () => void
}

const RootfiIntegrationBanner: FC<IXeroIntegrationBannerProps> = ({
  integration,
  onClickUpgrade,
  migrationStatus,
  onHandleBannerClose
}) => {
  if (migrationStatus === OrgIntegrationStatus.MIGRATING) {
    return null
  }

  if (migrationStatus === OrgIntegrationStatus.FAILED) {
    return (
      <div className="bg-[#F9E8E8] rounded-lg font-inter border border-[#E59494] flex flex-row gap-x-5 justify-between items-center p-3 px-4 mb-5">
        <div className="flex flex-row gap-x-2">
          <div className="pt-1">
            <Image src={error} alt="error" width={16} height={16} />
          </div>
          <div>
            <Typography variant="subtitle1" color="error">
              Failed to migrate
            </Typography>
            <Typography variant="body2" color="error">
              Your Chart of Accounts data migration has failed. Please contact us at support@ledgerx.com.
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  if (migrationStatus === OrgIntegrationStatus.COMPLETED) {
    return (
      <div className="bg-[#E7F8ED] rounded-lg font-inter border border-[#8FDEAA] flex flex-row gap-x-5 justify-between items-center p-3 px-4 mb-5">
        <div className="flex flex-row gap-x-2">
          <div className="pt-1">
            <Image src={warningIconGreen} alt="error" width={16} height={16} />
          </div>
          <div>
            <Typography variant="subtitle1" color="success">
              Successfully migrated!
            </Typography>
            <Typography variant="body2" color="success">
              Your Chart of Accounts data migration is complete. All services have been resumed.
            </Typography>
          </div>
        </div>
        <Button variant="greenOutlined" height={32} label="Close" onClick={onHandleBannerClose} />
      </div>
    )
  }

  return (
    <div className="bg-[#FDF1E7] rounded-lg font-inter border border-[#F5BF8F] flex flex-row gap-x-5 justify-between items-center p-3 px-4 mb-5">
      <div className="flex flex-row gap-x-2">
        <div className="pt-1">
          <Image src={warning} alt="warning" width={16} height={16} />
        </div>
        <div>
          <Typography variant="subtitle1" color="warning">
            {`Require ${integration ?? ''} Integration Upgrade`}
          </Typography>
          <Typography variant="body2" color="warning">
            We are upgrading our systems for enhanced service. Please kindly assist with the data migration process.
          </Typography>
        </div>
      </div>
      <Button
        variant="orangeOutlined"
        height={32}
        label="Upgrade Now"
        onClick={onClickUpgrade}
        // disabled={migrationStatus === OrgIntegrationStatus.MIGRATING}
      />
    </div>
  )
}
export default RootfiIntegrationBanner
