/* eslint-disable react/no-array-index-key */
import { ITransactionRecipient } from '@/slice/old-tx/interface'
import { LabelSuccessful, OnChainRejection, PendingLabel } from '@/components/Label/Label'
import Modal from '@/components/Modal'
import TokenImage from '@/components/TokenImage/TokenImage'
import TransactionItems from '@/components/TransactionItems'
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import reload from '@/public/svg/Reload.svg'
import { CHAINID } from '@/constants/chains'
import { useAppSelector } from '@/state'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { formatNumber } from '@/utils/formatNumber'
import { isExistedRecipient, isExistedSource } from '@/utils/isExistedRecipient'
import { toShort } from '@/utils/toShort'
import { truncateNumber } from '@/utils/truncateNumber'
import PriceTooltip from '@/views/SendPayment/components/PriceTooltip/PriceTooltip'
import { IEditAdditional } from '@/views/TransferApp/interface'
import { useWeb3React } from '@web3-react/core'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { IOutGoingTransactionsInfo } from '../../interface'
import ContactTransactionModal from '../ContactTransaction/ContactTransaction'
import TransactionDetailModal from '@/components/TransactionDetailModal'
import { transactionDetailOutgoingTabs } from '../../data'
import { contactsSelector } from '@/slice/contacts/contacts-slice'

