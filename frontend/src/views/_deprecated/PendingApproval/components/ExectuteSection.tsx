import { FC } from 'react'
import { IParsedQueuedTransaction } from '../interface'
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
    Header: 'Total Asset Amount',
    accessor: 'amount'
  },
  {
    Header: 'Signer Status',
    accessor: 'status'
  },
  {
    Header: 'Actions',
    accessor: 'actions'
  }
]

interface IExecuteSectionProps {
  data: IParsedQueuedTransaction[]
  onClickRow: any
  isLoading: boolean
  isParsingTransactionOwnership: boolean
  onClickRejectTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickApproveTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedQueuedTransaction, e: any) => void
}

const ExectuteSection: FC<IExecuteSectionProps> = ({
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
      <Typography variant="subtitle1">Next</Typography>
      <Typography variant="caption" color="secondary">
        You must execute this transaction before executing others in queue
      </Typography>
    </div>
    <SimpleTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      noData={
        isLoading ? (
          <TransactionSkeletonRow emptyRows={2} />
        ) : data?.length === 0 ? (
          <EmptyData>
            <EmptyData.Icon />
            <EmptyData.Title>No Transactions</EmptyData.Title>
            <EmptyData.Subtitle>Once you have created transactions, they will be displayed here</EmptyData.Subtitle>
          </EmptyData>
        ) : null
      }
      onClickRow={onClickRow}
      renderRow={(row) => (
        <TransactionRowItem
          onClickExecuteRejection={onClickExecuteRejection}
          onClickExecuteTransaction={onClickExecuteTransaction}
          onClickApproveTransaction={onClickApproveTransaction}
          onClickRejectTransaction={onClickRejectTransaction}
          transaction={row?.original}
          isParsingTransactionOwnership={isParsingTransactionOwnership}
        />
      )}
    />
  </div>
)

export default ExectuteSection
