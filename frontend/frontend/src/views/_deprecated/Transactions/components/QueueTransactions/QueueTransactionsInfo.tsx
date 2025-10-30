/* eslint-disable react/no-array-index-key */
import { ITransactionRecipient } from '@/slice/old-tx/interface'
import { RecipientConfirmLabel, TransactionLabel } from '@/components/Label/Label'
import Modal from '@/components/Modal'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import NotificationSending from '@/components/NotificationSending/NotificationSending'
import TokenImage from '@/components/TokenImage/TokenImage'
import TransactionItems from '@/components/TransactionItems'
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import { useAppSelector } from '@/state'
import { CHAINID } from '@/constants/chains'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { formatNumber } from '@/utils/formatNumber'
import { isExistedRecipient, isExistedSource } from '@/utils/isExistedRecipient'
import { toShort } from '@/utils/toShort'
import { truncateNumber } from '@/utils/truncateNumber'
import { IEditAdditional } from '@/views/TransferApp/interface'
import { useWeb3React } from '@web3-react/core'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { IQueueTransactionsInfo } from '../../interface'
import ContactTransactionModal from '../ContactTransaction/ContactTransaction'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import TransactionDetailModal from '@/components/TransactionDetailModal'
import { transactionDetailOutgoingTabs } from '../../data'
import { contactsSelector } from '@/slice/contacts/contacts-slice'

