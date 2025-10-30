/* eslint-disable no-lone-blocks */
import { FC } from 'react'
import { useWeb3React } from '@web3-react/core'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { PENDING_TX_TOOLTIP_COPY } from '../constants'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import { IParsedQueuedTransaction } from '../interface'

interface ITransactionActionButtonsProps {
  id: string
  transaction: IParsedQueuedTransaction
  onClickRejectTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickApproveTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedQueuedTransaction, e: any) => void
  isParsingTransactionOwnership: boolean
}

const TransactionActionButtons: FC<ITransactionActionButtonsProps> = ({
  id,
  transaction,
  onClickRejectTransaction,
  onClickApproveTransaction,
  onClickExecuteRejection,
  onClickExecuteTransaction,
  isParsingTransactionOwnership
}) => {
  const { account } = useWeb3React()
  const handleOnClickRejectTransaction = (_e) => {
    _e.stopPropagation()
    onClickRejectTransaction(transaction, _e)
  }

  const handleOnClickConfirmRejection = (_e) => {
    _e.stopPropagation()
    // Transactions which are rejected by the user - Need to be finalized on chain
    onClickExecuteRejection(transaction, _e)
  }

  const handleOnClickApproveTransaction = (_e) => {
    _e.stopPropagation()
    onClickApproveTransaction(transaction, _e)
  }
  const handleOnClickExecuteTransaction = (_e) => {
    _e.stopPropagation()
    onClickExecuteTransaction(transaction, _e)
  }

  const isExecuteButtonDisabled = () => {
    console.log('Ececute')
    if (!transaction?.isTransactionExecutable) return true
    if (!transaction?.isConnectedAccountOwner) return true
    if (transaction?.isQueued) return true

    return false
  }

  const isApprovalButtonDisabled = () => {
    if (transaction?.isConnectedAccountOwner && !transaction?.isExecutedByConnectedAccount) {
      return false
    }

    return true
  }

  return (
    <section id="cta-buttons" className="flex h-[100%]">
      {transaction?.isTransactionExecutable ? (
        <div className="mt-1 flex items-end">
          {isParsingTransactionOwnership ? (
            <div className="">
              <SkeletonLoader variant="box" height={40} width={160} />
            </div>
          ) : (
            <Button
              label={transaction?.isRejected ? 'Execute Rejections' : 'Execute'}
              height={40}
              data-tip={`execute-transaction-button-${transaction?.id}-${id}`}
              data-for={`execute-transaction-button-${transaction?.id}-${id}`}
              disabled={isExecuteButtonDisabled()}
              onClick={transaction?.isRejected ? handleOnClickConfirmRejection : handleOnClickExecuteTransaction}
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
              {!transaction?.isConnectedAccountOwner
                ? PENDING_TX_TOOLTIP_COPY.notOwner
                : PENDING_TX_TOOLTIP_COPY.transactionQueued}
            </ReactTooltip>
          )}
        </div>
      ) : (
        <div>
          {isParsingTransactionOwnership ? (
            <div className="flex mt-1 h-[100%] flex-row gap-2">
              <SkeletonLoader variant="box" height={40} width={79} />
              <SkeletonLoader variant="box" height={40} width={79} />
            </div>
          ) : (
            <div className="flex items-end h-[100%] flex-row gap-2">
              <Button
                onClick={handleOnClickRejectTransaction}
                disabled={isApprovalButtonDisabled()}
                height={40}
                label="Reject"
                variant="ghost"
                data-tip={`confirmation-buttons-${transaction?.id}-${id}`}
                data-for={`confirmation-buttons-${transaction?.id}-${id}`}
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
                  {transaction?.isExecutedByConnectedAccount
                    ? PENDING_TX_TOOLTIP_COPY.executedByOwner
                    : !transaction?.isConnectedAccountOwner
                    ? PENDING_TX_TOOLTIP_COPY.notOwner
                    : PENDING_TX_TOOLTIP_COPY.transactionQueued}
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
