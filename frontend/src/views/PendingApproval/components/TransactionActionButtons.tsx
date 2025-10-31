/* eslint-disable no-lone-blocks */
import { FC } from 'react'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { PENDING_TX_TOOLTIP_COPY } from '../pending-approval.constants'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import type { IParsedPendingTransaction } from '@/slice/pending-transactions/pending-transactions.dto'

interface ITransactionActionButtonsProps {
  id: string
  transaction: IParsedPendingTransaction
  onClickRejectTransaction?: (data: IParsedPendingTransaction, e: any) => void
  onClickApproveTransaction?: (data: IParsedPendingTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedPendingTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedPendingTransaction, e: any) => void
  isDisabled?: boolean
  permissonMap: any
}

const TransactionActionButtons: FC<ITransactionActionButtonsProps> = ({
  id,
  transaction,
  isDisabled = false,
  permissonMap,
  onClickRejectTransaction,
  onClickApproveTransaction,
  onClickExecuteRejection,
  onClickExecuteTransaction
}) => {
  const handleOnClickRejectTransaction = (_e) => {
    _e.stopPropagation()
    _e.preventDefault()
    onClickRejectTransaction(transaction, _e)
  }

  const handleOnClickExecuteRejection = (_e) => {
    _e.stopPropagation()
    _e.preventDefault()
    // Transactions which are rejected by the user - Need to be finalized on chain
    onClickExecuteRejection(transaction, _e)
  }

  const handleOnClickApproveTransaction = (_e) => {
    _e.stopPropagation()
    _e.preventDefault()
    onClickApproveTransaction(transaction, _e)
  }
  const handleOnClickExecuteTransaction = (_e) => {
    _e.stopPropagation()
    _e.preventDefault()
    onClickExecuteTransaction(transaction, _e)
  }

  const isExecuteButtonDisabled = () => {
    if (!transaction?.isTransactionExecutable || isDisabled) return true
    if (!permissonMap[transaction?.id]?.isConnectedAccountOwner) return true
    if (transaction?.isQueued) return true

    return false
  }

  const isApprovalButtonDisabled = () => {
    if (
      permissonMap[transaction?.id]?.isConnectedAccountOwner &&
      !permissonMap[transaction?.id]?.isExecutedByConnectedAccount
    ) {
      return false
    }

    return true
  }

  const isRejectButtonDisabled = () => {
    if (
      !transaction.isRejected &&
      permissonMap[transaction?.id]?.isConnectedAccountOwner &&
      !permissonMap[transaction?.id]?.isExecutedByConnectedAccount
    ) {
      return false
    }
    return true
  }

  return (
    <section id="cta-buttons">
      {transaction?.isTransactionExecutable ? (
        <div>
          {!permissonMap[transaction?.id] ? (
            <div className="">
              <SkeletonLoader variant="box" height={40} width={160} />
            </div>
          ) : (
            <Button
              label={transaction?.isRejected ? 'Execute Rejection' : 'Execute'}
              height={40}
              data-tip={`execute-transaction-button-${transaction?.id}-${id}`}
              data-for={`execute-transaction-button-${transaction?.id}-${id}`}
              disabled={isExecuteButtonDisabled()}
              onClick={transaction?.isRejected ? handleOnClickExecuteRejection : handleOnClickExecuteTransaction}
              width="w-[160px]"
              variant="black"
            />
          )}{' '}
          {isExecuteButtonDisabled() && (
            <ReactTooltip
              id={`execute-transaction-button-${transaction?.id}-${id}`}
              borderColor="#eaeaec"
              border
              place="left"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {!permissonMap[transaction?.id]?.isConnectedAccountOwner
                ? PENDING_TX_TOOLTIP_COPY.notOwner
                : PENDING_TX_TOOLTIP_COPY.transactionQueued}
            </ReactTooltip>
          )}
        </div>
      ) : (
        <div>
          {!permissonMap[transaction?.id] ? (
            <div className="flex mt-1 h-[100%] flex-row  gap-2 ">
              <SkeletonLoader variant="box" height={40} width={79} />
              <SkeletonLoader variant="box" height={40} width={79} />
            </div>
          ) : (
            <div className="flex  h-[100%] flex-row gap-2">
              <Button
                onClick={handleOnClickRejectTransaction}
                disabled={isRejectButtonDisabled()}
                height={40}
                label="Reject"
                variant="ghost"
                data-tip={
                  transaction.isRejected &&
                  permissonMap[transaction?.id]?.isConnectedAccountOwner &&
                  !permissonMap[transaction?.id]?.isExecutedByConnectedAccount
                    ? `rejection-buttons-${transaction?.id}-${id}`
                    : `confirmation-buttons-${transaction?.id}-${id}`
                }
                data-for={
                  transaction.isRejected &&
                  permissonMap[transaction?.id]?.isConnectedAccountOwner &&
                  !permissonMap[transaction?.id]?.isExecutedByConnectedAccount
                    ? `rejection-buttons-${transaction?.id}-${id}`
                    : `confirmation-buttons-${transaction?.id}-${id}`
                }
              />
              <Button
                onClick={handleOnClickApproveTransaction}
                disabled={isApprovalButtonDisabled()}
                height={40}
                label="Approve"
                variant="black"
                data-tip={`confirmation-buttons-${transaction?.id}-${id}`}
                data-for={`confirmation-buttons-${transaction?.id}-${id}`}
              />
              {isApprovalButtonDisabled() && (
                <ReactTooltip
                  id={`confirmation-buttons-${transaction?.id}-${id}`}
                  borderColor="#eaeaec"
                  border
                  place="left"
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg"
                >
                  {permissonMap[transaction?.id]?.isExecutedByConnectedAccount
                    ? PENDING_TX_TOOLTIP_COPY.executedByOwner
                    : !permissonMap[transaction?.id]?.isConnectedAccountOwner
                    ? PENDING_TX_TOOLTIP_COPY.notOwner
                    : PENDING_TX_TOOLTIP_COPY.transactionQueued}
                </ReactTooltip>
              )}
              {isRejectButtonDisabled() && !isApprovalButtonDisabled() && (
                <ReactTooltip
                  id={`rejection-buttons-${transaction?.id}-${id}`}
                  borderColor="#eaeaec"
                  border
                  place="left"
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg"
                >
                  {transaction?.isRejected && PENDING_TX_TOOLTIP_COPY.alreadyRejected}
                </ReactTooltip>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default TransactionActionButtons
