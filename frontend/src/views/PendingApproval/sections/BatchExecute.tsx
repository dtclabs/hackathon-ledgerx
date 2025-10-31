import { FC } from 'react'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'

interface IBatchExecuteProps {
  isBatchExecuteEnabled: boolean
  selectedTransactionsCount: number
  onClickBatchExecute: () => void
  onClickCancelBatchExecute: () => void
  isLoading: boolean
  isDisabled: boolean
}

const BatchExecute: FC<IBatchExecuteProps> = ({
  isBatchExecuteEnabled,
  selectedTransactionsCount,
  onClickBatchExecute,
  isLoading,
  isDisabled,
  onClickCancelBatchExecute
}) => (
  <div className="flex flex-row-reverse my-2 gap-2">
    <Button
      variant="black"
      height={40}
      label={`Batch Execute ${selectedTransactionsCount > 0 ? `(${selectedTransactionsCount})` : ''}`}
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
        Please select a Safe first.
      </ReactTooltip>
    )}
    {isBatchExecuteEnabled && <Button variant="grey" height={40} label="Cancel" onClick={onClickCancelBatchExecute} />}
  </div>
)

export default BatchExecute
