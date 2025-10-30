import { FC } from 'react'
import Button from '@/components-v2/atoms/Button'
import TransactionRowItem from './TransactionRowItem'
import Typography from '@/components-v2/atoms/Typography'
import TransactionSkeletonRow from './TransactionSkeletonRow'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'

const columns = [
  {
    Header: '#',
    accessor: 'nonce'
  },
  {
    Header: 'Safe',
    accessor: 'safe'
  },
  {
    Header: 'To',
    accessor: 'to'
  },
  {
    Header: 'Asset Amount',
    accessor: 'amount'
  },
  {
    Header: 'Status',
    accessor: 'status'
  },
  {
    Header: 'Actions',
    accessor: 'actions'
  }
]

interface IPendingSectionProps {
  data: any
  onClickRow: any
  isLoading: boolean
  isParsingTransactionOwnership: boolean
  onClickRejectTransaction: (data: any, e: any) => void
  onClickApproveTransaction: (data: any, e: any) => void
  onClickExecuteRejection: (data: any, e: any) => void
  onClickExecuteTransaction: (data: any, e: any) => void
}

const PendingSection: FC<IPendingSectionProps> = ({
  data,
  onClickRow,
  isLoading,
  isParsingTransactionOwnership,
  onClickApproveTransaction,
  onClickRejectTransaction,
  onClickExecuteTransaction,
  onClickExecuteRejection
}) => (
  <div>
    <div className="flex flex-row items-center gap-2 mb-4">
      <Typography variant="subtitle1">Remaining Transactions in Queue</Typography>

      <Button
        height={32}
        variant="grey"
        disabled
        label={`${data?.length ?? 0}`}
        classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
      />
      <Typography variant="caption" color="secondary">
        Please approve or reject the following transactions to execute them above
      </Typography>
    </div>
    <SimpleTable
      columns={columns}
      data={data}
      noData={
        isLoading ? (
          <TransactionSkeletonRow emptyRows={5} />
        ) : data?.length === 0 ? (
          <EmptyData>
            <EmptyData.Icon />
            <EmptyData.Title>No Pending Transactions</EmptyData.Title>
            <EmptyData.Subtitle>Once you have created transactions, they will be displayed here</EmptyData.Subtitle>
          </EmptyData>
        ) : null
      }
      isLoading={isLoading}
      onClickRow={onClickRow}
      defaultPageSize={100}
      renderRow={(row) => (
        <TransactionRowItem
          isParsingTransactionOwnership={isParsingTransactionOwnership}
          onClickExecuteTransaction={onClickExecuteTransaction}
          onClickExecuteRejection={onClickExecuteRejection}
          onClickApproveTransaction={onClickApproveTransaction}
          onClickRejectTransaction={onClickRejectTransaction}
          transaction={row?.original}
        />
      )}
    />
  </div>
)

export default PendingSection