const QueueTransactionsInfo: React.FC<IQueueTransactionsInfo> = ({
  index,
  categories,
  selectedList,
  nonExecuteLoading,
  confirmLoading,
  executeLoading,
  valuesQueueTransactions,
  onSelectTransaction,
  isSource,
  isTransactionSignedByAddress,
  isTransactionExecutable,
  onSign,
  onReject,
  onExecuted,
  refetch,
  setSelectedList
}) => {
  const recipientList = useAppSelector(contactsSelector)
  const sourceList = useAppSelector(walletsSelector)
  // const { chainId } = useWeb3React()
  const [chainId, setChainId] = useState(1)
  const defaultCategories = useMemo(
    () => ({
      value: valuesQueueTransactions?.categories[0]?.id,
      label: valuesQueueTransactions?.categories[0]?.name
    }),
    [valuesQueueTransactions?.categories]
  )

  // Hooks
  const { account, chainId: connectedChainId } = useWeb3React()
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()
  const [showModalContact, setShowModalContact] = useState(false)
  const [additionalValue, setAdditionalValue] = useState<IEditAdditional>({
    editCategory: defaultCategories,
    editNotes: valuesQueueTransactions?.comment,
    files: valuesQueueTransactions?.files
  })
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showExecuteModal, setShowExecuteModal] = useState(false)
  // Handle event
  const handleShowTransactionsDetail = () => {
    setShowTransactionsDetail(!showTransactionsDetail)
  }

  useEffect(() => {
    if (account && connectedChainId) {
      setChainId(connectedChainId)
    } else {
      const currentChainId = window.localStorage.getItem(CHAINID)
      if (currentChainId) {
        setChainId(parseInt(currentChainId))
      } else {
        setChainId(1)
      }
    }
  }, [connectedChainId])

  useEffect(() => {
    if (defaultCategories) {
      setAdditionalValue({
        editCategory: defaultCategories,
        editNotes: valuesQueueTransactions?.comment,
        files: valuesQueueTransactions?.files
      })
    }
  }, [defaultCategories])

  const source =
    valuesQueueTransactions &&
    valuesQueueTransactions.source &&
    valuesQueueTransactions.source.id &&
    isSource(valuesQueueTransactions.source.id)

  const handleShowTransactionsModal = () => {
    setShowModal(!showModal)
  }

  const handleExecuted = async (e) => {
    e.stopPropagation()
    if (valuesQueueTransactions.isRejectTransaction) {
      setShowExecuteModal(true)
    } else {
      await onExecuted({
        e,
        sourceId: source.id,
        transaction: valuesQueueTransactions
      })
    }
  }

  const transactionOutgoingInfo = useMemo(
    () =>
      valuesQueueTransactions
        ? {
            submitTime: format(Number(valuesQueueTransactions.timeStamp) * 1000, 'dd MMM yyyy, hh:mm a'),
            amount:
              valuesQueueTransactions.amount &&
              formatNumber(truncateNumber(+valuesQueueTransactions.amount, 3), {
                maximumFractionDigits: valuesQueueTransactions.decimal
              }),
            price: valuesQueueTransactions.currentUSDPrice
              ? formatNumber(truncateNumber(+valuesQueueTransactions.currentUSDPrice, 3), {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 2
                })
              : '0',
            recipients:
              (valuesQueueTransactions.recipients &&
                valuesQueueTransactions.recipients.length !== 1 &&
                `${valuesQueueTransactions.recipients.length} Recipients`) ||
              '1 Recipient',
            from: valuesQueueTransactions.safeTransaction && valuesQueueTransactions.safeTransaction.to
          }
        : undefined,
    [valuesQueueTransactions]
  )

  const handleRejectTransaction = async (e) => {
    e.stopPropagation()
    await onReject(valuesQueueTransactions, source.id, e)
    setShowRejectionModal(false)
  }

  const handleExecuteRejection = async (e) => {
    e.stopPropagation()

    try {
      await onExecuted({
        e,
        sourceId: source.id,
        transaction: valuesQueueTransactions
      })
      setShowExecuteModal(false)
    } catch (error) {
      sentryCaptureException(error)
      setShowExecuteModal(false)
    }
  }

  const handleAddContact = (address: string) => (e) => {
    e.stopPropagation()
    setShowModalContact(true)
    setSelectedAddress(address)
  }

  return (
    valuesQueueTransactions &&
    valuesQueueTransactions.safeTransaction && (
      <div className="border-t border-dashboard-border w-full min-w-fit bg-blanca-50 rounded-b-lg">
        <TransactionItems
          setSelectedList={setSelectedList}
          onSelectTransaction={onSelectTransaction}
          selectedList={selectedList}
          label={
            <TransactionLabel
              threshold={valuesQueueTransactions.safeTransaction.confirmationsRequired}
              confirmations={valuesQueueTransactions.safeTransaction.confirmations}
              address={account}
              isRejectTransaction={valuesQueueTransactions.isRejectTransaction}
            />
          }
          currentNonce={valuesQueueTransactions.currentNonce}
          title={
            valuesQueueTransactions.isRejectTransaction
              ? 'On-chain Rejection'
              : valuesQueueTransactions &&
                valuesQueueTransactions.recipients &&
                valuesQueueTransactions.recipients.length !== 1
              ? `${valuesQueueTransactions.recipients.length} Recipients`
              : '1 Recipient'
          }
          safeName={source && (source.name || toShort(source.address, 5, 4))}
          token={valuesQueueTransactions.token}
          valueTransaction={valuesQueueTransactions}
          symbol={valuesQueueTransactions.symbol}
          isExpanded={showTransactionsDetail}
          amount={transactionOutgoingInfo && transactionOutgoingInfo.amount}
          onClick={handleShowTransactionsDetail}
          nonce={
            (valuesQueueTransactions.safeTransaction.nonce || valuesQueueTransactions.safeTransaction.nonce === 0) &&
            valuesQueueTransactions.safeTransaction.nonce.toString()
          }
          action={
            isTransactionExecutable(valuesQueueTransactions.safeTransaction.confirmationsRequired, {
              ...valuesQueueTransactions.safeTransaction,
              fee: Number(valuesQueueTransactions.safeTransaction.fee)
            }) ? (
              valuesQueueTransactions.currentNonce &&
              valuesQueueTransactions.safeTransaction.nonce &&
              valuesQueueTransactions.safeTransaction.nonce !== valuesQueueTransactions.currentNonce ? (
                <div className="flex items-center font-medium">
                  <div
                    data-tip={valuesQueueTransactions.id}
                    data-for={valuesQueueTransactions.id}
                    className=" w-full border text-sm !font-semibold border-transparent text-white rounded-lg py-2 bg-grey-900 whitespace-nowrap flex justify-center hover:bg-grey-901 leading-6 h-10  items-center  opacity-60"
                  >
                    Execute {(valuesQueueTransactions.isRejectTransaction && 'Rejection') || 'Approval'}
                  </div>
                  <div
                    className={`bg-grey-200 border border-[#EAECF0] cursor-pointer flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                      !showTransactionsDetail ? 'rotate-180' : ''
                    }`}
                  >
                    <img src="/svg/DropdownFull.svg" alt="dropdown" />
                  </div>
                  <ReactTooltip
                    id={valuesQueueTransactions.id}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="left"
                    className="!opacity-100 !rounded-lg !text-xs"
                  >
                    To execute this, you need to settle the transaction before it.
                  </ReactTooltip>
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={confirmLoading}
                    className="w-full border text-sm font-semibold border-transparent text-white rounded-md py-2 bg-grey-900 whitespace-nowrap flex justify-center hover:bg-grey-901 disabled:opacity-60"
                    onClick={(e) => handleExecuted(e)}
                  >
                    Execute {(valuesQueueTransactions.isRejectTransaction && 'Rejection') || 'Approval'}
                  </button>
                  <div
                    className={`border border-[#EAECF0] cursor-pointer bg-grey-200 flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                      !showTransactionsDetail ? 'rotate-180' : ''
                    }`}
                  >
                    <img src="/svg/DropdownFull.svg" alt="dropdown" />
                  </div>
                </div>
              )
            ) : isTransactionSignedByAddress(account, {
                ...valuesQueueTransactions.safeTransaction,
                fee: Number(valuesQueueTransactions.safeTransaction.fee)
              }) ? (
              <div className="flex items-center">
                {!valuesQueueTransactions.isRejectTransaction && (
                  <>
                    <button
                      data-tip={`reject_3_${valuesQueueTransactions.id}`}
                      data-for={`reject_3_${valuesQueueTransactions.id}`}
                      type="button"
                      disabled={nonExecuteLoading}
                      className="flex-1 text-grey-900 border text-sm font-semibold rounded-md py-2 border-grey-900 hover:border-grey-901 hover:text-grey-901 disabled:opacity-50 mr-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowRejectionModal(true)
                      }}
                    >
                      Reject
                    </button>
                    <ReactTooltip
                      id={`reject_3_${valuesQueueTransactions.id}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="left"
                      className="!opacity-100 !rounded-lg"
                    >
                      Transaction will be rejected regardless of other signers.
                    </ReactTooltip>
                  </>
                )}
                <div
                  data-tip={valuesQueueTransactions.id}
                  data-for={valuesQueueTransactions.id}
                  className="flex-1 bg-grey-900 text-center text-white border text-sm font-semibold rounded-md py-2 border-transparent opacity-50"
                >
                  Execute
                </div>
                <div
                  className={`border border-[#EAECF0] cursor-pointer bg-grey-200 flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                    !showTransactionsDetail ? 'rotate-180' : ''
                  }`}
                >
                  <img src="/svg/DropdownFull.svg" alt="dropdown" />
                </div>
                <ReactTooltip
                  id={valuesQueueTransactions.id}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="left"
                  className="!opacity-100 !rounded-lg"
                >
                  Awaiting Confirmation
                </ReactTooltip>
              </div>
            ) : (
              <div>
                {valuesQueueTransactions.isRejectTransaction &&
                valuesQueueTransactions.safeTransaction &&
                valuesQueueTransactions.safeTransaction.confirmationsRequired >
                  valuesQueueTransactions.safeTransaction.confirmations.length ? (
                  <div className="flex items-center">
                    <button
                      data-tip={`confirm_reject_${valuesQueueTransactions.id}`}
                      data-for={`confirm_reject_${valuesQueueTransactions.id}`}
                      type="button"
                      disabled={nonExecuteLoading}
                      // className="w-full bg-grey-900 text-white border text-sm font-semibold rounded-lg py-2 border-transparent hover:bg-grey-901 disabled:opacity-50"
                      className="w-full border text-sm font-semibold border-transparent text-white rounded-md py-2 bg-grey-900 whitespace-nowrap flex justify-center hover:bg-grey-901 disabled:opacity-60"
                      onClick={async (e) => {
                        await onSign(valuesQueueTransactions, source.id, e)
                      }}
                    >
                      Confirm Rejection
                    </button>
                    <div
                      className={`border border-[#EAECF0] cursor-pointer bg-grey-200 flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                        !showTransactionsDetail ? 'rotate-180' : ''
                      }`}
                    >
                      <img src="/svg/DropdownFull.svg" alt="dropdown" />
                    </div>
                    <ReactTooltip
                      id={`confirm_reject_${valuesQueueTransactions.id}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="left"
                      className="!opacity-100 !rounded-lg whitespace-pre-line !font-medium !text-xs"
                    >
                      {`${'This transaction has already been rejected. \n Please confirm the rejection to continue.'}`}
                    </ReactTooltip>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      data-tip={`reject_${valuesQueueTransactions.id}`}
                      data-for={`reject_${valuesQueueTransactions.id}`}
                      type="button"
                      disabled={nonExecuteLoading}
                      className="flex-1 text-grey-900 border text-sm font-semibold rounded-md py-2 border-grey-900 hover:border-grey-901 hover:text-grey-901 disabled:opacity-50 mr-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowRejectionModal(true)
                      }}
                    >
                      Reject
                    </button>
                    <ReactTooltip
                      id={`reject_${valuesQueueTransactions.id}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="left"
                      className="!opacity-100 !rounded-lg"
                    >
                      Transaction will be rejected regardless of other signers.
                    </ReactTooltip>
                    <button
                      type="button"
                      disabled={nonExecuteLoading}
                      className="flex-1 bg-grey-900 text-white border text-sm font-semibold rounded-md py-2 border-transparent hover:bg-grey-901 disabled:opacity-50"
                      onClick={async (e) => {
                        await onSign(valuesQueueTransactions, source.id, e)
                      }}
                    >
                      Approve
                    </button>
                    <div
                      className={`border border-[#EAECF0] cursor-pointer bg-grey-200 flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                        !showTransactionsDetail ? 'rotate-180' : ''
                      }`}
                    >
                      <img src="/svg/DropdownFull.svg" alt="dropdown" />
                    </div>
                  </div>
                )}
              </div>
            )
          }
          // categorySelected={valuesQueueTransactions.categories && valuesQueueTransactions.categories[0]}
          // categories={categories}
          time={
            (valuesQueueTransactions.safeTransaction &&
              (Number(valuesQueueTransactions.safeTransaction.submissionDate) > 0
                ? format(Number(valuesQueueTransactions.safeTransaction.submissionDate) * 1000, 'dd MMM yyyy, hh:mm a')
                : format(new Date(valuesQueueTransactions.safeTransaction.submissionDate), 'dd MMM yyyy, hh:mm a'))) ||
            ''
          }
          isContractInteraction={!valuesQueueTransactions.recipients}
        />

        {showTransactionsDetail && (
          <div className="p-4">
            <div className="border border-grey-200 rounded-lg bg-white">
              {/* {(valuesQueueTransactions.currentNonce || valuesQueueTransactions.currentNonce === 0) &&
              valuesQueueTransactions.safeTransaction &&
              valuesQueueTransactions.safeTransaction.nonce === valuesQueueTransactions.currentNonce && (
                <div className="text-center text-warning-600 text-sm bg-warning-50 py-[10px] m-2 rounded">
                  You will still need to execute this transaction to prevent it from holding up your transaction queue.
                </div>
              )} */}
              {valuesQueueTransactions &&
                valuesQueueTransactions.recipients &&
                valuesQueueTransactions.recipients.map((item: ITransactionRecipient, indexRecipient: number) => (
                  <div
                    key={`recipient-${indexRecipient}`}
                    className="flex items-center p-6 border-b border-dashboard-border"
                  >
                    <div className="w-2/5">
                      {isExistedRecipient(item.address, recipientList, chainId) ||
                      isExistedSource(item.address, sourceList) ? (
                        <WalletAddressV2
                          maxWidth="max-w-[290px]"
                          address={item.address}
                          noColor
                          noCopy
                          noScan
                          chainId={chainId}
                          showFirst={5}
                          showLast={4}
                          className="pr-3 text-base leading-6 text-dashboard-main"
                        />
                      ) : (
                        <button type="button" onClick={handleAddContact(item.address)}>
                          <WalletAddressV2
                            maxWidth="max-w-[290px]"
                            address={item.address}
                            noColor
                            noCopy
                            noScan
                            chainId={chainId}
                            showFirst={5}
                            showLast={4}
                            className="pr-3 text-base leading-6 text-dashboard-main hover:underline hover:text-neutral-900"
                          />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-1 justify-between">
                      <WalletAddressV2
                        maxWidth="max-w-[290px]"
                        address={item.address}
                        noColor
                        chainId={chainId}
                        noAvatar
                        showFirst={5}
                        showLast={4}
                        className="pr-3 text-base leading-6 text-dashboard-main"
                        useAddress
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <TokenImage
                            type="tokenURL"
                            className="w-4 h-4"
                            symbol={valuesQueueTransactions.symbol}
                            imageSrc={
                              valuesQueueTransactions &&
                              valuesQueueTransactions.token &&
                              valuesQueueTransactions.token.logoUrl
                            }
                          />
                          <div className="text-base text-grey-800 font-medium font-inter">
                            {item &&
                              item.amount &&
                              formatNumber(item.amount, {
                                maximumFractionDigits: valuesQueueTransactions.decimal
                              })}{' '}
                            {valuesQueueTransactions.symbol}
                          </div>
                        </div>
                        <div className="text-sm text-grey-700 font-normal font-inter mt-1">
                          {(item &&
                            item.currentUSDPrice &&
                            `~ $${formatNumber(item.currentUSDPrice, {
                              maximumFractionDigits: 6,
                              minimumFractionDigits: 2
                            })} USD`) ||
                            'Unsupported'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              <div className="flex items-center justify-between pl-6 pr-4 py-4 text-sm text-dashboard-sub leading-5">
                <div className="flex items-center gap-8">
                  <div>
                    Time of Transfer:{' '}
                    {(valuesQueueTransactions.safeTransaction &&
                      (Number(valuesQueueTransactions.safeTransaction.submissionDate) > 0
                        ? format(
                            Number(valuesQueueTransactions.safeTransaction.submissionDate) * 1000,
                            'dd MMM yyyy, hh:mm a'
                          )
                        : format(
                            new Date(valuesQueueTransactions.safeTransaction.submissionDate),
                            'dd MMM yyyy, hh:mm a'
                          ))) ||
                      ''}
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    Safe Tx Hash:{' '}
                    <WalletAddressV2
                      noAvatar
                      address={valuesQueueTransactions.safeHash}
                      noColor
                      noCopy
                      chainId={chainId}
                      noScan
                      showFirst={5}
                      showLast={4}
                      scanType="txHash"
                      notFullWidth
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="bg-[#F1F1EF] border text-grey-800 border-[#EAECF0]  items-center gap-[10px] rounded-md py-2 w-[173px] flex justify-center"
                  onClick={handleShowTransactionsModal}
                >
                  View All Details
                </button>
              </div>
            </div>
          </div>
        )}

        <Modal showModal={showModal} setShowModal={setShowModal}>
          <TransactionDetailModal
            executeLoading={executeLoading}
            title="Pending Transaction Details"
            showModal={showModal}
            additionalValue={additionalValue}
            setAdditionalValue={setAdditionalValue}
            categories={categories}
            refetch={refetch}
            isSource={isSource}
            queue
            confirmLoading={confirmLoading}
            isTransactionExecutable={isTransactionExecutable}
            isTransactionSignedByAddress={isTransactionSignedByAddress}
            onExecuted={onExecuted}
            onReject={onReject}
            onSign={onSign}
            transactionId={valuesQueueTransactions.id}
            setShowModal={setShowModal}
            transactionDetailTabs={transactionDetailOutgoingTabs}
            index={index}
          />
        </Modal>
        <ContactTransactionModal
          showModal={showModalContact}
          setShowModal={setShowModalContact}
          contactAddress={selectedAddress}
        />
        {showRejectionModal && (
          <NotificationPopUp
            type="custom"
            image="/svg/RejectTx.svg"
            option
            showModal={showRejectionModal}
            setShowModal={setShowRejectionModal}
            title="Reject Transaction"
            declineText="Cancel"
            acceptText="Reject Transaction"
            disableESCPress
            description="This would void the transaction, and mark it as ‘rejected’."
            onClose={() => {
              setShowRejectionModal(false)
            }}
            onAccept={handleRejectTransaction}
            loading={confirmLoading}
          />
        )}

        {showExecuteModal && (
          <NotificationPopUp
            type="custom"
            image="/svg/RejectTx.svg"
            option
            disableESCPress
            showModal={showExecuteModal}
            setShowModal={setShowExecuteModal}
            title="Execute Rejection Now?"
            description="You will still need to execute the rejection of this transaction in order to remove it from the current transaction queue."
            declineText="Later"
            acceptText="Execute Rejection"
            onClose={() => {
              setShowExecuteModal(false)
            }}
            onAccept={handleExecuteRejection}
            loading={confirmLoading}
          />
        )}
      </div>
    )
  )
}

export default QueueTransactionsInfo
