/* eslint-disable arrow-body-style */
import { FC, useState, useEffect } from 'react'
import TabItem from '@/components/TabsComponent/TabItem'
import type { IParsedPendingTransaction } from '@/slice/pending-transactions/pending-transactions.dto'
import { DetailTab } from './DetailTab'
import { SignerTab } from './SignerTab'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import useSafeService from '@/hooks-v2/useSafeService'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'

interface ITransactionDetailModalContentProps {
  transaction: IParsedPendingTransaction
  onClickRejectTransaction: (data: IParsedPendingTransaction, e: any) => void
  onClickApproveTransaction: (data: IParsedPendingTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedPendingTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedPendingTransaction, e: any) => void
  onAddContact: (address: string) => void
  isOpen: boolean
  permissonMap: any
}

const TransactionDetail: FC<ITransactionDetailModalContentProps> = ({
  transaction,
  onClickRejectTransaction,
  onClickExecuteRejection,
  onClickApproveTransaction,
  onClickExecuteTransaction,
  onAddContact,
  isOpen,
  permissonMap
}) => {
  const [activeTab, setActiveTab] = useState<string>('detail')
  const [owners, setOwners] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)

  const safeService = useSafeService({
    initialRpcUrl: selectedChain?.rpcUrl,
    initialSafeUrl: selectedChain?.safeUrl
  })

  const getOwners = async (tx) => {
    const pendingGetOwners = await safeService.getSafeInfo({ address: tx.wallet?.address })

    return {
      owners: pendingGetOwners?.owners
    }
  }

  useEffect(() => {
    if (!isOpen) setActiveTab('detail')
  }, [isOpen])

  useEffect(() => {
    setIsLoading(true)

    if (transaction && transaction.blockchainId) {
      const transactionChain = supportedChains.find((chain) => chain.id === transaction.blockchainId)
      safeService.updateUrls(transactionChain?.rpcUrl, transactionChain?.safeUrl)
      getOwners(transaction).then((data) => {
        setOwners(data.owners)
        setIsLoading(false)
      })
    }
  }, [transaction])

  const memoizedParseSignerData = () => {
    let signers = []
    if (transaction?.confirmations?.length > 0) {
      signers = transaction?.confirmations.map((confirmation) => ({
        owner: confirmation?.owner,
        ownerContact: confirmation?.ownerContact,
        submissionDate: confirmation?.submissionDate ?? null,
        transactionHash: confirmation?.transactionHash ?? null
      }))
    }
    return signers
  }

  const detailTabs = [
    {
      key: 'detail',
      name: 'Overview'
    },
    {
      key: 'signer',
      name: 'Signers',
      count: owners?.length ?? 0
    }
  ]

  if (!transaction) return null

  return (
    <div className="-mt-5 h-full">
      <UnderlineTabs
        tabs={detailTabs}
        active={activeTab}
        setActive={setActiveTab}
        classNameBtn="font-semibold text-sm px-6 py-[10px]"
        wrapperClassName="border-b-[1px] border-grey-200"
      >
        <TabItem key="detail">
          <DetailTab
            permissonMap={permissonMap}
            onClickRejectTransaction={onClickRejectTransaction}
            onClickExecuteRejection={onClickExecuteRejection}
            onClickApproveTransaction={onClickApproveTransaction}
            transaction={transaction}
            onClickExecuteTransaction={onClickExecuteTransaction}
            onAddContact={onAddContact}
          />
        </TabItem>
        <TabItem key="signer">
          <SignerTab
            owners={owners}
            permissonMap={permissonMap}
            transaction={transaction}
            isRejectedTransaction={transaction?.isRejected}
            onClickRejectTransaction={onClickRejectTransaction}
            onClickExecuteRejection={onClickExecuteRejection}
            onClickApproveTransaction={onClickApproveTransaction}
            onClickExecuteTransaction={onClickExecuteTransaction}
            signers={memoizedParseSignerData()}
            onAddContact={onAddContact}
            isLoading={isLoading}
          />
        </TabItem>
      </UnderlineTabs>
    </div>
  )
}

export default TransactionDetail
