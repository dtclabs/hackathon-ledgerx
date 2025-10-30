/* eslint-disable react/no-array-index-key */
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import Checkbox from '@/components/Checkbox/Checkbox'
import { TransactionTableColumn } from '../interface'

const TransactionsLoading = ({ emptyRows = 25, txnTableColumns }) => (
  <tbody className="border-0">
    {[...Array(emptyRows).keys()].map((item, index) => (
      <tr key={`txns-loading-${index}`} className="h-[61px]" style={{ borderBottom: '1px solid #F1F1EF' }}>
        <td id="activity" className="w-[75px] border-r border-[#E2E2E0]">
          <div className="flex justify-center flex-col items-center gap-1 p-2">
            <SkeletonLoader variant="rounded" height={12} width={20} />
            <SkeletonLoader variant="rounded" height={12} width={60} />
          </div>
        </td>
        <td id="checkbox" className="py-3">
          <div className="flex justify-center flex-col items-center gap-2 px-4 cursor-pointer">
            <SkeletonLoader variant="rounded" height={12} width={20} />
          </div>
        </td>
        {txnTableColumns[TransactionTableColumn.DATE] && (
          <td id={TransactionTableColumn.DATE} className="py-3 pl-2">
            <SkeletonLoader variant="rounded" height={12} width={40} />
            <SkeletonLoader variant="rounded" height={12} width={60} />
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.TYPE] && (
          <td id={TransactionTableColumn.TYPE} className="pl-2 py-3">
            <SkeletonLoader variant="rounded" height={12} width={60} />
            <SkeletonLoader variant="rounded" height={12} width={40} />
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.FROM_TO] && (
          <td id={TransactionTableColumn.FROM_TO} className="pl-2 py-3">
            <div className="flex flex-col gap-1">
              <SkeletonLoader variant="rounded" height={12} width={150} />
              <SkeletonLoader variant="rounded" height={12} width={150} />
            </div>
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.IN] && (
          <td id={TransactionTableColumn.IN} className="pl-2 py-3">
            <div className="flex flex-col gap-1">
              <SkeletonLoader variant="rounded" height={12} width={100} />
              <SkeletonLoader variant="rounded" height={12} width={100} />
            </div>
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.OUT] && (
          <td id={TransactionTableColumn.OUT} className="pl-2 py-3">
            <div className="flex flex-col gap-1">
              <SkeletonLoader variant="rounded" height={12} width={100} />
              <SkeletonLoader variant="rounded" height={12} width={100} />
            </div>
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.GAIN_LOSS] && (
          <td id={TransactionTableColumn.GAIN_LOSS} className="pl-2 py-3">
            <SkeletonLoader variant="rounded" height={12} width={100} />
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.TAGS] && (
          <td id={TransactionTableColumn.TAGS} className="pl-2 py-3">
            <SkeletonLoader variant="rounded" height={16} width={120} />
          </td>
        )}
        {txnTableColumns[TransactionTableColumn.ACCOUNT] && (
          <td id={TransactionTableColumn.ACCOUNT} className="pl-2 py-3">
            <SkeletonLoader variant="rounded" height={16} width={150} />
          </td>
        )}
      </tr>
    ))}
  </tbody>
)

export default TransactionsLoading
