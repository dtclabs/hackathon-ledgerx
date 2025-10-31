import { IPayment } from '@/api-v2/payment-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import ContactUnknown from '@/public/svg/icons/contact-unknown-avatar.svg'
import NoteIcon from '@/public/svg/message-dots-square.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import Avvvatars from 'avvvatars-react'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import DraftStatusPill from '../../DraftStatusPill/DraftStatusPill'
import { parseNote } from '../../ReviewPaymentStep/ReviewLineItem'

interface IDraftItemProps {
  item: IPayment & { contactName: string }
  fiatAmount: number
  fiatCurrency: any
  onDownloadFile: (draftId: string, fileId: string) => void
}

const DraftItem: React.FC<IDraftItemProps> = ({ item, fiatAmount, fiatCurrency, onDownloadFile }) => (
  <>
    <BaseTable.Body.Row.Cell extendedClass="py-[14px] 2xl:max-w-[210px] max-w-[250px]">
      <div className="flex items-center gap-3 w-full">
        {item?.destinationName && item?.destinationMetadata?.id ? (
          <>
            <Avvvatars style="shape" size={20} value={item.destinationName} />
            <div className="flex justify-between items-start flex-col w-[calc(100%-32px)] truncate gap-1">
              <Typography color="primary" variant="body2" classNames="w-[calc(100%-8px)] truncate">
                {item.contactName ?? item.destinationName}
              </Typography>
              <WalletAddress split={4} address={item.destinationAddress} color="tertiary">
                <WalletAddress.Link address={item.destinationAddress} isMultiple={false} />
                <WalletAddress.Copy address={item.destinationAddress} />
              </WalletAddress>
            </div>
          </>
        ) : (
          <>
            <Image priority src={ContactUnknown} alt="icon-contact-unknown" width={20} height={20} />
            <div className="flex justify-between items-start flex-col w-[calc(100%-32px)] truncate gap-1">
              <WalletAddress split={4} address={item.destinationAddress} color="primary">
                <WalletAddress.Link address={item.destinationAddress} isMultiple={false} />
                <WalletAddress.Copy address={item.destinationAddress} />
              </WalletAddress>
              <Typography color="tertiary">{item?.destinationName ?? 'Unknown'}</Typography>
            </div>
          </>
        )}
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="py-[14px]">
      <div className="flex flex-col">
        <div className="flex gap-2">
          <Image priority src={item?.destinationCurrency?.image?.small} height={18} width={18} alt="icon-amount" />
          <Typography color="primary" variant="body2">
            {item?.destinationAmount} {item?.destinationCurrency?.symbol}
          </Typography>
        </div>
        <Typography variant="caption" classNames="mt-1" color="tertiary">
          {`~ ${fiatCurrency?.symbol}${fiatAmount.toFixed(2)} ${fiatCurrency?.code}`}
        </Typography>
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="py-[14px] 2xl:max-w-[170px] max-w-[220px] truncate">
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
    <BaseTable.Body.Row.Cell extendedClass="py-[14px]">
      <div className="flex flex-col justify-center">
        <Typography color="primary" variant="body2">
          {format(new Date(item.createdAt), 'dd MMM yyyy')}
        </Typography>
        <Typography variant="caption" classNames="mt-1" color="tertiary">
          {format(new Date(item.createdAt), 'hh:mm a')}
        </Typography>
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="py-[14px] truncate">
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
    <BaseTable.Body.Row.Cell extendedClass="py-[14px]">
      {item?.files?.length > 0 ? (
        <>
          <Button
            data-tip={`draft-files-${item?.id}`}
            data-for={`draft-files-${item?.id}`}
            classNames="!border-blanca-300 font-medium px-[10px]"
            variant="grey"
            height={24}
            leadingIcon={<Image priority src={AttachFileIcon} alt="attach-icon" height={16} width={16} />}
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
                  label={`${file.name}`}
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

export default DraftItem
