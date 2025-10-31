import { FC } from 'react'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import messageWithDots from '@/public/svg/message-dots-square.svg'
import Avvvatars from 'avvvatars-react'
import DownloadLink from '@/public/svg/Download.svg'
import { capitalize } from 'lodash'
import { toShort } from '@/utils/toShort'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { IRecipientItemForm } from '../../types'
import DraftStatusPill from '../DraftStatusPill/DraftStatusPill'

const NOTE_MAX_LENGTH = 20

interface IReviewPaymentProps {
  index: number
  data: IRecipientItemForm
  cryptocurrencyPrices: any
  fiatCurrency: {
    code: string
    symbol: string
  }
  onDownloadDraftFile: (draftId: string, fileId: string) => void
  onPreviewFile: (file) => void
}

export const parseNote = (_note) => {
  if (!_note) return '-'
  if (_note?.length > NOTE_MAX_LENGTH) {
    return `${_note?.substr(0, NOTE_MAX_LENGTH)}...`
  }
  return _note
}
const handleOpenFileInTab = (file) => () => {
  const fileUrl = URL.createObjectURL(file)
  window.open(fileUrl, '_blank')
}

const ReviewLineItem: FC<IReviewPaymentProps> = ({
  data,
  index,
  fiatCurrency,
  cryptocurrencyPrices,
  onDownloadDraftFile,
  onPreviewFile
}) => {
  console.log('DATAAA: ', data)
  return (
    <>
      <BaseTable.Body.Row.Cell>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-4">
            <div className="flex items-center ">
              <Avvvatars style="shape" size={24} value={data?.walletAddress.address} />
            </div>
            <div className="truncate">
              <Typography classNames="truncate">{data?.walletAddress?.label}</Typography>
              <div>
                <WalletAddressCopy address={data?.walletAddress.address} />
              </div>
            </div>
          </div>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        <div>
          <div className="flex flex-row items-center gap-1 ">
            <Image alt="token-img" src={data?.token?.src} width={16} height={16} />
            <Typography>{data?.amount}</Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              color="secondary"
              classNames="cursor-pointer"
              data-tip={`full-price-info-${index}`}
              data-for={`full-price-info-${index}`}
            >
              ~ {fiatCurrency?.symbol} {(parseFloat(data.amount) * cryptocurrencyPrices[data?.token?.value]).toFixed(2)}{' '}
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
              {fiatCurrency?.symbol} {parseFloat(data.amount) * cryptocurrencyPrices[data?.token?.value]}{' '}
              {parseFloat(data.amount) * cryptocurrencyPrices[data?.token?.value]}
              {fiatCurrency?.code}
            </ReactTooltip>
          </div>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        {data?.chartOfAccounts !== null ? (
          <div>
            <Typography>{data?.chartOfAccounts?.label}</Typography>
            <Typography variant="caption">{capitalize(data?.chartOfAccounts?.type)}</Typography>
          </div>
        ) : (
          <div>
            <Typography variant="body2" classNames="!text-[#CECECC]">
              {!data?.chartOfAccounts?.label ? '-' : 'No Account'}
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
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
      <BaseTable.Body.Row.Cell>
        {data?.files?.length > 0 ? (
          <div className="flex flex-row gap-2 ">
            {data?.files.length > 0 && (
              <Button
                trailingIcon={
                  data.draftMetadata && (
                    <Image
                      src={DownloadLink}
                      alt="external-link"
                      height={14}
                      width={14}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownloadDraftFile(data?.draftMetadata?.id, data?.files[0]?.id)
                      }}
                    />
                  )
                }
                height={32}
                onClick={(e) => {
                  e.stopPropagation()
                  onPreviewFile(data?.files[0])
                }}
                variant="grey"
                label={
                  data?.files[0]?.name.length > 15
                    ? data?.files.length > 1
                      ? toShort(data?.files[0].name, 5, 3)
                      : toShort(data?.files[0].name, 6, 6)
                    : data?.files[0].name
                }
                classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
              />
            )}
            {data?.files.length > 1 && (
              <>
                <Button
                  height={32}
                  data-tip={`full-file-info-${index}`}
                  data-for={`full-file-info-${index}`}
                  variant="grey"
                  label={`+ ${data?.files?.length && data.files.length - 1}`} // To avoid linting error no-unsafe-optional-chaining
                  classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
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
                    {data?.files
                      .filter((file, indexForFile) => indexForFile !== 0)
                      .map((file, _index) => (
                        <Button
                          trailingIcon={
                            data.draftMetadata && (
                              <Image
                                src={DownloadLink}
                                alt="external-link"
                                height={14}
                                width={14}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDownloadDraftFile(data?.draftMetadata?.id, file.id)
                                }}
                              />
                            )
                          }
                          classNames={_index !== 0 && 'mt-2'}
                          height={32}
                          onClick={(e) => {
                            e.stopPropagation()
                            onPreviewFile(file)
                          }}
                          variant="grey"
                          label={`${file.name}`}
                        />
                      ))}
                  </div>
                </ReactTooltip>
              </>
            )}
          </div>
        ) : (
          <div className="flex  items-center">
            <Typography variant="body2" classNames="!text-[#CECECC]">
              No Files
            </Typography>
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        {data?.draftMetadata?.status ? <DraftStatusPill status={data?.draftMetadata?.status} /> : '-'}
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default ReviewLineItem
