/* eslint-disable @typescript-eslint/no-shadow */
import { FC, useMemo } from 'react'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import SignerTableRowItem from './SignerTableRowItem'
import { TransactionActionButtons } from '@/views/PendingApproval/components'
import { IParsedPendingTransaction } from '@/slice/pending-transactions/pending-transactions.dto'

export interface ISigner {
  owner: string
  ownerContact: any
  submissionDate: string
  transactionHash: string
  pending?: boolean
  isRejectedTransaction?: boolean
  status: 'pending' | 'confirmed' | 'rejected'
}

interface ISignerTabProps {
  owners: string[]
  signers: ISigner[]
  isRejectedTransaction: boolean
  onAddContact: (address: string) => void
  transaction: IParsedPendingTransaction
  onClickRejectTransaction: (data: any, e: any) => void
  onClickApproveTransaction: (data: any, e: any) => void
  onClickExecuteRejection: (data: any, e: any) => void
  onClickExecuteTransaction: (data: any, e: any) => void
  isLoading: boolean
  permissonMap: any
}

const columns = [
  {
    Header: 'Signer',
    accessor: 'signer'
  },
  {
    Header: 'Status',
    accessor: 'status'
  }
]

const SignerTab: FC<ISignerTabProps> = ({
  owners,
  signers,
  isRejectedTransaction,
  transaction,
  onClickRejectTransaction,
  onClickApproveTransaction,
  onClickExecuteRejection,
  onClickExecuteTransaction,
  onAddContact,
  isLoading,
  permissonMap
}) => {
  const { confirmedSigners, pendingSigners } = useMemo(() => {
    if (!owners) {
      return { confirmedSigners: [], pendingSigners: [] }
    }
    const normalizedOwners = owners.map((owner) => owner.toLowerCase())

    const confirmedSigners: ISigner[] = signers
      .filter((signer) => normalizedOwners.includes(signer.owner.toLowerCase()))
      .map((signer) => ({
        ...signer,
        isRejectedTransaction,
        status: isRejectedTransaction ? 'rejected' : 'confirmed'
      }))

    const pendingSigners: ISigner[] = normalizedOwners
      .filter((normalizedOwner) => !signers.some((signer) => signer.owner.toLowerCase() === normalizedOwner))
      .map((normalizedOwner) => ({
        owner: normalizedOwner,
        ownerContact: null,
        submissionDate: null,
        transactionHash: null,
        pending: true,
        status: 'pending'
      }))

    return { confirmedSigners, pendingSigners }
  }, [signers, owners])

  return (
    <div className="mt-6 h-[calc(100vh-160px)]  flex flex-col justify-between">
      <SimpleTable
        isLoading={isLoading}
        tableHeight="max-h-[calc(100vh-160px)]"
        columns={columns}
        data={[...confirmedSigners, ...pendingSigners] || []}
        renderRow={(row) => <SignerTableRowItem signer={row?.original} onAddContact={onAddContact} />}
        noData={
          <div className="p-8 flex justify-center">
            <EmptyData loading={isLoading}>
              <EmptyData.Icon />
              <EmptyData.Title>No Signers Found</EmptyData.Title>
            </EmptyData>
          </div>
        }
      />
      <div className="pb-6">
        <TransactionActionButtons
          id="signer-detail-tab"
          permissonMap={permissonMap}
          onClickExecuteTransaction={onClickExecuteTransaction}
          onClickRejectTransaction={onClickRejectTransaction}
          onClickApproveTransaction={onClickApproveTransaction}
          onClickExecuteRejection={onClickExecuteRejection}
          transaction={transaction}
        />
      </div>
    </div>
  )
}

export default SignerTab
