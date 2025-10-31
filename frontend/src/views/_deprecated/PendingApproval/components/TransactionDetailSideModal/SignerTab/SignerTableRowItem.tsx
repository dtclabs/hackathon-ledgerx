import { FC } from 'react'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import GreenCheck from '@/public/svg/icons/check-success.svg'
import RedCross from '@/public/svg/icons/cancel-icon-red.svg'
import ClockWarning from '@/public/svg/icons/clock-warning.svg'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { ISigner } from './SignerTab'
import Typography, { ITypographyProps } from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'

interface IRecipientItemRowItemProps {
  signer: ISigner
  onAddContact?: (address: string) => void
}

const TRANSACTION_STATUS_MAP = {
  pending: {
    textColor: 'warning',
    text: 'Pending',
    icon: ClockWarning
  },
  confirmed: {
    textColor: 'success',
    text: 'Confirmed',
    icon: GreenCheck
  },
  rejected: {
    textColor: 'error',
    text: 'Rejected',
    icon: RedCross
  }
}

const SignerTableRowItem: FC<IRecipientItemRowItemProps> = ({ signer, onAddContact }) => {
  if (!signer) return null

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="!pl-5 !w-[50px] ">
        <ProfileInfoDisplay>
          <ProfileInfoDisplay.Avatar name={signer.ownerContact?.name ?? ''} />
          <ProfileInfoDisplay.Info>
            {signer.ownerContact && (
              <ProfileInfoDisplay.Info.Name>{signer.ownerContact?.name}</ProfileInfoDisplay.Info.Name>
            )}
            <div
              data-tip={`save-unknown-pending-address-${signer.owner}`}
              data-for={`save-unknown-pending-address-${signer.owner}`}
            >
              <ProfileInfoDisplay.Info.Address address={signer.owner} />

              {!signer.ownerContact && (
                <>
                  <ProfileInfoDisplay.Info.Name color="secondary">Unknown</ProfileInfoDisplay.Info.Name>
                  <ReactTooltip
                    id={`save-unknown-pending-address-${signer?.owner}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg cursor-default"
                    delayHide={50}
                    clickable
                  >
                    <div className="flex flex-row items-center gap-4 px-2">
                      <Typography color="primary" variant="caption">
                        Unknown Address
                      </Typography>
                      <Button
                        variant="grey"
                        height={32}
                        label="Add To Contacts"
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddContact(signer?.owner)
                        }}
                      />
                    </div>
                  </ReactTooltip>
                </>
              )}
            </div>
          </ProfileInfoDisplay.Info>
        </ProfileInfoDisplay>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!p-0 !pl-5 !w-[50px]">
        <div className="flex gap-2">
          <Image
            src={TRANSACTION_STATUS_MAP[signer.status]?.icon ?? GreenCheck}
            alt="green-check"
            height={16}
            width={16}
          />{' '}
          {/* @ts-ignore */}
          <Typography variant="body2" color={TRANSACTION_STATUS_MAP[signer.status]?.textColor ?? 'success'}>
            {TRANSACTION_STATUS_MAP[signer.status]?.text ?? ''}
          </Typography>
        </div>
        {signer?.submissionDate && (
          <Typography variant="caption" color="secondary">
            On {format(new Date(signer?.submissionDate), 'do MMM yyyy, h:mm a')}
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
    </>
  )
}
export default SignerTableRowItem
