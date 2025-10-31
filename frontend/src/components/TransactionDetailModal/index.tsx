import { LabelSuccessful, OnChainRejection, ReceivedLabel, StatusPendingLabel } from '@/components/Label/Label'
import OverviewTransactionDetail from '@/components/OverviewTransactionsModal'
import RecipientsModal from '@/components/RecipientsModal'
import SignersModal from '@/components/SignersModal'
import TabItem from '@/components/TabsComponent/TabItem'
import useFreeContext from '@/hooks/useFreeContext'
import { formatEther, parseEther } from 'ethers/lib/utils'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import close from '@/public/svg/close.svg'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { IEditAdditional } from '@/views/TransferApp/interface'
import { useWeb3React } from '@web3-react/core'
import Image from 'next/legacy/image'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactTooltip from 'react-tooltip'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useGetPendingTransactionsQuery } from '@/api-v2/financial-tx-api'
import useSafe from '@/hooks/useSafe'
import Loading from '@/components/Loading'
import { ITransaction } from '@/slice/old-tx/interface'
import { EKeyTransactionDetail, ETypeTransactions, ITransactionDetailModal } from './interface'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import SafeTransactionOverview from '../SafeTransactionOverview'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import Pill from '@/components-v2/atoms/Pill'
import { ISource, SourceType } from '@/slice/wallets/wallet-types'

