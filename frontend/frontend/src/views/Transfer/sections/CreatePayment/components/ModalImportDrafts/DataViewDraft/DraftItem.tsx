import { CurrencyType, IPayment } from '@/api-v2/payment-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import TagIcon from '@/public/svg/icons/tag-icon.svg'
import NoteIcon from '@/public/svg/message-dots-square.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import { toShort } from '@/utils/toShort'
import { getCurrencyImage } from '@/views/CreateDraftPayment/hooks/useDraftForm/useDraftForm'
import { DraftStatusPill } from '@/views/Transfer/components'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import { useMemo } from 'react'
import ReactTooltip from 'react-tooltip'

const NOTE_MAX_LENGTH = 20
export const parseNote = (_note) => {
  if (!_note) return '-'
  if (_note?.length > NOTE_MAX_LENGTH) {
    return `${_note?.substr(0, NOTE_MAX_LENGTH)}...`
  }
  return _note
}

interface IDraftItemProps {
  item: IPayment & { contactName: string }
  fiatAmount: number
  fiatCurrency: any
  onDownloadFile: (draftId: string, fileId: string) => void
}

const DraftItem: React.FC<IDraftItemProps> = ({ item, fiatAmount, fiatCurrency, onDownloadFile }) => {
  const renderRecipient = useMemo(() => {
    if (item?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <>
          <ProfileInfoDisplay.Info.Name color="primary" styleVariant="regular" classNames="truncate">
            {item?.contactName || item?.destinationName}
          </ProfileInfoDisplay.Info.Name>
          <ProfileInfoDisplay.Info.Name
            data-tip={`full-bank-info-${item?.id}`}
            data-for={`full-bank-info-${item?.id}`}
            color="secondary"
            classNames="truncate"
            variant="caption"
          >
            {item?.destinationMetadata?.bankName}-{item?.destinationMetadata?.accountNumberLast4}
          </ProfileInfoDisplay.Info.Name>
          <ReactTooltip
            id={`full-bank-info-${item?.id}`}
            borderColor="#eaeaec"
            border
            place="bottom"
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            <Typography>
              {item?.destinationMetadata?.bankName}-{item?.destinationMetadata?.accountNumberLast4}
            </Typography>
          </ReactTooltip>
        </>
      )
    }
    return item?.destinationName && item?.destinationMetadata?.id ? (
      <>
        <ProfileInfoDisplay.Info.Name color="primary" styleVariant="regular" classNames="truncate">
          {item?.contactName || item?.destinationName}
        </ProfileInfoDisplay.Info.Name>
        <ProfileInfoDisplay.Info.Address address={item?.destinationAddress} color="secondary" variant="caption" />
      </>
    ) : (
      <>
        <div className="flex flex-row items-center">
          <div data-tip={`add-contact-${item?.id}`} data-for={`add-contact-${item?.id}`}>
            <WalletAddress split={4} address={item.destinationAddress} color="primary" styleVariant="regular" />
          </div>
          <div className="flex items-center gap-[6px]">
            <WalletAddress.Link address={item.destinationAddress} isMultiple={false} />
            <WalletAddress.Copy address={item.destinationAddress} />
          </div>
        </div>
        <ProfileInfoDisplay.Info.Name color="secondary" classNames="truncate" variant="caption">
          {item?.destinationName || 'Unknown'}
        </ProfileInfoDisplay.Info.Name>
      </>
    )
  }, [
    item?.destinationMetadata,
    item?.destinationName,
    item?.destinationCurrencyType,
    item?.destinationAddress,
    item?.contactName,
    item?.destinationName
  ])

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] pl-0 pr-[12px] 2xl:max-w-[210px] max-w-[250px]">
        <div className=" w-full">{renderRecipient}</div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] px-[12px]">
        <div className="flex flex-col">
          <div className="flex gap-2">
            {(item?.destinationCurrencyType === CurrencyType.FIAT
              ? getCurrencyImage(item?.destinationCurrency?.code)
              : item?.destinationCurrency?.image?.small) && (
              <Image
                priority
                src={
                  item?.destinationCurrencyType === CurrencyType.FIAT
                    ? getCurrencyImage(item?.destinationCurrency?.code)
                    : item?.destinationCurrency?.image?.small
                }
                height={18}
                width={18}
                alt="icon-amount"
              />
            )}
            <Typography color="primary" variant="body2">
              {item?.destinationAmount} {item?.destinationCurrency?.code || item?.destinationCurrency?.symbol}
            </Typography>
          </div>
          {/* <Typography variant="caption" classNames="mt-1" color="tertiary">
            {`~ ${fiatCurrency?.symbol}${fiatAmount.toFixed(2)} ${fiatCurrency?.code}`}
          </Typography> */}
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] px-[12px] 2xl:max-w-[170px] max-w-[220px] truncate">
        {item?.chartOfAccount ? (
          <Typography color="primary" variant="body2" classNames="truncate">
            {item?.chartOfAccount?.code
              ? `${item?.chartOfAccount?.code} - ${item?.chartOfAccount?.name}`
              : item?.chartOfAccount?.name}
          </Typography>
        ) : (
          <Typography color="tertiary" variant="body2">
            No account
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] px-[12px]">
        <div className="flex flex-col justify-center">
          <Typography color="primary" variant="body2">
            {format(new Date(item.createdAt), 'dd MMM yyyy')}
          </Typography>
          <Typography variant="caption" classNames="mt-1" color="tertiary">
            {format(new Date(item.createdAt), 'hh:mm a')}
          </Typography>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] px-[12px] truncate">
        <div className="flex gap-2" data-tip={`draft-notes-${item?.id}`} data-for={`draft-notes-${item?.id}`}>
          <Image priority src={NoteIcon} alt="icon-note" width={16} height={16} />
          <Typography color={item.notes ? 'primary' : 'tertiary'} variant="body2" classNames="truncate">
            {item.notes ? parseNote(item.notes) : 'No Notes'}
          </Typography>
          {item.notes && (
            <ReactTooltip
              id={`draft-notes-${item?.id}`}
              border
              delayHide={100}
              delayUpdate={500}
              borderColor="#eaeaec"
              place="top"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {item.notes}
            </ReactTooltip>
          )}
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] px-[12px]">
        {item?.annotations?.length > 0 ? (
          <>
            <Button
              data-tip={`draft-tags-${item?.id}`}
              data-for={`draft-tags-${item?.id}`}
              classNames="!border-blanca-300 font-medium px-[10px] gap-1"
              variant="grey"
              height={24}
              leadingIcon={<Image src={TagIcon} alt="tag-icon" height={14} width={14} />}
              label={item?.annotations?.length > 1 ? `${item?.annotations?.length} tags` : '1 tag'}
            />
            <ReactTooltip
              id={`draft-tags-${item?.id}`}
              border
              borderColor="#eaeaec"
              place="bottom"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              <div className="pt-2 pb-2 flex flex-wrap gap-2 max-w-[200px]">
                {item?.annotations?.map((tag, _index) => (
                  <TagItem key={`${tag.id}-${item?.id}`} tag={{ label: tag.name, value: tag.id }} clearable={false} />
                ))}
              </div>
            </ReactTooltip>
          </>
        ) : (
          <Typography color="tertiary" variant="body2">
            No tags
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="py-[14px] px-[12px]">
        {item?.files?.length > 0 ? (
          <>
            <Button
              data-tip={`draft-files-${item?.id}`}
              data-for={`draft-files-${item?.id}`}
              classNames="!border-blanca-300 font-medium px-[10px] gap-1"
              variant="grey"
              height={24}
              leadingIcon={<Image priority src={AttachFileIcon} alt="attach-icon" height={15} width={15} />}
              label={item?.files?.length > 1 ? `${item?.files?.length} files` : '1 file'}
            />
            <ReactTooltip
              id={`draft-files-${item?.id}`}
              border
              delayHide={100}
              delayUpdate={500}
              borderColor="#eaeaec"
              place="bottom"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              <div className="pt-2 pb-2">
                {item?.files?.map((file, _index) => (
                  <Button
                    key={file?.id}
                    classNames={_index !== 0 && 'mt-2'}
                    height={32}
                    variant="grey"
                    label={
                      <Typography classNames="truncate" variant="caption">
                        {file.name?.length < 35 ? file.name : toShort(file.name, 25, 10)}
                      </Typography>
                    }
                    onClick={() => onDownloadFile(item.id, file.id)}
                  />
                ))}
              </div>
            </ReactTooltip>
          </>
        ) : (
          <Typography color="tertiary" variant="body2">
            No files
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="px-0 pr-[24px]">
        <div className="w-full flex justify-end">
          <DraftStatusPill status={item?.status} />
        </div>
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default DraftItem
