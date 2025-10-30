/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import { format } from 'date-fns'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import ReactTooltip from 'react-tooltip'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { ETransactionStatus } from '../../../interface'
import { ESourceMethod } from '@/views/_deprecated/Transactions/constants'
import Label from '../../Label/Label'
import TokenImage from '@/components/TokenImage/TokenImage'
import useFreeContext from '@/hooks/useFreeContext'
import { getErc20Contract } from '@/utils/contractHelpers'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import RecipientItem from './RecipientItem'
import { formatNumber } from '@/utils/formatNumber'
import TokenCircle from '@/components/TokenCircle/TokenCircle'

interface ITansactionItem {
  item: any
  expandList: any
  toggleExpandTransaction: any
  price: any
  onShowTransaction: any
  totalTransactions: any
  source: any
  onExecuted: any
  setShowError: any
  setError: any
  onSign: any
  onReject: any
}
const TransactionQueueItem: React.FC<ITansactionItem> = ({
  item,
  expandList,
  price,
  toggleExpandTransaction,
  onShowTransaction,
  totalTransactions,
  source,
  onExecuted,
  setShowError,
  setError,
  onSign,
  onReject
}) => {
  const { account, library, chainId } = useWeb3React()
  const [loading, setLoading] = useState(true)
  const [displayItem, setDisplayItem] = useState<any>()
  const { tokens, networkConfig } = useFreeContext()

  const token = useMemo(
    () =>
      (displayItem &&
        tokens.find(
          (tokenItem) =>
            tokenItem.tokenAddress &&
            displayItem.tokenAddress &&
            tokenItem.tokenAddress.toLowerCase() === displayItem.tokenAddress.toLowerCase()
        )) ||
      (displayItem && displayItem.tokenAddress === '' && tokens[0]) ||
      null,
    [displayItem, tokens]
  )

  const getTokenPrice = useCallback(
    (tokenAdd: string) => {
      if (!price) {
        return 1
      }
      if (!tokenAdd) {
        if ([137, 80001].includes(chainId)) {
          return price['matic-network'].usd
        }
        if ([43114].includes(chainId)) {
          return price['avalanche-2'].usd
        }
        return price.ethereum.usd
      }
      const tokenData = tokens && tokens.find((data) => data.tokenAddress === tokenAdd)
      if (tokenData) {
        if (tokenData.name === 'XSGD') {
          return price.xsgd.usd
        }
        if (tokenData.name === 'XIDR') {
          return price['straitsx-indonesia-rupiah'].usd
        }
        if (tokenData.name === 'USDC') {
          return price['usd-coin'].usd
        }
      }
      return 1
    },
    [chainId, tokens, price]
  )

  const getTransactionTransferTokenAndAmount = useCallback(
    async (transaction) => {
      if (transaction.value !== '0') {
        const currentTokenPrice = await getTokenPrice('')
        item.recipients.push({
          address: transaction.to,
          amount: formatEther(transaction.value),
          currentPrice: currentTokenPrice * Number(formatEther(transaction.value))
        })
        item.tokenAddress = ''
        item.totalAmount = formatEther(transaction.value)
        item.currentPrice = currentTokenPrice * Number(formatEther(transaction.value))
      }
      if (transaction.value === '0' && transaction.data === null && transaction.dataDecoded === null) {
        item.recipients.push({
          address: transaction.to,
          amount: '0',
          currentPrice: 0,
          pastPrice: 0
        })
        item.tokenAddress = ''
        item.totalAmount = '0'
        item.currentPrice = 0
        item.pastPrice = 0
      }
      if (transaction.dataDecoded && transaction.dataDecoded.method === ESourceMethod.Transfer) {
        const erc20 = getErc20Contract(transaction.to, library)
        const unit = await erc20.decimals()
        const symbol = await erc20.symbol()
        item.symbol = symbol
        const currentTokenPrice = await getTokenPrice(transaction.to)
        const { parameters } = transaction.dataDecoded
        const [address, amount] = parameters

        const formatedAmount = formatUnits(amount.value, Number(unit)).toString()
        item.recipients.push({
          address: address.value,
          amount: formatedAmount,
          currentPrice: currentTokenPrice * Number(formatedAmount)
        })
        item.tokenAddress = transaction.to
        item.totalAmount = formatedAmount
        item.currentPrice = currentTokenPrice * Number(formatedAmount)
      }

      if (transaction.dataDecoded && transaction.dataDecoded.method === ESourceMethod.MultiSend) {
        const recipients = transaction.dataDecoded.parameters[0].valueDecoded
        let unit = 18
        let tokenAddress = ''
        if (recipients[0].value === '0') {
          tokenAddress = recipients[0].to
          const erc20 = getErc20Contract(recipients[0].to, library)
          unit = await erc20.decimals()
          const symbol = await erc20.symbol()
          item.symbol = symbol
        }
        item.tokenAddress = tokenAddress
        if (item.tokenAddress === '') {
          item.symbol = 'ETH'
        }
        const currentPrice = getTokenPrice(tokenAddress)
        const sum = await recipients.reduce((amount, itemAmount) => {
          if (itemAmount.value !== '0') {
            const transferAmount = formatUnits(itemAmount.value, unit)
            item.recipients.push({
              address: itemAmount.to,
              amount: transferAmount,
              currentPrice: Number(currentPrice) * Number(transferAmount)
            })
            return BigNumber.from(amount).add(BigNumber.from(itemAmount.value))
          }
          const transferAmount = formatUnits(itemAmount.dataDecoded.parameters[1].value, Number(unit))
          item.recipients.push({
            address: itemAmount.dataDecoded.parameters[0].value,
            amount: transferAmount,
            currentPrice: Number(currentPrice) * Number(transferAmount)
          })
          return BigNumber.from(amount).add(BigNumber.from(itemAmount.dataDecoded.parameters[1].value))
        }, '0')
        item.totalAmount = formatUnits(sum, unit)
        item.currentPrice = Number(currentPrice) * Number(formatUnits(sum, unit))
      }
      if (item.tokenAddress || item.tokenAddress === '') {
        if (item.tokenAddress === '') item.token = tokens[0]
        const isSupportToken = tokens.find(
          (tokenItem) =>
            tokenItem.tokenAddress &&
            item.tokenAddress &&
            tokenItem.tokenAddress.toLowerCase() === item.tokenAddress.toLowerCase()
        )
        if (isSupportToken) item.token = isSupportToken
      }
      if (item && item.value === '0' && item.dataDecoded === null && item.data === null) {
        item.isRejectedTransaction = true
      }
    },
    [item]
  )

  useEffect(() => {
    const callback = async () => {
      setLoading(true)
      item.recipients = []
      await getTransactionTransferTokenAndAmount(item)
      setDisplayItem(item)
      setLoading(false)
    }

    callback()

    return () => {
      setDisplayItem(undefined)
    }
  }, [item])

  const currentTransaction =
    (expandList &&
      expandList.find((trans) => trans.safeTxHash === item.safeTxHash) &&
      expandList.find((trans) => trans.safeTxHash === item.safeTxHash)) ||
    (expandList && expandList[0])

  const isTransactionExecutable = (safeThreshold: number, transaction: SafeMultisigTransactionResponse) =>
    transaction && transaction.confirmations && transaction.confirmations.length >= safeThreshold

  const isTransactionSignedByAddress = (signerAddress: string, transaction: SafeMultisigTransactionResponse) => {
    const isConfirm =
      transaction &&
      transaction.confirmations &&
      transaction.confirmations.find((confirmation) => confirmation.owner === signerAddress)

    return !!isConfirm
  }

  return (
    <div className="bg-white px-8 py-2">
      <div className="w-full border border-[#EAECF0] rounded-lg">
        <div
          aria-hidden
          className={` w-full flex justify-between items-center rounded-t-lg bg-[#F8F9FA] p-4 cursor-pointer ${
            currentTransaction && currentTransaction.isExpanded ? 'border-b border-[#EAECF0] ' : ''
          }`}
          onClick={(e) => {
            toggleExpandTransaction(item.safeTxHash)
          }}
        >
          <div className="flex items-center gap-4 ">
            <div className="flex items-center gap-3">
              {totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED) &&
              totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0] &&
              item.nonce ===
                totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0]
                  .nonce &&
              item.status !== ETransactionStatus.CONFIRMED &&
              isTransactionExecutable(source.threshold, item) ? (
                <button
                  type="button"
                  className={currentTransaction && currentTransaction.isExpanded ? '' : 'rotate-[30deg]'}
                >
                  <img src="/svg/RedExpandArrow.svg" alt="RedExpandArrow" />
                </button>
              ) : currentTransaction && currentTransaction.isExpanded ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpandTransaction(item.safeTxHash)
                  }}
                >
                  <img src="/svg/RedExpandArrow.svg" alt="ExpandArrow" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpandTransaction(item.safeTxHash)
                  }}
                  className="rotate-[30deg]"
                >
                  <img src="/svg/ExpandArrow.svg" alt="ExpandArrow" />
                </button>
              )}

              <div
                className={` text-sm px-3 py-[10px] bg-white rounded-lg ${
                  (totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED) &&
                    totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0] &&
                    item.nonce ===
                      totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0]
                        .nonce &&
                    item.status !== ETransactionStatus.CONFIRMED &&
                    isTransactionExecutable(source.threshold, item) &&
                    'text-neutral-900') ||
                  'text-[#99A4AF]'
                }`}
              >
                Nonce {item.nonce}
              </div>
            </div>
            <div className="flex items-stretch">
              <div className="pr-6 border-r border-[#EBEDEF]">
                <h1 className="text-grey-900 font-semibold text-sm">
                  {displayItem && displayItem.recipients && displayItem.recipients.length !== 1
                    ? `${displayItem.recipients.length} Recipients`
                    : '1 Recipient'}
                </h1>
                <p className="text-grey-50 text-sm text-medium">
                  {format(new Date(item.submissionDate), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              {displayItem && !displayItem.isRejectedTransaction && (
                <div className="pl-6">
                  {loading ? (
                    <>
                      <div className="h-4 w-20 rounded-md bg-gray-400" />
                      <div className="h-4 w-36 rounded-md mt-1 bg-gray-300" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        {token ? (
                          <TokenImage className="h-4 w-4" tokenAddress={displayItem && displayItem.tokenAddress} />
                        ) : (
                          <TokenCircle className="h-4 w-4" symbol={item && item.symbol} />
                        )}

                        <h1 className="text-grey-900 font-semibold text-sm">
                          {' '}
                          {formatNumber(item.totalAmount)} {displayItem.symbol || networkConfig.nativeToken}
                        </h1>
                      </div>
                      <div className="text-grey-50 items-center text-sm text-medium flex gap-1">
                        <p>~ {token && formatNumber(displayItem.currentPrice, { maximumFractionDigits: 6 })} USD</p>
                        {!token && (
                          <img
                            data-tip
                            data-for={`recipient_${item.nonce}_${item.safeTxHash}`}
                            src="/svg/Info.svg"
                            alt="Info"
                          />
                        )}
                        {!token && (
                          <ReactTooltip
                            id={`recipient_${item.nonce}_${item.safeTxHash}`}
                            borderColor="#eaeaec"
                            border
                            backgroundColor="white"
                            textColor="#111111"
                            effect="solid"
                            className="!opacity-100 !rounded-lg"
                            place="top"
                          >
                            Unable to fetch price.
                          </ReactTooltip>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-4 ">
              {displayItem &&
                displayItem.isRejectTransaction &&
                item &&
                item.status !== ETransactionStatus.CONFIRMED && (
                  <p className="text-neutral-900 text-sm leading-5 font-semibold">Rejected</p>
                )}
              {item.status !== ETransactionStatus.CONFIRMED && (
                <Tooltip
                  position={ETooltipPosition.BOTTOM}
                  shortText={
                    <Label
                      ready={
                        totalTransactions.filter(
                          (transaction) => transaction.status !== ETransactionStatus.CONFIRMED
                        ) &&
                        totalTransactions.filter(
                          (transaction) => transaction.status !== ETransactionStatus.CONFIRMED
                        )[0] &&
                        item.nonce ===
                          totalTransactions.filter(
                            (transaction) => transaction.status !== ETransactionStatus.CONFIRMED
                          )[0].nonce &&
                        isTransactionExecutable(source.threshold, item)
                      }
                      confirmations={item.confirmations.length}
                      threshold={source.threshold}
                    />
                  }
                  text={
                    <div className="p-4  w-[180px] flex flex-col gap-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-[#27272A] text-sm leading-4">Approvals</p>
                        <p className="text-[#27272A] text-sm leading-4 font-semibold">
                          {item.confirmations.length} of {source.threshold}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#27272A] text-sm leading-4">Pending</p>
                        <p className="text-[#27272A] text-sm leading-4 font-semibold">
                          {source.threshold - item.confirmations.length}
                        </p>
                      </div>
                    </div>
                  }
                />
              )}
            </div>
            <div className="pl-4">
              {(item.status === ETransactionStatus.CONFIRMED && (
                <button
                  type="button"
                  className="border text-sm leading-6 font-semibold border-transparent text-white rounded-lg py-2 w-[173px] bg-green-100 flex justify-center"
                  disabled
                >
                  Completed
                </button>
              )) ||
                (totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED) &&
                  totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0] &&
                  item.nonce ===
                    totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0]
                      .nonce &&
                  isTransactionExecutable(source.threshold, item) &&
                  ((!item.status && 'Execute' && (
                    <button
                      type="button"
                      className="border text-sm font-semibold border-transparent text-white rounded-lg py-2 w-[173px] bg-grey-900 whitespace-nowrap flex justify-center"
                      onClick={(e) => onExecuted(item, e)}
                    >
                      Execute
                    </button>
                  )) ||
                    (item.status === ETransactionStatus.EXECUTING && (
                      <Tooltip
                        position={ETooltipPosition.BOTTOM}
                        className="-mb-8"
                        text="Awaiting Confirmation"
                        shortText={
                          <button
                            type="button"
                            className="border text-sm font-semibold border-transparent text-white rounded-lg py-2 w-[173px] bg-yellow-500 whitespace-nowrap"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            Executing
                          </button>
                        }
                      />
                    )) ||
                    (item.status === ETransactionStatus.CONFIRMING && (
                      <button
                        type="button"
                        className="border text-sm font-semibold border-transparent text-white rounded-lg py-2 w-[173px] bg-yellow-500 whitespace-nowrap flex justify-center"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex">
                          Pending
                          <div className="flex items-center animate-spin w-3 h-3 m-auto ml-1">
                            <img src="/image/Load.png" alt="Load" />
                          </div>
                        </div>
                      </button>
                    )))) ||
                (totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED) &&
                  totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0] &&
                  item.nonce !==
                    totalTransactions.filter((transaction) => transaction.status !== ETransactionStatus.CONFIRMED)[0]
                      .nonce &&
                  isTransactionExecutable(source.threshold, item) && (
                    <Tooltip
                      position={ETooltipPosition.BOTTOM}
                      className="-mb-24"
                      text={
                        <div className="w-[180px] p-2 whitespace-pre-wrap text-[#27272A] text-sm leading-5">
                          To execute this, you need to settle the transaction before it.
                        </div>
                      }
                      shortText={
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowError(true)
                            setError(
                              `Transaction with nonce ${
                                totalTransactions && totalTransactions[0].nonce
                              } needs to be executed first. If transaction is invisible. Please execute it on the Gnosis App.`
                            )
                          }}
                          className="flex justify-center text-sm items-center border border-transparent font-semibold text-white rounded-lg py-2 w-[173px] bg-grey-900 opacity-60  hover:bg-grey-901 "
                        >
                          Execute
                        </button>
                      }
                    />
                  )) ||
                (!isTransactionSignedByAddress(account, item) ? (
                  <div className="flex items-center gap-2  w-[173px]">
                    {item && !(item.value === '0' && item.data === null && item.dataDecoded === null) && (
                      <button
                        type="button"
                        className="bg-white flex-1 border text-sm border-grey-900 font-semibold flex items-center justify-center text-neutral-900 rounded-lg py-2 hover:text-neutral-900 hover:border-grey-900"
                        onClick={(e) => onReject(item, e)}
                      >
                        Reject
                      </button>
                    )}

                    <button
                      type="button"
                      className="bg-grey-900 text-sm border border-transparent font-semibold flex items-center justify-center text-white rounded-lg py-2 w-full flex-1 hover:bg-grey-901"
                      onClick={(e) => onSign(item, e)}
                    >
                      Approve
                    </button>
                  </div>
                ) : (
                  item.confirmations.length !== source.threshold && (
                    <Tooltip
                      position={ETooltipPosition.BOTTOM}
                      className="-mb-8"
                      text="Awaiting Confirmation"
                      shortText={
                        <div className="flex justify-center items-center text-sm font-semibold border border-transparent text-white rounded-lg py-2  w-[173px] bg-grey-900 opacity-60 ">
                          Execute
                        </div>
                      }
                    />
                  )
                ))}
            </div>
          </div>
        </div>
        {currentTransaction.isExpanded && (
          <div className="transition ease-in-out duration-300">
            <div className="px-6 max-h-[330px] overflow-auto scrollbar">
              {displayItem &&
                displayItem.recipients &&
                displayItem.recipients.map((recipient, recipientIndex) => (
                  <RecipientItem
                    isRejectedTransaction={displayItem.isRejectedTransaction}
                    symbol={displayItem && displayItem.symbol}
                    totalAmount={recipient.amount}
                    address={recipient.address}
                    tokenAddress={displayItem.tokenAddress}
                    key={recipientIndex}
                    currentPrice={recipient.currentPrice}
                    index={recipientIndex}
                    hash={displayItem.safeTxHash}
                  />
                ))}
            </div>
            <div className="border-t p-4 flex justify-between items-center  text-grey-50 text-sm font-medium">
              <div className="flex gap-1 whitespace-nowrap items-center">
                <p className="items-center flex">Safe Transaction Hash: </p>
                <WalletAddress
                  scanType="txHash"
                  address={displayItem && displayItem.safeTxHash}
                  noScan
                  noAvatar
                  noColor
                  showFirst={5}
                  showLast={4}
                />
              </div>
              <button
                className="bg-gray-1200 text-black-0 text-sm hover:bg-gray-200 font-semibold w-[173px] h-10 rounded-lg"
                type="button"
                onClick={() => {
                  onShowTransaction(displayItem)
                }}
              >
                View All Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionQueueItem
