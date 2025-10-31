import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import DownloadIcon from '@/public/svg/Download.svg'
import messageWithDots from '@/public/svg/message-dots-square.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import TagIcon from '@/public/svg/icons/tag-icon.svg'
import { selectChartOfAccountMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { useAppSelector } from '@/state'
import { numToWord, toNearestDecimal } from '@/utils-v2/numToWord'
import { toShort } from '@/utils/toShort'
import { IReviewItem } from '@/views/Transfer/Transfer.types'
import Avvvatars from 'avvvatars-react'
import { capitalize } from 'lodash'
import Image from 'next/legacy/image'
import { FC } from 'react'
import ReactTooltip from 'react-tooltip'
import FiatQuotePopup from './FiatQuotePopup'

const NOTE_MAX_LENGTH = 15

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

  const handleOnClickFile = (_file) => (e) => {
    triggerPreviewFile(_file)
  }

  const handleDownloadFile = (_file) => (e) => {
    e.stopPropagation()
    triggerDownloadFile(_file)
  }

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="!px-2 w-fit">
        <div className="flex flex-row justify-between items-center w-fit">
          <div className="flex flex-row gap-4">
            <div className="flex items-center ">
              <Avvvatars style="shape" size={24} value={data?.bankAccount?.label} />
            </div>
            <div className="truncate">
              <Typography classNames="truncate">{data?.bankAccount?.label}</Typography>
              <Typography classNames="truncate" variant="caption" color="secondary">{`${toShort(
                data?.bankAccount?.bankName,
                6,
                6
              )}-${data?.bankAccount?.accountNumber}`}</Typography>
            </div>
          </div>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-[6px]">
            <Image alt="token-img" src={data?.sourceCurrency?.image} width={16} height={16} />
            <Typography data-tip={`full-pay-info-${index}`} data-for={`full-pay-info-${index}`}>
              {numToWord(String(data?.sourceCurrency?.amount), CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 2)}{' '}
              {data.sourceCurrency?.symbol}
            </Typography>
            <FiatQuotePopup item={data} />
          </div>
          <Typography
            variant="caption"
            color="secondary"
            data-tip={`full-pay-info-${index}`}
            data-for={`full-pay-info-${index}`}
          >
            ~ {fiatCurrency?.symbol}
            {numToWord(String(data?.sourceCurrency.fiatPrice), CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 2)}{' '}
            {fiatCurrency?.code}
          </Typography>
        </div>
        <ReactTooltip
          id={`full-pay-info-${index}`}
          borderColor="#eaeaec"
          border
          place="bottom"
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg"
        >
          <Typography classNames="mb-1">
            {toNearestDecimal(String(data?.sourceCurrency?.amount), 'SG', 2)} {data?.sourceCurrency?.symbol}
          </Typography>
          <Typography variant="caption" color="secondary">
            {fiatCurrency?.symbol}
            {toNearestDecimal(String(data?.sourceCurrency.fiatPrice), 'SG', 2)} {fiatCurrency?.code}
          </Typography>
        </ReactTooltip>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        <img src="/svg/icons/arrow-narrow-right.svg" alt="arrow" />
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        <div
          className="flex flex-row items-center gap-[6px]"
          data-tip={`full-get-info-${index}`}
          data-for={`full-get-info-${index}`}
        >
          <Image alt="token-img" src={data?.currency?.image} width={16} height={16} />
          <Typography>
            {data?.currency?.symbol}
            {numToWord(String(data?.currency?.amount), CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 2)}{' '}
            {data?.currency?.code}
          </Typography>
        </div>
        <ReactTooltip
          id={`full-get-info-${index}`}
          borderColor="#eaeaec"
          border
          place="bottom"
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg"
        >
          <Typography>
            {toNearestDecimal(String(data?.currency?.amount), 'SG', 2)} {data?.currency?.code}
          </Typography>
        </ReactTooltip>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.chartOfAccount !== null ? (
          <div className="">
            <Typography classNames="max-w-[130px] macbock:max-w-[100px] truncate">
              {data?.chartOfAccount?.code ? `${data?.chartOfAccount?.code} - ` : ''}
              {data?.chartOfAccount?.name}
            </Typography>
            <Typography variant="caption">{capitalize(data?.chartOfAccount?.type)}</Typography>
          </div>
        ) : (
          <div>
            <Typography variant="body2" classNames="!text-[#CECECC]">
              {!chartOfAccountMap[data?.chartOfAccount.id]?.name ? '-' : 'No Account'}
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="!px-2">
        {data?.note?.length ? (
          <div className="flex flex-row gap-2 items-center">
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
              delayHide={500}
              delayShow={250}
              delayUpdate={500}
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
        {data?.files?.length > 0 ? (
          <div className="flex flex-row">
            <Button
              height={32}
              data-tip={`full-file-info-${index}`}
              data-for={`full-file-info-${index}`}
              variant="grey"
              leadingIcon={<Image src={AttachFileIcon} alt="attach-icon" height={14} width={14} />}
              label={`${data?.files?.length} file${data?.files?.length > 1 ? 's' : ''}`}
              classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2 gap-1"
            />
            <ReactTooltip
              id={`full-file-info-${index}`}
              borderColor="#eaeaec"
              border
              delayHide={500}
              delayShow={250}
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
          </div>
        ) : (
          <div className="flex  items-center">
            <Typography variant="body2" classNames="!text-[#CECECC]">
              No Files
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default ReviewLineItem
