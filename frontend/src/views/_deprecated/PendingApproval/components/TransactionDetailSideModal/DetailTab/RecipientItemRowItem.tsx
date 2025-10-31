import { FC } from 'react'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import SpeechBubbleIcon from '@/public/svg/icons/speech-bubble-black.svg'
import { capitalize } from 'lodash'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import { FileInfoDisplay } from '@/components-v2/molecules/FileInfoDisplay'
import { TrimText } from '@/components-v2/molecules/TrimText'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import { trimAndEllipsis } from '@/utils-v2/string-utils'

interface IRecipientItemRowItemProps {
  id: any
  recipient: any
  blockExplorer: string
  onAddContact: (address: string) => void
  onClickFile: (file: any) => void
  onDownloadFile: (file: any) => void
}

const RecipientItemRowItem: FC<IRecipientItemRowItemProps> = ({
  recipient,
  id,
  blockExplorer,
  onAddContact,
  onClickFile,
  onDownloadFile
}) => {
  const coa = recipient?.original?.chartOfAccount?.code
    ? `${recipient?.original?.chartOfAccount?.code} - ${recipient?.original?.chartOfAccount?.name}`
    : recipient?.original?.chartOfAccount?.name
  const recipientName = recipient?.original?.contact?.name
  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="">
        <ProfileInfoDisplay>
          <ProfileInfoDisplay.Avatar name={recipient?.original?.contact?.name ?? ''} />
          <ProfileInfoDisplay.Info>
            {recipient?.original?.contact?.name && (
              <ProfileInfoDisplay.Info.Name>
                {recipientName?.length > 28 ? trimAndEllipsis(recipientName, 18) : recipientName}
              </ProfileInfoDisplay.Info.Name>
            )}
            <div
              data-tip={`save-unknown-pending-address-${recipient?.id}`}
              data-for={`save-unknown-pending-address-${recipient?.id}`}
            >
              <ProfileInfoDisplay.Info.Address
                isMultiple={false}
                blockExplorer={blockExplorer}
                address={recipient?.original?.address}
              />
              {!recipient?.original?.contact?.name && (
                <>
                  <ProfileInfoDisplay.Info.Name color="secondary">Unknown</ProfileInfoDisplay.Info.Name>
                  <ReactTooltip
                    id={`save-unknown-pending-address-${recipient?.id}`}
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
                          onAddContact(recipient?.original?.address)
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
      <BaseTable.Body.Row.Cell>
        <CryptoFiatInfoDisplay
          iso="US"
          id={id}
          cryptocurrency={{
            image: recipient?.original?.cryptocurrency?.image?.thumb,
            amount: recipient?.original?.cryptocurrencyAmount,
            symbol: recipient?.original?.cryptocurrency?.symbol
          }}
          fiatcurrency={{
            iso: 'US',
            currencyCode: recipient?.original?.fiatCurrency,
            currencySymbol: '$',
            fiatAmount: recipient?.original?.fiatAmount,
            color: 'secondary'
          }}
        />
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        {recipient?.original?.chartOfAccount ? (
          <div className="flex flex-col gap-1">
            <Typography>{coa?.length > 25 ? trimAndEllipsis(coa, 15) : coa}</Typography>
            <Typography color="secondary" variant="caption">
              {`${capitalize(recipient?.original?.chartOfAccount?.type)}`}
            </Typography>
          </div>
        ) : (
          <Typography classNames="pl-1" color="secondary" variant="caption">
            No Account
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        <div className="flex gap-2">
          <Image src={SpeechBubbleIcon} alt="speech-bubble-icon" height={15} width={15} />
          {recipient?.original?.notes ? (
            <TrimText label={recipient?.original?.notes} trim={5}>
              <TrimText.Tooltip>{recipient?.original?.notes}</TrimText.Tooltip>
            </TrimText>
          ) : (
            <Typography classNames="pl-1" color="secondary" variant="caption">
              No Notes
            </Typography>
          )}
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        {recipient?.original?.files?.length > 0 ? (
          <FileInfoDisplay
            id={recipient?.original?.address}
            files={
              recipient?.original?.files?.map((_file) => ({
                ..._file,
                name: _file.filename.slice(37)
              })) || []
            }
            onClickFile={onClickFile}
            onDownloadFile={onDownloadFile}
          />
        ) : (
          <Typography classNames="pl-1" color="secondary" variant="caption">
            No Files
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default RecipientItemRowItem