const TransactionDetailModal: React.FC<ITransactionDetailModal> = ({
  transactionId,
  showModal,
  executeLoading,
  nonExecuteLoading,
  isSource,
  setShowModal,
  queue,
  transactionDetailTabs,
  additionalValue,
  onExecuted,
  confirmLoading,
  isTransactionExecutable,
  isTransactionSignedByAddress,
  onReject,
  onSign,
  title,
  chainId,
  handleBulkDownload,
  setShowRejectionModal,
  setShowExecuteModal
}) => {
  // Hooks
  const { tokens } = useFreeContext()
  const [activeTab, setActiveTab] = useState(transactionDetailTabs[0].key)
  const [safeNonce, setSafeNonce] = useState<number>()
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [source, setSource] = useState<ISource>()
  const [transactionValueModal, setTransactionValueModal] = useState<ITransaction>()
  const [showWarningBannerOnOverview, setShowWarningBannerOnOverview] = useState(false)
  // Custom hook and contextApi
  const { account, library } = useWeb3React()
  const { loadSafe } = useSafe()
  const safeService = useSafeServiceClient()
  const [transactionType, setTransactionType] = useState<string>('Pending') // TODO: This can actually be removed as it is legacy carryover from when pending approvals was part of transactions tab
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const [owners, setOwners] = useState<any>()
  const selectedChain = useAppSelector(selectedChainSelector)
  const { data: pendingTransactionsData, isLoading: isLoadingPendingTransactions } = useGetPendingTransactionsQuery({
    orgId: organizationId,
    params: {
      blockchainIds: selectedChain?.id
    }
  })
  const isMultiLinePaymentEnabled = useAppSelector((state) => selectFeatureState(state, 'isMultiLinePaymentEnabled'))

  // React-hook-form
  const { control, handleSubmit, reset } = useForm<IEditAdditional>({
    mode: 'all',
    defaultValues: {
      editNotes: additionalValue?.editNotes || '',
      editCategory: additionalValue?.editCategory?.value ? additionalValue?.editCategory : null,
      files: additionalValue?.files || []
    }
  })

  useEffect(() => {
    /* eslint-disable no-unused-expressions */
    const getTempData = async () => {
      const transactions = await Promise.all(
        // @ts-ignore TS2339
        pendingTransactionsData.map(async (transaction) => {
          const safe = await loadSafe(transaction.wallet.address)
          const currentNonce = await safe?.getNonce()
          const safeOwners = await safe?.getOwners()
          if (!safeOwners || !safeOwners.includes(account)) transaction = { ...transaction, notAnOwner: true }
          transaction = { ...transaction, currentNonce }
          if (transaction.safeTransaction.nonce === transaction.currentNonce)
            transaction = { ...transaction, isReady: true }
          if (!transaction.recipients) {
            transaction = { ...transaction, recipients: [{ address: transaction.to }] }
          }
          if (
            transaction.safeTransaction &&
            transaction.safeTransaction.value === '0' &&
            !transaction.safeTransaction.data &&
            !transaction.safeTransaction.dataDecoded
          ) {
            transaction = { ...transaction, isRejectTransaction: true }
          }
          return transaction
        })
      )
      setPendingTransactions(transactions)
    }

    pendingTransactionsData && getTempData()
  }, [pendingTransactionsData, library, selectedChain?.id])

  useEffect(() => {
    if (transactionValueModal) {
      reset({
        editNotes: transactionValueModal?.comment || '',
        editCategory: additionalValue?.editCategory?.value ? additionalValue?.editCategory : null,
        files: transactionValueModal?.files || []
      })
    }
  }, [reset, transactionValueModal])

  useEffect(() => {
    if (!showModal) {
      setTransactionValueModal(undefined)
    }
  }, [showModal])

  useEffect(() => {
    if (transactionId && showModal && pendingTransactions && pendingTransactions.length > 0) {
      const transactionItem = pendingTransactions && pendingTransactions.find((item) => item.id === transactionId)
      if (transactionItem) {
        if (transactionItem.wallet) setSource(isSource(transactionItem.wallet.id))
        setSafeNonce(transactionItem.safeTransaction && transactionItem.safeTransaction.nonce)
        setTransactionValueModal(transactionItem)
      }
    }
  }, [isSource, transactionId, showModal, pendingTransactions])

  const transactionInfo = transactionValueModal
    ? {
        submitTime: transactionValueModal.submissionDate,
        amount: transactionValueModal.recipients.reduce(
          (prev, cur) =>
            (cur.cryptocurrencyAmount && formatEther(parseEther(cur.cryptocurrencyAmount).add(parseEther(prev)))) ||
            prev,
          '0'
        ),
        price: transactionValueModal.recipients.reduce((prev, cur) => parseFloat(cur.fiatAmount) + prev, 0),
        recipients:
          (transactionValueModal.recipients &&
            transactionValueModal.recipients.length !== 1 &&
            `${transactionValueModal.recipients.length} Recipients`) ||
          '1 Recipient',
        from: transactionValueModal.safeTransaction && transactionValueModal.safeTransaction.to
      }
    : undefined

  const getAmountMapForAllCurrencies = (recipients) => {
    const amountMap = new Map()
    const totalCryptoAssets = []
    recipients.forEach((recipient) => {
      const publicId = recipient.cryptocurrency.publicId
      if (amountMap.has(publicId)) {
        const currentObj = amountMap.get(publicId)
        const updatedValue = parseFloat(currentObj.amount) + parseFloat(recipient.cryptocurrencyAmount)
        amountMap.set(publicId, { ...currentObj, amount: updatedValue.toString() })
      } else {
        amountMap.set(publicId, {
          amount: recipient.cryptocurrencyAmount,
          symbol: recipient.cryptocurrency.symbol,
          image: recipient.cryptocurrency.image.small
        })
      }
    })

    amountMap.forEach((amountObj) => totalCryptoAssets.push(amountObj))
    return totalCryptoAssets
  }

  const transactionInfoV2 = transactionValueModal
    ? {
        submitTime: transactionValueModal.submissionDate,
        totalCryptoAssets: getAmountMapForAllCurrencies(transactionValueModal.recipients),
        price: transactionValueModal.recipients.reduce((prev, cur) => parseFloat(cur.fiatAmount) + prev, 0),
        recipients:
          (transactionValueModal.recipients &&
            transactionValueModal.recipients.length !== 1 &&
            `${transactionValueModal.recipients.length} Recipients`) ||
          '1 Recipient',
        from: transactionValueModal.safeTransaction && transactionValueModal.safeTransaction.to
      }
    : undefined

  const handleShowModal = () => {
    setShowModal(false)
  }

  const getSafeInfo = useCallback(async () => {
    try {
      if (
        account &&
        transactionValueModal?.wallet?.sourceType.toLowerCase() === SourceType.GNOSIS &&
        transactionValueModal &&
        safeService &&
        transactionValueModal.wallet.address !== account
      ) {
        const response = await safeService.getSafeInfo(transactionValueModal.wallet.address)
        setOwners(response)
      }
    } catch (err) {
      sentryCaptureException(err)
      // dispatch(setGlobalError('Services not available.'))
    }
  }, [account, safeService, transactionValueModal, library])

  useEffect(() => {
    getSafeInfo()
  }, [getSafeInfo])
  const dataTabs = useMemo(() => {
    const result =
      ((transactionType === 'Incoming' || !transactionValueModal?.recipients) && transactionDetailTabs.slice(0, 1)) ||
      (transactionValueModal && transactionValueModal?.safeTransaction && transactionDetailTabs) ||
      transactionDetailTabs.slice(0, 2)

    return [
      ...result
      // {
      //   key: 'Additional Details',
      //   name: 'Additional Details',
      //   rightImageUrl: '/svg/Edit.svg'
      // }
    ].map((item) =>
      item.name === 'Recipients'
        ? {
            ...item,
            count: (transactionValueModal.recipients && transactionValueModal.recipients.length) || 0
          }
        : item.name === 'Signers'
        ? {
            ...item,
            count: (owners && owners.owners && owners.owners.length) || 0
          }
        : item
    )
  }, [owners, transactionDetailTabs, transactionType, transactionValueModal])

  useEffect(() => {
    if (
      queue &&
      account &&
      transactionValueModal &&
      (transactionValueModal.currentNonce || transactionValueModal.currentNonce === 0) &&
      transactionValueModal.safeTransaction &&
      transactionValueModal.safeTransaction.nonce === transactionValueModal.currentNonce
    ) {
      setShowWarningBannerOnOverview(true)
    }
  }, [queue, account, transactionValueModal])

  const handleRejectTransaction = async (e) => {
    await onReject(transactionValueModal, transactionValueModal.wallet.id, e, handleShowModal)
    setShowRejectionModal(false)
  }

  const handleExecuteTransaction = async (e) => {
    if (transactionValueModal.isRejectTransaction) {
      setShowExecuteModal(true)
      setShowModal(false)
    } else {
      handleExecute(e)
    }
  }

  const handleExecute = async (e) => {
    await onExecuted({
      e,
      sourceId: transactionValueModal.wallet.id,
      transaction: transactionValueModal,
      callback: () => handleShowModal()
    })
  }

  return isLoadingPendingTransactions || !transactionValueModal?.id ? (
    <div className="bg-white rounded-2xl font-inter w-[800px] h-[800px] pt-[50px]">
      <Loading dark title="Fetching Data" />
    </div>
  ) : (
    transactionValueModal?.id && (
      <div className="bg-white rounded-2xl font-inter w-[900px]">
        <div className="flex items-center justify-between px-8 py-9">
          <div className="flex items-center">
            <div className="font-semibold text-2xl text-dashboard-main pr-4 border-r mr-4 whitespace-nowrap">
              {title}
            </div>
            {(transactionValueModal.isRejectTransaction && <OnChainRejection />) ||
              (owners?.threshold > transactionValueModal.safeTransaction.confirmations.length && (
                <StatusPendingLabel status="Pending Signature" />
              )) ||
              (owners?.threshold === transactionValueModal.safeTransaction.confirmations.length && (
                <Pill bgColor="#08b74521" label="Confirmed" fontColor="#0CB746" />
              ))}
          </div>
          <button
            type="button"
            className="p-[14px] w-fit flex items-center justify-center rounded-full bg-remove-icon hover:bg-gray-300"
            onClick={handleShowModal}
          >
            <Image src={close} alt="close" />
          </button>
        </div>
        <UnderlineTabs
          tabs={dataTabs}
          active={activeTab}
          setActive={setActiveTab}
          classNameBtn="font-semibold text-sm px-6 font-inter"
          wrapperClassName="mx-4"
        >
          <TabItem key={EKeyTransactionDetail.OVERVIEW}>
            <div>
              {isMultiLinePaymentEnabled ? (
                <div className="p-4 h-[450px] overflow-auto scrollbar border-dashboard-border">
                  <SafeTransactionOverview
                    payingFrom={transactionValueModal.wallet.address}
                    isRejectTransaction={transactionValueModal.isRejectTransaction}
                    recipients={transactionValueModal.recipients}
                    decimal={transactionValueModal.decimal}
                    chainId={transactionValueModal.blockchainId}
                    numericChainId={chainId}
                    totalCryptoAssets={transactionInfoV2.totalCryptoAssets}
                    totalFiatAmount={transactionInfoV2.price}
                    safeTxnHash={
                      transactionValueModal.safeTransaction && transactionValueModal.safeTransaction.safeTxHash
                    }
                    submitTime={
                      (transactionValueModal &&
                        transactionValueModal.metamaskTransaction &&
                        transactionValueModal.metamaskTransaction.timeStamp) ||
                      (transactionValueModal &&
                        transactionValueModal.safeTransaction &&
                        transactionValueModal.safeTransaction.submissionDate)
                    }
                    handleBulkDownload={handleBulkDownload}
                    remark={transactionValueModal?.notes || null}
                    showWarningBannerOnOverview={showWarningBannerOnOverview}
                    isRejectedTransaction={transactionValueModal?.isRejectTransaction}
                  />
                </div>
              ) : (
                // TODO-PENDING: Remove this modal as not needed in new view
                <div className="p-8 h-[450px] overflow-auto scrollbar-margin">
                  <OverviewTransactionDetail
                    nativeToken={tokens && tokens[0]}
                    fee={transactionValueModal.fee}
                    isExecuted={transactionType !== 'Pending'}
                    to={
                      transactionValueModal &&
                      transactionValueModal.recipients &&
                      transactionValueModal.recipients[0]?.address
                    }
                    isIncoming={transactionType === 'Incoming'}
                    token={transactionValueModal.token}
                    transactionValueOverview={transactionValueModal}
                    submitTime={
                      (transactionValueModal &&
                        transactionValueModal.metamaskTransaction &&
                        transactionValueModal.metamaskTransaction.timeStamp) ||
                      (transactionValueModal &&
                        transactionValueModal.safeTransaction &&
                        transactionValueModal.safeTransaction.submissionDate)
                    }
                    executedTime={transactionValueModal && transactionValueModal.timeStamp}
                    amount={transactionInfo.amount}
                    price={transactionInfo.price}
                    recipients={transactionValueModal.recipients && transactionValueModal.recipients.length.toString()}
                    from={transactionValueModal.wallet.address}
                  />
                </div>
              )}
            </div>
          </TabItem>
          {transactionType === 'Incoming' ? (
            <Fragment key={EKeyTransactionDetail.RECIPIENTS} />
          ) : transactionValueModal.recipients ? (
            <TabItem key={EKeyTransactionDetail.RECIPIENTS}>
              <div className="p-4 h-[450px] overflow-auto scrollbar border-dashboard-border">
                <RecipientsModal
                  isRejectTransaction={transactionValueModal.isRejectTransaction}
                  recipients={transactionValueModal.recipients}
                  decimal={transactionValueModal.decimal}
                />
              </div>
            </TabItem>
          ) : (
            <Fragment key={EKeyTransactionDetail.RECIPIENTS} />
          )}
          {!(transactionType === 'Incoming') && transactionValueModal && transactionValueModal.safeTransaction ? (
            <TabItem key={EKeyTransactionDetail.SIGNERS}>
              <div className="p-4 h-[450px] overflow-auto scrollbar border-dashboard-border">
                <SignersModal
                  isRejectedTransaction={transactionValueModal && transactionValueModal.isRejectTransaction}
                  isExecuted={transactionValueModal && transactionValueModal.isExecuted}
                  listOwner={owners}
                  selectedChain={selectedChain}
                  signers={transactionValueModal.safeTransaction && transactionValueModal.safeTransaction.confirmations}
                />
              </div>
            </TabItem>
          ) : (
            <Fragment key={EKeyTransactionDetail.SIGNERS} />
          )}
        </UnderlineTabs>
        {queue && account && (
          <div className="flex gap-2 p-8 border-t border-dashboard-border-200 font-medium">
            {isTransactionExecutable(transactionValueModal.safeTransaction.confirmationsRequired, {
              ...transactionValueModal.safeTransaction,
              fee: Number(transactionValueModal.safeTransaction.fee)
            }) ? (
              transactionValueModal &&
              transactionValueModal.currentNonce &&
              safeNonce &&
              safeNonce !== transactionValueModal.currentNonce ? (
                <>
                  <div
                    data-tip={transactionValueModal.id}
                    data-for={transactionValueModal.id}
                    className="py-4 mx-auto !font-semibold text-white rounded-[4px] text-center w-full bg-grey-901 opacity-60"
                  >
                    Execute {(transactionValueModal.isRejectTransaction && 'Rejection') || 'Approval'}
                  </div>
                  <ReactTooltip
                    id={transactionValueModal.id}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="!opacity-100 !rounded-lg !text-xs"
                  >
                    {transactionValueModal?.notAnOwner
                      ? 'Please connect a wallet that owns this safe, to enable this action.'
                      : 'To execute this, you need to settle the transaction before it.'}
                  </ReactTooltip>
                </>
              ) : (
                <div className="w-full">
                  <button
                    disabled={confirmLoading || executeLoading || transactionValueModal?.notAnOwner}
                    type="button"
                    data-tip={transactionValueModal.id}
                    data-for={transactionValueModal.id}
                    onClick={handleExecuteTransaction}
                    className="py-4 text-white bg-grey-900 hover:bg-grey-901 rounded-[4px] w-full disabled:bg-grey-901 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Execute {(transactionValueModal.isRejectTransaction && 'Rejection') || 'Approval'}
                  </button>
                  {transactionValueModal?.notAnOwner && (
                    <ReactTooltip
                      id={transactionValueModal.id}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="top"
                      className="!opacity-100 !rounded-lg !text-xs"
                    >
                      Please connect a wallet that owns this safe, to enable this action.
                    </ReactTooltip>
                  )}
                </div>
              )
            ) : isTransactionSignedByAddress(account, {
                ...transactionValueModal.safeTransaction,
                fee: Number(transactionValueModal.safeTransaction.fee)
              }) ? (
              <>
                {!transactionValueModal.isRejectTransaction && (
                  <>
                    <ReactTooltip
                      id={`reject_2_${transactionValueModal.id}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="top"
                      className="!opacity-100 !rounded-lg"
                    >
                      {transactionValueModal?.notAnOwner
                        ? 'Please connect a wallet that owns this safe, to enable this action.'
                        : 'Transaction will be rejected regardless of other signers.'}
                    </ReactTooltip>
                    <button
                      data-tip={`reject_2_${transactionValueModal.id}`}
                      data-for={`reject_2_${transactionValueModal.id}`}
                      type="button"
                      disabled={nonExecuteLoading || transactionValueModal?.notAnOwner}
                      onClick={() => {
                        setShowRejectionModal(true)
                        setShowModal(false)
                      }}
                      className="w-full py-4 text-grey-900 border  border-grey-900 hover:border-grey-901 hover:text-grey-901 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </>
                )}

                <div
                  data-tip={`${transactionValueModal.id}_signed`}
                  data-for={`${transactionValueModal.id}_signed`}
                  className="py-4 mx-auto text-white rounded-[4px] text-center w-full bg-grey-901 opacity-60"
                >
                  Execute
                </div>
                <ReactTooltip
                  id={`${transactionValueModal.id}_signed`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg"
                >
                  {transactionValueModal?.notAnOwner
                    ? 'Please connect a wallet that owns this safe, to enable this action.'
                    : 'Awaiting Confirmation.'}
                </ReactTooltip>
              </>
            ) : transactionValueModal &&
              transactionValueModal.isRejectTransaction &&
              transactionValueModal.safeTransaction &&
              transactionValueModal.safeTransaction.confirmationsRequired >
                transactionValueModal.safeTransaction.confirmations.length ? (
              <>
                <button
                  data-tip={`confirm_reject_${transactionValueModal.id}`}
                  data-for={`confirm_reject_${transactionValueModal.id}`}
                  disabled={nonExecuteLoading || transactionValueModal?.notAnOwner}
                  onClick={async (e) => {
                    await onSign(transactionValueModal, transactionValueModal.wallet.id, e, handleShowModal)
                  }}
                  type="button"
                  className="w-full py-4 text-white bg-grey-900 hover:bg-grey-901 rounded-[4px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
                <ReactTooltip
                  id={`confirm_reject_${transactionValueModal.id}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg"
                >
                  {transactionValueModal?.notAnOwner
                    ? 'Please connect a wallet that owns this safe, to enable this action.'
                    : `${'This transaction has already been rejected. \n Please confirm the rejection to continue.'}`}
                </ReactTooltip>
              </>
            ) : (
              <>
                <button
                  data-tip={`reject_${transactionValueModal.id}`}
                  data-for={`reject_${transactionValueModal.id}`}
                  type="button"
                  disabled={nonExecuteLoading || transactionValueModal?.notAnOwner}
                  onClick={() => {
                    setShowRejectionModal(true)
                    setShowModal(false)
                  }}
                  className="flex-1 py-4 text-grey-900 border  border-grey-900 hover:border-grey-901 hover:text-grey-901 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
                <ReactTooltip
                  id={`reject_${transactionValueModal.id}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg"
                >
                  {transactionValueModal?.notAnOwner
                    ? 'Please connect a wallet that owns this safe, to enable this action.'
                    : 'Transaction will be rejected regardless of other signers.'}
                </ReactTooltip>
                <button
                  disabled={nonExecuteLoading || transactionValueModal?.notAnOwner}
                  onClick={async (e) => {
                    await onSign(transactionValueModal, transactionValueModal.wallet.id, e, handleShowModal)
                  }}
                  type="button"
                  className="flex-1 py-4 text-white bg-grey-900 hover:bg-grey-901 rounded-[4px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span
                    data-tip={`approve_${transactionValueModal.id}`}
                    data-for={`approve_${transactionValueModal.id}`}
                  >
                    Approve
                  </span>
                  {transactionValueModal?.notAnOwner && (
                    <ReactTooltip
                      id={`approve_${transactionValueModal.id}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="top"
                      className="!opacity-100 !rounded-lg"
                    >
                      Please connect a wallet that owns this safe, to enable this action.
                    </ReactTooltip>
                  )}
                </button>
              </>
            )}
          </div>
        )}
        {/* {showRejectionModal && (
          <NotificationPopUp
            disableESCPress
            type="custom"
            image="/svg/RejectTx.svg"
            option
            showModal={showRejectionModal}
            setShowModal={setShowRejectionModal}
            title="Reject Transaction"
            declineText="Cancel"
            acceptText="Reject Transaction"
            description="This would void the transaction, and mark it as ‘rejected’."
            onClose={() => {
              setShowRejectionModal(false)
            }}
            onAccept={handleRejectTransaction}
            loading={confirmLoading || executeLoading}
          />
        )}

        {showExecuteModal && (
          // Modal in modal, maybe put in portal as a quick fix ?
          <NotificationPopUp
            type="custom"
            image="/svg/RejectTx.svg"
            option
            showModal={showExecuteModal}
            setShowModal={setShowExecuteModal}
            title="Execute Rejection Now?"
            description="You will still need to execute the rejection of this transaction in order to remove it from the current transaction queue."
            declineText="Later"
            acceptText="Execute Rejection"
            onClose={() => {
              setShowExecuteModal(false)
            }}
            loading={confirmLoading || executeLoading}
            onAccept={handleExecute}
          />
        )} */}
      </div>
    )
  )
}

export default TransactionDetailModal
