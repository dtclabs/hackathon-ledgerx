import Typography from '@/components-v2/atoms/Typography'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import CreditCardIcon from '@/public/svg/icons/credit-card-icon.svg'
import { CardTransactionStatus, CardTransactionType, ICardTransaction } from '@/slice/cards/cards-type'
import { currencyToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import Image from 'next/image'
import React from 'react'
import ReactTooltip from 'react-tooltip'

export const STATUS_COLOR = {
  [CardTransactionStatus.PENDING]: '!text-warning-500',
  [CardTransactionStatus.REVERTED]: '!text-neutral-900',
  [CardTransactionStatus.DECLINED]: '!text-error-500'
}

const TransactionItem: React.FC<{ transaction: ICardTransaction; countrySetting }> = ({
  transaction,
  countrySetting
}) => (
  <>
    <BaseTable.Body.Row.Cell>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-between bg-[#FFFDE2] p-[10px] rounded-full">
          <Image src={CreditCardIcon} alt="icon" width={20} height={20} />
        </div>

        <div className="flex flex-col gap-1">
          <Typography variant="body2">{transaction?.metadata?.description}</Typography>
          {transaction?.status !== CardTransactionStatus.COMPLETED && (
            <Typography classNames={`uppercase !text-[10px] font-bold ${STATUS_COLOR[transaction?.status]}`}>
              {transaction?.status}
            </Typography>
          )}
        </div>
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <div
        className="flex flex-col gap-1 w-fit"
        data-tip={`card-txn-amount-${transaction?.id}`}
        data-for={`card-txn-amount-${transaction?.id}`}
      >
        <Typography variant="body2" styleVariant="semibold">
          {transaction?.type === CardTransactionType.REFUND ? '+' : '-'}{' '}
          {`${transaction?.requestedCurrency?.symbol}${currencyToWord(
            transaction?.requestedAmount,
            CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
            countrySetting?.iso,
            2
          )} ${transaction?.requestedCurrency?.code}`}
        </Typography>

        <Typography variant="caption" color="secondary">
          {`${transaction?.requestedCurrency?.symbol}${currencyToWord(
            transaction?.requestedAmount,
            CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
            countrySetting?.iso,
            2
          )} ${transaction?.requestedCurrency?.code}`}
        </Typography>
      </div>
      <ReactTooltip
        id={`card-txn-amount-${transaction?.id}`}
        borderColor="#eaeaec"
        border
        place="top"
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        className="!opacity-100 !rounded-lg max-w-[220px] !px-3"
      >
        <div className="flex flex-col gap-1">
          <Typography variant="body2" styleVariant="semibold">
            {transaction?.type === CardTransactionType.REFUND ? '+' : '-'}{' '}
            {`${transaction?.requestedCurrency?.symbol}${formatNumberWithCommasBasedOnLocale(
              transaction?.requestedAmount,
              countrySetting?.iso
            )} ${transaction?.requestedCurrency?.code}`}
          </Typography>

          <Typography variant="caption" color="secondary">
            {`${transaction?.requestedCurrency?.symbol}${formatNumberWithCommasBasedOnLocale(
              transaction?.requestedAmount,
              countrySetting?.iso
            )} ${transaction?.requestedCurrency?.code}`}
          </Typography>
        </div>
      </ReactTooltip>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <div className="flex flex-col gap-1">
        <Typography variant="body2">{transaction?.card?.truncatedNumber}</Typography>
        <Typography variant="caption" color="secondary">
          {transaction?.card?.displayName}
        </Typography>
      </div>
    </BaseTable.Body.Row.Cell>
  </>
)

export default TransactionItem
