/* eslint-disable arrow-body-style */
import { FC, useEffect, useMemo, useState } from 'react'
import TabItem from '@/components/TabsComponent/TabItem'
import useSafeService from '@/hooks-v2/useSafeService'
import { toast } from 'react-toastify'
import { IParsedQueuedTransaction, IGnosisTransactionInfo } from '../../interface'
import { DetailTab } from './DetailTab'
import { SignerTab } from './SignerTab'
import { useAppSelector } from '@/state'
import { selectChainByName } from '@/slice/chains/chain-selectors'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'

interface ITransactionDetailModalContentProps {
  transaction: IParsedQueuedTransaction
  onClickRejectTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickApproveTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedQueuedTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedQueuedTransaction, e: any) => void
  onAddContact: (address: string) => void
  isOpen: boolean
  isParsingTransactionOwnership: boolean
}

const TransactionDetailModalContent: FC<ITransactionDetailModalContentProps> = ({
  transaction,
  onClickRejectTransaction,
  onClickExecuteRejection,
  onClickApproveTransaction,
  onClickExecuteTransaction,
  isParsingTransactionOwnership,
  onAddContact,
  isOpen
}) => {
  const selectedTransactionChain = useAppSelector((state) => selectChainByName(state, transaction?.blockchainId))
  const [owners, setOwners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  // const [gnosisTransactionData, setGnosisTransactionData] = useState<IGnosisTransactionInfo | null>(null)

  // Able to see safe data of any chain regardless if have network or not
  const safeService = useSafeService({
    initialRpcUrl: selectedTransactionChain?.rpcUrl,
    initialSafeUrl: selectedTransactionChain?.safeUrl
  })

  const [activeTab, setActiveTab] = useState<string>('detail')

  const fetchGnosisInfo = async () => {
    try {
      setIsLoading(true)
      const sourceSafeInfo = await safeService.getSafeInfo({ address: transaction?.wallet?.address })
      // const txInfo = await safeService.getTransactionInfo({ safeTxHash: transaction?.safeHash })
      // setGnosisTransactionData(txInfo)
      setOwners(sourceSafeInfo?.owners ?? [])
      setIsLoading(false)
    } catch (err) {
      // TODO - Handle Error
    }
  }

  useEffect(() => {
    if (isOpen && transaction) {
      fetchGnosisInfo()
    }
    if (!isOpen) {
      setActiveTab('detail')
      setIsLoading(true)
    }
  }, [isOpen, transaction])

  const memoizedParseSignerData = useMemo(() => {
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
  }, [transaction])

  if (!transaction) return null

  const detailTabs = [
    {
      key: 'detail',
      name: 'Overview',
      active: true
    },
    {
      key: 'signer',
      name: 'Signers',
      active: false,
      count: owners?.length ?? 0
    }
  ]

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
            isParsingTransactionOwnership={isParsingTransactionOwnership}
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
            transaction={transaction}
            isRejectedTransaction={transaction?.isRejected}
            onClickRejectTransaction={onClickRejectTransaction}
            onClickExecuteRejection={onClickExecuteRejection}
            onClickApproveTransaction={onClickApproveTransaction}
            onClickExecuteTransaction={onClickExecuteTransaction}
            isParsingTransactionOwnership={isParsingTransactionOwnership}
            owners={owners}
            signers={memoizedParseSignerData}
            onAddContact={onAddContact}
          />
        </TabItem>
      </UnderlineTabs>
    </div>
  )
}

export default TransactionDetailModalContent