const OutgoingTransactionsInfo: React.FC<IOutGoingTransactionsInfo> = ({
  onSelectTransaction,
  selectedList,
  valuesOutgoingTransactions,
  isSource,
  categories,
  refetch,
  setSelectedList,
  isLastItem,
  isTableOverflowed
}) => {
  const recipientList = useAppSelector(contactsSelector)
  const sourceList = useAppSelector(walletsSelector)
  const { account, chainId: connectedChainId } = useWeb3React()
  const [chainId, setChainId] = useState(1)
  const defaultCategories = useMemo(
    () => ({
      value: valuesOutgoingTransactions?.categories[0]?.id,
      label: valuesOutgoingTransactions?.categories[0]?.name
    }),
    [valuesOutgoingTransactions?.categories]
  )
  // Hooks
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()
  const [showModalContact, setShowModalContact] = useState(false)
  const [additionalValue, setAdditionalValue] = useState<IEditAdditional>({
    editCategory: defaultCategories,
    editNotes: valuesOutgoingTransactions?.comment,
    files: valuesOutgoingTransactions?.files
  })

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
        editNotes: valuesOutgoingTransactions?.comment,
        files: valuesOutgoingTransactions?.files
      })
    }
  }, [defaultCategories])
  // Custom hooks and contextAPI

  // Handle event
  const handleShowTransactionsDetail = () => {
    setShowTransactionsDetail(!showTransactionsDetail)
  }
  const handleShowTransactionsModal = (e) => {
    setShowModal(!showModal)
    e.stopPropagation()
  }
  const source =
    valuesOutgoingTransactions && valuesOutgoingTransactions.source && isSource(valuesOutgoingTransactions?.source?.id)

  // Handle logic

  const transactionOutgoingInfo = useMemo(
    () =>
      valuesOutgoingTransactions
        ? {
            submitTime:
              valuesOutgoingTransactions.timeStamp &&
              format(new Date(valuesOutgoingTransactions.timeStamp), 'dd MMM yyyy, hh:mm a'),
            amount:
              valuesOutgoingTransactions.amount &&
              formatNumber(truncateNumber(+valuesOutgoingTransactions.amount, 3), {
                maximumFractionDigits: valuesOutgoingTransactions.decimal
              }),
            price: valuesOutgoingTransactions.pastUSDPrice
              ? formatNumber(truncateNumber(+valuesOutgoingTransactions.pastUSDPrice, 3), {
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 2
                })
              : '0',
            recipients:
              (valuesOutgoingTransactions.recipients &&
                valuesOutgoingTransactions.recipients.length !== 1 &&
                `${valuesOutgoingTransactions.recipients.length} Recipients`) ||
              '1 Recipient',
            from: valuesOutgoingTransactions.from
          }
        : undefined,
    [valuesOutgoingTransactions]
  )

  const totalAmount = useMemo(() => {
    if (valuesOutgoingTransactions && valuesOutgoingTransactions.recipients) {
      return valuesOutgoingTransactions.recipients.reduce((total, current) => total + (current.pastUSDPrice || 0), 0)
    }

    return 0
  }, [valuesOutgoingTransactions])

  const handleAddContact = (address: string) => (e) => {
    e.stopPropagation()
    setShowModalContact(true)
    setSelectedAddress(address)
  }
  return (
    <div className={`${isLastItem && isTableOverflowed ? '' : 'border-b border-dashboard-border'} w-full bg-blanca-50`}>
      <TransactionItems
        setSelectedList={setSelectedList}
        onSelectTransaction={onSelectTransaction}
        selectedList={selectedList}
        title={
          valuesOutgoingTransactions.isRejectTransaction
            ? 'On-Chain Rejection'
            : valuesOutgoingTransactions.recipients &&
              (valuesOutgoingTransactions.recipients.length === 0
                ? 'Contract Interaction'
                : `${valuesOutgoingTransactions.recipients.length} recipient${
                    valuesOutgoingTransactions.recipients.length !== 1 ? 's' : ''
                  }`)
        }
        label={<LabelSuccessful />}
        safeName={source && (source.name || toShort(source.address, 5, 4))}
        token={valuesOutgoingTransactions.token}
        valueTransaction={valuesOutgoingTransactions}
        symbol={valuesOutgoingTransactions.symbol}
        totalPastPrice={totalAmount}
        isExpanded={showTransactionsDetail}
        amount={transactionOutgoingInfo.amount}
        onClick={handleShowTransactionsDetail}
        action={
          // valuesOutgoingTransactions.symbol && (
          <div className="flex items-center">
            <button
              type="button"
              className="bg-grey-200 border border-grey-300 text-grey-800 w-[173px] font-medium text-sm leading-6 h-10 rounded-lg flex items-center justify-center"
              onClick={handleShowTransactionsModal}
            >
              View Details
            </button>
            <div
              className={`bg-grey-200 border border-grey-300  cursor-pointer flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                !showTransactionsDetail ? 'rotate-180' : ''
              }`}
            >
              <img src="/svg/DropdownFull.svg" alt="dropdown" />
            </div>
          </div>
          // )
        }
        // categorySelected={valuesOutgoingTransactions.categories && valuesOutgoingTransactions.categories[0]}
        // categories={categories}
        time={
          (valuesOutgoingTransactions.timeStamp &&
            (Number(valuesOutgoingTransactions.timeStamp) > 0
              ? format(Number(valuesOutgoingTransactions.timeStamp) * 1000, 'dd MMM yyyy, hh:mm a')
              : format(new Date(valuesOutgoingTransactions.timeStamp), 'dd MMM yyyy, hh:mm a'))) ||
          ''
        }
        isContractInteraction={!valuesOutgoingTransactions.recipients}
      />
      {showTransactionsDetail && valuesOutgoingTransactions && (
        <div className="p-4">
          <div className="border border-grey-200 rounded-lg bg-white">
            {valuesOutgoingTransactions.recipients?.map((item: ITransactionRecipient, index: number) => (
              <div key={index} className="flex flex-1 items-center w-full p-6 border-b border-dashboard-border">
                <div className="w-2/5">
                  {isExistedRecipient(item.address, recipientList, chainId) ||
                  isExistedSource(item.address, sourceList) ? (
                    <WalletAddressV2
                      maxWidth="max-w-[290px]"
                      address={item.address}
                      noColor
                      noCopy
                      noScan
                      showFirst={5}
                      showLast={4}
                      chainId={chainId}
                      className="text-left pr-3 text-base leading-6 text-dashboard-main"
                    />
                  ) : (
                    <button type="button" onClick={handleAddContact(item.address)}>
                      <WalletAddressV2
                        maxWidth="max-w-[290px]"
                        address={item.address}
                        noColor
                        noCopy
                        noScan
                        showFirst={5}
                        showLast={4}
                        chainId={chainId}
                        className="text-left pr-3 text-base leading-6 text-dashboard-main hover:underline hover:text-neutral-900"
                      />
                    </button>
                  )}
                </div>
                <div className="flex flex-1 justify-between">
                  <WalletAddressV2
                    maxWidth="max-w-[290px]"
                    address={item.address}
                    noColor
                    noAvatar
                    showFirst={5}
                    showLast={4}
                    chainId={chainId}
                    className="pr-3 text-base leading-6 w-1/2 text-dashboard-main"
                    useAddress
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <TokenImage
                        className="h-4 w-4"
                        type="tokenURL"
                        symbol={valuesOutgoingTransactions.symbol}
                        imageSrc={valuesOutgoingTransactions.token && valuesOutgoingTransactions.token.logoUrl}
                      />
                      <div className="text-base text-grey-800 font-medium font-inter">
                        {item &&
                          item.amount &&
                          formatNumber(item.amount, {
                            maximumFractionDigits: valuesOutgoingTransactions.decimal
                          })}{' '}
                        {valuesOutgoingTransactions.symbol}
                      </div>
                    </div>
                    <div
                      className="text-sm text-grey-700 font-normal font-inter mt-1"
                      data-tip
                      data-for={`total_${
                        (valuesOutgoingTransactions.metamaskTransaction &&
                          valuesOutgoingTransactions.metamaskTransaction.nonce) ||
                        (valuesOutgoingTransactions.safeTransaction &&
                          valuesOutgoingTransactions.safeTransaction.nonce &&
                          valuesOutgoingTransactions.safeTransaction.nonce.toString())
                      }_${valuesOutgoingTransactions.hash}_${item.address}_${index}_${item.pastUSDPrice}`}
                    >
                      {(item &&
                        item.pastUSDPrice &&
                        `~ $${formatNumber(item.pastUSDPrice, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6
                        })} USD`) ||
                        (valuesOutgoingTransactions.symbol && 'Unsupported') ||
                        ''}
                    </div>
                  </div>
                </div>
                <ReactTooltip
                  id={`total_${
                    (valuesOutgoingTransactions.metamaskTransaction &&
                      valuesOutgoingTransactions.metamaskTransaction.nonce) ||
                    (valuesOutgoingTransactions.safeTransaction &&
                      valuesOutgoingTransactions.safeTransaction.nonce &&
                      valuesOutgoingTransactions.safeTransaction.nonce.toString())
                  }_${valuesOutgoingTransactions.hash}_${item.address}_${index}_${item.pastUSDPrice}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg"
                >
                  {valuesOutgoingTransactions.token ? (
                    <PriceTooltip price={item.currentUSDPrice || 0} />
                  ) : (
                    'Unable to fetch price.'
                  )}
                </ReactTooltip>
              </div>
            ))}
            {!valuesOutgoingTransactions.recipients && valuesOutgoingTransactions.to && (
              <div className="flex items-center w-full p-6 border-b border-dashboard-border">
                <div className="w-2/5">
                  {isExistedRecipient(valuesOutgoingTransactions.to, recipientList, chainId) ||
                  isExistedSource(valuesOutgoingTransactions.to, sourceList) ? (
                    <WalletAddressV2
                      address={valuesOutgoingTransactions.to}
                      noColor
                      noCopy
                      noScan
                      showFirst={5}
                      showLast={4}
                      chainId={chainId}
                      className="pr-3 text-base leading-6 text-dashboard-main"
                      maxWidth="max-w-[290px]"
                    />
                  ) : (
                    <button type="button" onClick={handleAddContact(valuesOutgoingTransactions.to)}>
                      <WalletAddressV2
                        address={valuesOutgoingTransactions.to}
                        noColor
                        noCopy
                        noScan
                        showFirst={5}
                        chainId={chainId}
                        showLast={4}
                        className="pr-3 text-base leading-6 text-dashboard-main hover:underline hover:text-neutral-900"
                        maxWidth="max-w-[290px]"
                      />
                    </button>
                  )}
                </div>
                <div className="flex flex-1 justify-between">
                  <WalletAddressV2
                    maxWidth="max-w-[290px]"
                    address={valuesOutgoingTransactions.to}
                    noColor
                    noAvatar
                    showFirst={5}
                    showLast={4}
                    chainId={chainId}
                    className="pr-3 text-base leading-6 text-dashboard-main"
                    useAddress
                  />
                  <div>
                    <div className="flex items-start justify-end gap-2">
                      <TokenImage
                        className="h-4 w-4"
                        type="tokenURL"
                        symbol={valuesOutgoingTransactions.symbol}
                        imageSrc={valuesOutgoingTransactions.token && valuesOutgoingTransactions.token.logoUrl}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pl-6 pr-4 py-4 text-sm text-dashboard-sub leading-5">
              <div className="flex items-center gap-8 whitespace-nowrap">
                <div>
                  Time of Transfer:{' '}
                  {(valuesOutgoingTransactions.timeStamp &&
                    (Number(valuesOutgoingTransactions.timeStamp) > 0
                      ? format(Number(valuesOutgoingTransactions.timeStamp) * 1000, 'dd MMM yyyy, hh:mm a')
                      : format(new Date(valuesOutgoingTransactions.timeStamp), 'dd MMM yyyy, hh:mm a'))) ||
                    ''}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  Tx Hash:{' '}
                  <WalletAddressV2
                    noAvatar
                    address={valuesOutgoingTransactions.hash}
                    noColor
                    chainId={chainId}
                    showFirst={5}
                    showLast={4}
                    scanType="txHash"
                    notFullWidth
                  />
                </div>
              </div>
              {/* <button
              type="button"
              className="border text-dashboard-main border-[#EAECF0] bg-[#F1F1EF] items-center gap-[10px] rounded-lg py-2 w-[173px] flex justify-center"
            >
              Repeat Transfer
              <Image src={reload} alt="reload" />
            </button> */}
            </div>
          </div>
        </div>
      )}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <TransactionDetailModal
          showModal={showModal}
          title="Outgoing Transaction Details"
          refetch={refetch}
          isSource={isSource}
          transactionId={valuesOutgoingTransactions && valuesOutgoingTransactions.id}
          setShowModal={setShowModal}
          transactionDetailTabs={transactionDetailOutgoingTabs}
          categories={categories}
          additionalValue={additionalValue}
          setAdditionalValue={setAdditionalValue}
        />
      </Modal>
      <ContactTransactionModal
        showModal={showModalContact}
        setShowModal={setShowModalContact}
        contactAddress={selectedAddress}
      />
    </div>
  )
}

export default OutgoingTransactionsInfo
