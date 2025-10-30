/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC } from 'react'
import Image from 'next/legacy/image'
import { format } from 'date-fns'
import { IParsedQueuedTransaction } from '../interface'
import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { CryptoInfoDisplay } from '@/components-v2/molecules/CryptoInfoDisplay'
import { FiatCurrencyDisplay } from '@/components-v2/molecules/FiatCurrencyDisplay'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import TransactionActionButtons from './TransactionactionButtons'

import GreenCheck from '@/public/svg/icons/check-success.svg'
import RedCross from '@/public/svg/icons/cancel-icon-red.svg'

interface IRecipientItemRowItemProps {
  transaction: IParsedQueuedTransaction
  onClickRejectTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickApproveTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedQueuedTransaction, e: any) => void
  isParsingTransactionOwnership?: boolean
}

const TransactionRowItem: FC<IRecipientItemRowItemProps> = ({
  transaction,
  isParsingTransactionOwnership,
  onClickApproveTransaction,
  onClickRejectTransaction,
  onClickExecuteTransaction,
  onClickExecuteRejection
}) => (
  <>
    <BaseTable.Body.Row.Cell>{transaction?.nonce}</BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <Typography classNames="mb-1" variant="body2">
        {transaction?.wallet?.name}
      </Typography>
      <WalletAddressCopy address={transaction?.wallet?.address}>
        <WalletAddressCopy.Link address={transaction?.wallet?.address} linkType="address" />
        <WalletAddressCopy.Copy address={transaction?.wallet?.address} />
      </WalletAddressCopy>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <div>
        <Typography variant="body2">
          {transaction?.isRejected
            ? 'On-Chain Rejection'
            : `${transaction?.recipients?.length} Recipient${transaction?.recipients?.length > 1 ? 's' : ''}`}
        </Typography>

        <Typography classNames="mt-1" color="secondary" variant="caption">
          {transaction?.submissionDate ? format(new Date(transaction?.submissionDate), 'do MMM yyyy, h:mm a') : '-'}
        </Typography>
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      {!transaction?.isFinishedParsingData ? (
        <>
          <div className="flex flex-row gap-2">
            <SkeletonLoader variant="circle" size={16} />
            <SkeletonLoader variant="rounded" height={16} width={70} />
          </div>
          <div className="flex flex-row gap-2">
            <SkeletonLoader variant="circle" size={16} />
            <SkeletonLoader variant="rounded" height={16} width={70} />
          </div>{' '}
        </>
      ) : transaction?.isRejected ? (
        <Typography>-</Typography>
      ) : (
        <>
          {transaction?.cryptocurrencies?.length > 1 ? (
            <Typography classNames="mb-1" variant="body2">
              {transaction?.cryptocurrencies?.length} Assets
            </Typography>
          ) : (
            <CryptoInfoDisplay
              symbol={transaction?.cryptocurrencies?.[0]?.symbol}
              image={transaction?.cryptocurrencies?.[0]?.image}
              amount={String(transaction?.cryptocurrencies?.[0]?.totalCryptocurrencyAmount)}
            />
          )}
          <FiatCurrencyDisplay
            iso={transaction?.fiatCurrencyData?.iso}
            currencyCode={transaction?.fiatCurrencyData?.code}
            currencySymbol={transaction?.fiatCurrencyData?.symbol}
            fiatAmount={String(transaction?.fiatTotalAmount)}
            textColor="secondary"
          />
        </>
      )}
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <div className="flex items-center gap-2">
        {isParsingTransactionOwnership ? (
          <SkeletonLoader variant="rounded" height={20} width={100} />
        ) : (
          <>
            <Image src={transaction?.isRejected ? RedCross : GreenCheck} alt="green-check" height={14} width={14} />
            <Typography color={transaction?.isRejected ? 'error' : 'success'}>
              {transaction?.confirmations?.length}/{transaction?.confirmationsRequired}{' '}
              {transaction?.isRejected ? 'Rejected' : 'Confirmed'}
            </Typography>
          </>
        )}
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell extendedClass="w-[200px]">
      <div className="h-[50px]">
        <TransactionActionButtons
          id="transaction-row"
          transaction={transaction}
          isParsingTransactionOwnership={isParsingTransactionOwnership}
          onClickExecuteRejection={onClickExecuteRejection}
          onClickRejectTransaction={onClickRejectTransaction}
          onClickApproveTransaction={onClickApproveTransaction}
          onClickExecuteTransaction={onClickExecuteTransaction}
        />
      </div>
    </BaseTable.Body.Row.Cell>
  </>
)

export default TransactionRowItem
