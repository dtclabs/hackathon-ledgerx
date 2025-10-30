import Modal from '@/components/Modal'
import TokenImage from '@/components/TokenImage/TokenImage'
import TransactionItems from '@/components/TransactionItems'
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import { formatNumber } from '@/utils/formatNumber'
import { format } from 'date-fns'
import { CHAINID } from '@/constants/chains'
import { useEffect, useMemo, useState } from 'react'
import { IIncomingTransactionsInfo } from '../../interface'
import { IEditAdditional } from '@/views/TransferApp/interface'
import ReactTooltip from 'react-tooltip'
import PriceTooltip from '@/views/SendPayment/components/PriceTooltip/PriceTooltip'
import { truncateNumber } from '@/utils/truncateNumber'
import { LabelSuccessful, ReceivedLabel } from '@/components/Label/Label'
import { isExistedRecipient, isExistedSource } from '@/utils/isExistedRecipient'
import { useAppSelector } from '@/state'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useWeb3React } from '@web3-react/core'
import ContactTransactionModal from '../ContactTransaction/ContactTransaction'
import TransactionDetailModal from '@/components/TransactionDetailModal'
import { transactionDetailIncomingTabs } from '../../data'
import { contactsSelector } from '@/slice/contacts/contacts-slice'

const IncomingTransactionsInfo: React.FC<IIncomingTransactionsInfo> = ({
  isSource,
  onSelectTransaction,
  selectedList,
  valuesIncomingTransactions,
  categories,
  refetch,
  notBorder,
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
      value: valuesIncomingTransactions?.categories[0]?.id,
      label: valuesIncomingTransactions?.categories[0]?.name
    }),
    [valuesIncomingTransactions?.categories]
  )
  // Hooks
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()
  const [showModalContact, setShowModalContact] = useState(false)
  const [additionalValue, setAdditionalValue] = useState<IEditAdditional>({
    editCategory: defaultCategories,
    editNotes: valuesIncomingTransactions?.comment,
    files: valuesIncomingTransactions?.files
  })
  useEffect(() => {
    if (defaultCategories) {
      setAdditionalValue({
        editCategory: defaultCategories,
        editNotes: valuesIncomingTransactions?.comment,
        files: valuesIncomingTransactions?.files
      })
    }
  }, [defaultCategories, valuesIncomingTransactions?.comment, valuesIncomingTransactions?.files])

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
  // Custom hooks and contextAPI

  // Handle event
  const handleShowTransactionsDetail = () => {
    setShowTransactionsDetail(!showTransactionsDetail)
  }
  const handleShowTransactionsModal = (e) => {
    e.stopPropagation()
    setShowModal(!showModal)
  }
  // Handle logic
  const source =
    valuesIncomingTransactions &&
    valuesIncomingTransactions.source &&
    valuesIncomingTransactions.source.id &&
    isSource(valuesIncomingTransactions.source.id)

  const transactionOutgoingInfo = useMemo(
    () =>
      valuesIncomingTransactions
        ? {
            submitTime: format(new Date(valuesIncomingTransactions.timeStamp), 'dd MMM yyyy, hh:mm a'),
            amount:
              valuesIncomingTransactions.amount &&
              valuesIncomingTransactions &&
              formatNumber(truncateNumber(+valuesIncomingTransactions.amount, 3), {
                maximumFractionDigits: valuesIncomingTransactions && valuesIncomingTransactions.decimal
              }),
            price: valuesIncomingTransactions.pastUSDPrice
              ? formatNumber(truncateNumber(+valuesIncomingTransactions.pastUSDPrice, 3), {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })
              : 0,
            recipients:
              (valuesIncomingTransactions.recipients &&
                valuesIncomingTransactions.recipients.length !== 1 &&
                `${valuesIncomingTransactions.recipients.length} Recipients`) ||
              '1 Recipient',
            from: valuesIncomingTransactions.from
          }
        : undefined,
    [valuesIncomingTransactions]
  )

  const handleAddContact = (address: string) => (e) => {
    e.stopPropagation()
    setShowModalContact(true)
    setSelectedAddress(address)
  }

  return (
    <div className={`${isLastItem && isTableOverflowed ? '' : 'border-b border-dashboard-border'} w-full bg-blanca-50`}>
      <TransactionItems
        setSelectedList={setSelectedList}
        selectedList={selectedList}
        onSelectTransaction={onSelectTransaction}
        title={source && `Deposit into ${source.name}`}
        incomingAddress={valuesIncomingTransactions.from}
        sourceName={source && source.name}
        token={valuesIncomingTransactions.token}
        valueTransaction={valuesIncomingTransactions}
        symbol={valuesIncomingTransactions.symbol}
        totalPastPrice={valuesIncomingTransactions.pastUSDPrice}
        isExpanded={showTransactionsDetail}
        amount={transactionOutgoingInfo.amount}
        onClick={handleShowTransactionsDetail}
        action={
          <div className="flex items-center">
            <button
              type="button"
              className="bg-grey-200 border border-grey-300 text-grey-800 w-[173px] font-medium text-sm leading-6 h-10 rounded-lg flex items-center justify-center"
              onClick={(e) => handleShowTransactionsModal(e)}
            >
              View Details
            </button>
            <div
              className={`bg-grey-200 border border-grey-300 cursor-pointer flex justify-center items-center w-fit h-fit py-[9px] px-2 rounded-sm flex-shrink-0 ml-4 ${
                !showTransactionsDetail ? 'rotate-180' : ''
              }`}
            >
              <img src="/svg/DropdownFull.svg" alt="dropdown" />
            </div>
          </div>
        }
        // categorySelected={valuesIncomingTransactions.categories && valuesIncomingTransactions.categories[0]}
        // categories={categories}
        label={<ReceivedLabel />}
        isContractInteraction={!valuesIncomingTransactions.recipients}
        time={
          (valuesIncomingTransactions.timeStamp &&
            (Number(valuesIncomingTransactions.timeStamp) > 0
              ? format(Number(valuesIncomingTransactions.timeStamp) * 1000, 'dd MMM yyyy, hh:mm a')
              : format(new Date(valuesIncomingTransactions.timeStamp), 'dd MMM yyyy, hh:mm a'))) ||
          ''
        }
      />
      {showTransactionsDetail && valuesIncomingTransactions && (
        <div className="p-4">
          <div className="border border-grey-200 rounded-lg bg-white">
            <div className="flex items-center justify-between p-6 border-b border-dashboard-border">
              {isExistedRecipient(valuesIncomingTransactions.from, recipientList, chainId) ||
              isExistedSource(valuesIncomingTransactions.from, sourceList) ? (
                <WalletAddressV2
                  maxWidth="max-w-[290px]"
                  address={valuesIncomingTransactions.from}
                  noColor
                  showFirst={5}
                  showLast={4}
                  className="pr-3 text-base leading-6 text-dashboard-main"
                  chainId={chainId}
                />
              ) : (
                <button type="button" onClick={handleAddContact(valuesIncomingTransactions.from)}>
                  <WalletAddressV2
                    maxWidth="max-w-[290px]"
                    address={valuesIncomingTransactions.from}
                    noColor
                    showFirst={5}
                    showLast={4}
                    chainId={chainId}
                    className="pr-3 text-base leading-6 text-dashboard-main hover:underline hover:text-neutral-900"
                  />
                </button>
              )}
              <div>
                <div className="flex items-center justify-end gap-2">
                  <TokenImage
                    className="h-4 w-4"
                    type="tokenURL"
                    symbol={valuesIncomingTransactions.symbol}
                    imageSrc={valuesIncomingTransactions.token && valuesIncomingTransactions.token.logoUrl}
                  />
                  <div className="text-base text-grey-800 font-medium font-inter">
                    {valuesIncomingTransactions &&
                      valuesIncomingTransactions.amount &&
                      formatNumber(valuesIncomingTransactions.amount, {
                        maximumFractionDigits: valuesIncomingTransactions.decimal
                      })}{' '}
                    {valuesIncomingTransactions.symbol}
                  </div>
                </div>
                <div
                  className="text-sm text-right text-grey-700 font-normal font-inter mt-1"
                  data-tip
                  data-for={`total_${
                    (valuesIncomingTransactions.metamaskTransaction &&
                      valuesIncomingTransactions.metamaskTransaction.nonce) ||
                    (valuesIncomingTransactions.safeTransaction &&
                      valuesIncomingTransactions.safeTransaction.nonce &&
                      valuesIncomingTransactions.safeTransaction.nonce.toString())
                  }_${valuesIncomingTransactions.hash}_${valuesIncomingTransactions?.id}_${
                    valuesIncomingTransactions?.timeStamp
                  }`}
                >
                  {(valuesIncomingTransactions &&
                    valuesIncomingTransactions.pastUSDPrice &&
                    `~ $${formatNumber(valuesIncomingTransactions.pastUSDPrice, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    })} USD`) ||
                    (valuesIncomingTransactions.symbol && 'Unsupported') ||
                    ''}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pl-6 pr-4 py-4 text-sm text-dashboard-sub leading-5">
              <div className="flex items-center gap-8">
                <div>
                  Time of Transfer:{' '}
                  {(valuesIncomingTransactions.timeStamp &&
                    (Number(valuesIncomingTransactions.timeStamp) > 0
                      ? format(Number(valuesIncomingTransactions.timeStamp) * 1000, 'dd MMM yyyy, hh:mm a')
                      : format(new Date(valuesIncomingTransactions.timeStamp), 'dd MMM yyyy, hh:mm a'))) ||
                    ''}
                </div>
                <div className="flex items-center gap-2 truncate">
                  Tx Hash:{' '}
                  <WalletAddressV2
                    noAvatar
                    address={valuesIncomingTransactions.hash}
                    noColor
                    showFirst={5}
                    showLast={4}
                    scanType="txHash"
                    notFullWidth
                    chainId={chainId}
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
            <ReactTooltip
              id={`total_${
                (valuesIncomingTransactions.metamaskTransaction &&
                  valuesIncomingTransactions.metamaskTransaction.nonce) ||
                (valuesIncomingTransactions.safeTransaction &&
                  valuesIncomingTransactions.safeTransaction.nonce &&
                  valuesIncomingTransactions.safeTransaction.nonce.toString())
              }_${valuesIncomingTransactions.hash}_${valuesIncomingTransactions?.id}_${
                valuesIncomingTransactions?.timeStamp
              }`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {valuesIncomingTransactions.token ? (
                <PriceTooltip price={valuesIncomingTransactions.currentUSDPrice || 0} />
              ) : (
                'Unable to fetch price.'
              )}
            </ReactTooltip>
          </div>
        </div>
      )}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <TransactionDetailModal
          title="Incoming Transaction Details"
          additionalValue={additionalValue}
          showModal={showModal}
          setAdditionalValue={setAdditionalValue}
          categories={categories}
          refetch={refetch}
          isSource={isSource}
          transactionId={valuesIncomingTransactions && valuesIncomingTransactions.id}
          setShowModal={setShowModal}
          transactionDetailTabs={transactionDetailIncomingTabs}
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

export default IncomingTransactionsInfo
