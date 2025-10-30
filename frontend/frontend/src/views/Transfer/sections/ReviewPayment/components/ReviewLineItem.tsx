import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import DownloadIcon from '@/public/svg/Download.svg'
import TagIcon from '@/public/svg/icons/tag-icon.svg'
import messageWithDots from '@/public/svg/message-dots-square.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import { selectChartOfAccountMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { useAppSelector } from '@/state'
import { IReviewItem } from '@/views/Transfer/Transfer.types'
import { DraftStatusPill } from '@/views/Transfer/components'
import Avvvatars from 'avvvatars-react'
import { capitalize } from 'lodash'
import Image from 'next/legacy/image'
import { FC } from 'react'
import ReactTooltip from 'react-tooltip'

const NOTE_MAX_LENGTH = 20

interface IReviewPaymentProps {
  index: number
  data: IReviewItem
  cryptocurrencyPrices: any
  fiatCurrency: {
    code: string
    symbol: string
  }
}

export const parseNote = (_note) => {
  if (!_note) return '-'
  if (_note?.length > NOTE_MAX_LENGTH) {
    return `${_note?.substr(0, NOTE_MAX_LENGTH)}...`
  }
  return _note
}

const ReviewLineItem: FC<IReviewPaymentProps> = ({ data, index, fiatCurrency, cryptocurrencyPrices }) => {
  const [triggerPreviewFile] = useLazyPreviewFileQuery()
  const [triggerDownloadFile] = useLazyDownloadTxFileQuery()

  const chartOfAccountMap = useAppSelector(selectChartOfAccountMap)

  // const handleOpenFileInTab = (file) => async () => {
  //   try {
  //     await triggerPreviewFile({ key: file.uploadedFileName, filename: file.name })
  //   } catch (_err) {
  //     toast.error('Failed to preview file')
  //   }
  // }

  const handleOnClickFile = (_file) => (e) => {
    triggerPreviewFile(_file)
  }

  const handleDownloadFile = (_file) => (e) => {
    e.stopPropagation()
    triggerDownloadFile(_file)
  }

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="!pr-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-4">
            <div className="flex items-center ">
              <Avvvatars style="shape" size={24} value={data?.walletAddress} />
            </div>
            <div className="truncate">
              {data?.recipientName && <Typography classNames="truncate">{data?.recipientName}</Typography>}
              <div>
                <WalletAddressCopy address={data?.walletAddress} />{' '}
              </div>
            </div>
          </div>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        <div>
          <div className="flex flex-row items-center gap-1 ">
            <Image alt="token-img" src={data?.currency?.image} width={16} height={16} />
            <Typography>{data?.currency?.amount}</Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              color="secondary"
              classNames="cursor-pointer"
              data-tip={`full-price-info-${index}`}
              data-for={`full-price-info-${index}`}
            >
              ~ {fiatCurrency?.symbol}{' '}
              {(parseFloat(data?.currency?.amount) * cryptocurrencyPrices[data?.currency?.id]).toFixed(2)}{' '}
              {fiatCurrency?.code}
            </Typography>
            <ReactTooltip
              id={`full-price-info-${index}`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {fiatCurrency?.symbol} {parseFloat(data?.currency?.amount) * cryptocurrencyPrices[data?.currency?.id]}{' '}
              {parseFloat(data?.currency?.amount) * cryptocurrencyPrices[data?.currency?.id]}
              {fiatCurrency?.code}
            </ReactTooltip>
          </div>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.chartOfAccount !== null ? (
          <div>
            <Typography>
              {data?.chartOfAccount?.code ? `${data?.chartOfAccount?.code} - ` : ''}
              {data?.chartOfAccount?.name}
            </Typography>
            <Typography variant="caption">{capitalize(data?.chartOfAccount?.type)}</Typography>
          </div>
        ) : (
          <div>
            <Typography variant="body2" classNames="!text-[#CECECC]">
              No Account
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.note?.length ? (
          <div className="flex flex-row gap-2 items-center ">
            <Image src={messageWithDots} alt="speech-bubble" width={16} height={16} />
            <Typography
              classNames={`${data?.note?.length > NOTE_MAX_LENGTH && 'cursor-pointer'} truncate`}
              data-tip={`full-note-info-${index}`}
              data-for={`full-note-info-${index}`}
            >
              {parseNote(data?.note)}
            </Typography>
            {data?.note?.length > NOTE_MAX_LENGTH && (
              <ReactTooltip
                id={`full-note-info-${index}`}
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
              >
                {data?.note}
              </ReactTooltip>
            )}
          </div>
        ) : (
          <div className="flex flex-row gap-2 items-center  ">
            <Image src={messageWithDots} width={16} height={16} alt="message-icon" className="flex-shrink-0 w-8 h-8" />
            <Typography variant="body2" classNames="!text-[#CECECC]">
              No Notes
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.files?.length > 0 ? (
          <>
            <Button
              height={32}
              data-tip={`full-file-info-${index}`}
              data-for={`full-file-info-${index}`}
              variant="grey"
              leadingIcon={<Image src={AttachFileIcon} alt="attach-icon" height={14} width={14} />}
              label={`${data?.files?.length} file${data?.files?.length > 1 ? 's' : ''}`}
              classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
            />
            <ReactTooltip
              id={`full-file-info-${index}`}
              borderColor="#eaeaec"
              border
              clickable
              delayHide={500}
              delayUpdate={500}
              place="bottom"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              <div className="pt-2 pb-2">
                {data?.files.map((file, _index) => (
                  <Button
                    trailingIcon={
                      <Image
                        src={DownloadIcon}
                        alt="external-link"
                        height={14}
                        width={14}
                        onClick={handleDownloadFile(file)}
                      />
                    }
                    classNames={_index !== 0 && 'mt-2'}
                    height={32}
                    onClick={handleOnClickFile(file)}
                    variant="grey"
                    label={`${file.filename}`}
                  />
                ))}
              </div>
            </ReactTooltip>
          </>
        ) : (
          <div className="flex  items-center">
            <Typography variant="body2" classNames="!text-[#CECECC]">
              No Files
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.tags?.length > 0 ? (
          <div className="flex flex-row">
            <Button
              height={32}
              data-tip={`full-tags-info-${index}`}
              data-for={`full-tags-info-${index}`}
              variant="grey"
              leadingIcon={<Image src={TagIcon} alt="tag-icon" height={14} width={14} />}
              label={`${data?.tags?.length} tag${data?.tags?.length > 1 ? 's' : ''}`}
              classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2 gap-1"
            />
            <ReactTooltip
              id={`full-tags-info-${index}`}
              borderColor="#eaeaec"
              border
              place="bottom"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              <div className="flex flex-wrap gap-2 max-w-[250px]">
                {data?.tags.map((tag, _index) => (
                  <TagItem tag={tag} key={tag.value} clearable={false} />
                ))}
              </div>
            </ReactTooltip>
          </div>
        ) : (
          <div className="flex  items-center">
            <Typography variant="body2" classNames="!text-[#CECECC]">
              No tags
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.draftStatus ? <DraftStatusPill status={data?.draftStatus} /> : '-'}
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default ReviewLineItem
