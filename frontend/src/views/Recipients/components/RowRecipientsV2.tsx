import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'
import { format } from 'date-fns'
import { FC } from 'react'
import ReactTooltip from 'react-tooltip'

interface IRowRecipientProps {
  row: any
  supportedChains: any[]
  onConfirmDeleteContact: (recipient) => void
  onEdit: (recipient) => void
  isLoading?: boolean
  isDisabled?: boolean
}

const RowRecipientsV2: FC<IRowRecipientProps> = ({
  row,
  supportedChains,
  onConfirmDeleteContact,
  onEdit,
  isDisabled = false,
  isLoading = false
}) => (
  <>
    <BaseTable.Body.Row.Cell extendedClass="!pr-3">
      <div className="flex gap-3 items-center truncate">
        <div>
          <Avvvatars style="shape" size={32} value={row?.original?.organizationName || row?.original?.contactName} />
        </div>
        {(row?.original?.organizationName || row?.original?.contactName)?.trim().length > 25 ? (
          <div className="truncate pr-5 flex-1">
            <ReactTooltip
              id={row?.original?.id}
              place="top"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg !text-xs"
            >
              {row?.original?.contactName}
            </ReactTooltip>
            <span data-tip data-for={row?.original?.id}>
              {toShort(row?.original?.organizationName || row?.original?.contactName, 25, 0)}
            </span>
          </div>
        ) : (
          <div className="truncate pr-5 flex-1">{row?.original?.organizationName || row?.original?.contactName}</div>
        )}
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="!px-3">
      <div className="flex-1 pr-5">
        {row?.original?.recipientAddresses?.length > 1 ? (
          `${row?.original?.recipientAddresses?.length} addresses`
        ) : row?.original?.recipientAddresses?.length === 1 ? (
          <WalletAddress split={5} address={row?.original?.recipientAddresses[0]?.address} color="dark">
            <WalletAddress.Link address={row?.original?.recipientAddresses[0]?.address} options={supportedChains} />
            <WalletAddress.Copy address={row?.original?.recipientAddresses[0]?.address} />
          </WalletAddress>
        ) : (
          '-'
        )}
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="!px-3">
      <div className="flex flex-col truncate laptop:max-w-[160px] 2xl:max-w-[240px]">
        {row?.original?.recipientBankAccounts?.length > 1 ? (
          `${row?.original?.recipientBankAccounts?.length} bank accounts`
        ) : row?.original?.recipientBankAccounts?.length === 1 ? (
          <>
            <Typography>{row?.original?.recipientBankAccounts[0]?.accountNumberLast4}</Typography>
            <Typography color="secondary" variant="caption" classNames="truncate">
              {row?.original?.recipientBankAccounts[0]?.bankName}
            </Typography>
          </>
        ) : (
          '-'
        )}
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="!px-3 capitalize">
      <div>{row?.original?.type}</div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="!px-3">
      <div>{row?.original?.updatedAt ? format(new Date(row?.original?.updatedAt), 'dd MMM yyyy, hh:mm') : ''}</div>
    </BaseTable.Body.Row.Cell>
  </>
)

export default RowRecipientsV2
