/* eslint-disable arrow-body-style */
import { FC } from 'react'
import Link from 'next/link'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import { Alert } from '@/components-v2/molecules/Alert'
import Typography from '@/components-v2/atoms/Typography'

interface IBatchExecuteProps {
  isNonceMismatch: boolean
  isBatchExecuteEnabled: boolean
  selectedTransactionsCount: number
  onClickBatchExecute: (e: any) => void
  onClickCancelBatchExecute: () => void
  isLoading: boolean
  isDisabled: boolean
  executableTransactionsCount: number
  selectedSafe: any
}

const BatchExecute: FC<IBatchExecuteProps> = ({
  isBatchExecuteEnabled,
  selectedTransactionsCount,
  executableTransactionsCount,
  onClickBatchExecute,
  isLoading,
  isDisabled,
  onClickCancelBatchExecute,
  isNonceMismatch,
  selectedSafe
}) => {
  // const safeChain = selectedSafe?.metadata?.blockchainId
  // const safeAddress = selectedSafe?.address
  return (
    <div className={`flex flex-row ${isNonceMismatch ? 'justify-between' : 'justify-end'} gap-4`}>
      <Alert isVisible={isNonceMismatch} fullWidth variant="warning">
        <Typography classNames="text-[14px]" color="warning">
          {selectedSafe?.name ?? 'Your safe'} contains transactions with lower nonces that our app does not currently
          support. Please execute these transactions directly in the Gnosis Safe interface.{' '}
          {/* <Link target="_blank" href={`https://app.safe.global/home?safe=${safeChain}:${safeAddress}`}>
            <span className="font-semibold cursor-pointer hover:font-bold hover:underline">Gnosis Safe interface</span>
          </Link> */}
        </Typography>
      </Alert>
      <div className={`flex ${isBatchExecuteEnabled ? 'w-[260px]' : 'w-[140px]'}  flex-row-reverse gap-2`}>
        <Button
          variant="black"
          height={40}
          label={
            isBatchExecuteEnabled && selectedTransactionsCount > 0
              ? `Batch Execute (${selectedTransactionsCount})`
              : 'Batch Execute'
          }
          onClick={onClickBatchExecute}
          loading={isLoading}
          disabled={isDisabled}
          data-tip="batch-execute-tooltip"
          data-for="batch-execute-tooltip"
        />
        {isDisabled && (
          <ReactTooltip
            id="batch-execute-tooltip"
            borderColor="#eaeaec"
            border
            place="left"
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            {executableTransactionsCount === 0 ? 'No transactions to execute' : 'Please select a Safe first.'}
          </ReactTooltip>
        )}
        {isBatchExecuteEnabled && (
          <Button variant="grey" height={40} label="Cancel" onClick={onClickCancelBatchExecute} />
        )}
      </div>
    </div>
  )
}

export default BatchExecute
