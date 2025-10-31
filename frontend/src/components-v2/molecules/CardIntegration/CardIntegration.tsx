import { FC } from 'react'
import Card from '@/components-v2/atoms/Card'
import Button from '@/components-v2/atoms/Button'
import { Divider } from '@/components-v2/Divider'
import { Badge2 } from '../Badge'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'
import { trimAndEllipsis } from '@/utils-v2/string-utils'
import LinkIcon from '@/public/svg/icons/link-icon.svg'
import Loader from '@/public/svg/Loader.svg'

interface IProps {
  id: string
  image: any
  title: string
  description: string
  onClick: () => void
  onClickUpgrade?: () => void
  isIntegrated?: boolean
  type: string
  upgradeRequired?: boolean
  CTALabel?: string | JSX.Element
  disabled?: boolean
  locked?: boolean
  isConnectedAnother?: boolean
  connectedAccount?: string
  settings?: {
    currency: string
    timezone: string
  }
  onOpenSyncModal?: () => void
  CTAButtonLoading?: boolean
  upgradeButtonLoading?: boolean
  failedMigration?: boolean
  onDisconnect?: () => void
}

const MAX_COMPANY_NAME_LENGTH = 20

const CardIntegration: FC<IProps> = ({
  id,
  image,
  type,
  title,
  description,
  onClick,
  onClickUpgrade,
  isIntegrated,
  CTALabel,
  disabled,
  locked,
  isConnectedAnother,
  connectedAccount,
  upgradeRequired,
  settings,
  onOpenSyncModal,
  CTAButtonLoading,
  upgradeButtonLoading,
  failedMigration,
  onDisconnect
}) => {
  const trimText = connectedAccount && connectedAccount.length >= MAX_COMPANY_NAME_LENGTH

  return (
    <Card className="w-[420px]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <Image style={{ borderRadius: '50%' }} src={image} height={30} width={30} />
          <div>
            <Typography styleVariant="medium" variant="body2">
              {title}
            </Typography>
            <Typography variant="caption" color="secondary">
              {type}
            </Typography>
          </div>
        </div>
        {failedMigration && (
          <div data-tip={`${id}-integration-failed-migration`} data-for={`${id}-integration-failed-migration`}>
            <Badge2 extendedClass="cursor-default" color="error" variant="rounded">
              <Badge2.Label noWrap>Failed to Migrate</Badge2.Label>
            </Badge2>
          </div>
        )}
        {failedMigration && (
          <ReactTooltip
            id={`${id}-integration-failed-migration`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="top"
            className="w-[250px] !px-[10px]"
          >
            <Typography variant="caption" styleVariant="semibold" classNames="mb-1">
              Failed to Migrate
            </Typography>
            <Typography variant="caption">
              This service is temporarily unavailable. Please contact us at support@ledgerx.com.
            </Typography>
          </ReactTooltip>
        )}
      </div>
      <div className="pt-3">
        <Typography variant="body2" color="secondary">
          {description}
        </Typography>
      </div>
      <Divider />
      <div className="flex flex-row justify-between items-center">
        <div data-tip={`badge-tooltip-${title}`} data-for={`badge-tooltip-${title}`}>
          {(isIntegrated || upgradeRequired || failedMigration) && (
            <>
              <Badge2 extendedClass="cursor-default" color="success" variant="rounded">
                <Badge2.Icon icon={LinkIcon} />
                <Badge2.Label noWrap>
                  {connectedAccount
                    ? `${trimText ? trimAndEllipsis(connectedAccount, 20) : connectedAccount}`
                    : 'Connected'}
                </Badge2.Label>
              </Badge2>
              {(trimText || settings) && (
                <ReactTooltip
                  id={`badge-tooltip-${title}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="max-w-[350px] min-w-[150px] !px-[10px] !mt-[-6px] !z-[49] !opacity-100"
                  clickable
                  delayHide={200}
                >
                  <div className="flex flex-col gap-1">
                    <Typography variant="body2">{connectedAccount}</Typography>
                    <Typography variant="caption" classNames="flex items-center">
                      Currency:{' '}
                      {settings?.currency ? (
                        <b>{settings?.currency}</b>
                      ) : (
                        <div className="ml-4 flex items-center h-fit">
                          <Image src={Loader} alt="Load" width={24} height={24} className="animate-spin" />
                        </div>
                      )}
                    </Typography>
                    <Typography variant="caption" classNames="flex items-center">
                      Time zone:{' '}
                      {settings?.timezone ? (
                        <b>{settings?.timezone}</b>
                      ) : (
                        <div className="ml-4 flex items-center h-fit">
                          <Image src={Loader} alt="Load" width={24} height={24} className="animate-spin" />
                        </div>
                      )}
                    </Typography>
                    <Button
                      height={24}
                      variant="whiteWithBlackBorder"
                      label="Sync"
                      onClick={onOpenSyncModal}
                      disabled={upgradeRequired || (!settings?.timezone && !settings?.currency)}
                    />
                  </div>
                </ReactTooltip>
              )}
            </>
          )}
        </div>
        <div className="flex flex-row gap-x-1">
          {/* {(upgradeRequired || failedMigration) && (
            <Button
              variant="grey"
              label="Disconnect"
              height={32} 
              loading={CTAButtonLoading || upgradeButtonLoading}
              onClick={onDisconnect}
              disabled={failedMigration}
            />
          )} */}
          {!upgradeRequired && (
            <Button
              data-tip={`${id}-integration`}
              data-for={`${id}-integration`}
              height={32}
              disabled={(disabled || isConnectedAnother || CTAButtonLoading) && !locked}
              locked={locked}
              variant={isIntegrated ? 'grey' : failedMigration ? 'orangeOutlined' : 'black'}
              label={CTALabel}
              onClick={onClick}
              loading={CTAButtonLoading}
            />
          )}
          {upgradeRequired && !failedMigration && (
            <Button
              data-tip={`${id}-integration`}
              data-for={`${id}-integration`}
              variant={upgradeButtonLoading ? 'black' : 'orangeOutlined'}
              label="Upgrade"
              height={32}
              onClick={onClickUpgrade}
              loading={upgradeButtonLoading}
              disabled={upgradeButtonLoading || isConnectedAnother}
            />
          )}
        </div>
        {locked && (
          <ReactTooltip
            id={`${id}-integration`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="right"
            className="w-[200px] !px-[10px]"
          >
            <Typography variant="caption">Please buy Business or above plan to access this feature</Typography>
          </ReactTooltip>
        )}
        {isConnectedAnother && (
          <ReactTooltip
            id={`${id}-integration`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="right"
            className="w-[200px] !px-[10px]"
          >
            <Typography variant="caption">You are already connected to an Accounting integration</Typography>
          </ReactTooltip>
        )}
      </div>
    </Card>
  )
}

export default CardIntegration
