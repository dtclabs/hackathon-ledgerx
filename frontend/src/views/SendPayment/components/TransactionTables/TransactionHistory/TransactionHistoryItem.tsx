/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-await-in-loop */
import { format } from 'date-fns'
import React, { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import ReactTooltip from 'react-tooltip'
import { LabelSuccessful, LabelRejected, SkeletonLabel } from '@/components/Label/Label'
import TokenImage from '@/components/TokenImage/TokenImage'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import { ESourceMethod } from '@/views/_deprecated/Transactions/constants'
import TransactionTab from './components/TransactionTab/TransactionTab'
import useFreeContext from '@/hooks/useFreeContext'
import { fetchUSDPriceApi } from '@/utils/fetchUSDPrice'
import { convertDateString } from '@/utils/convertDateString'
import { getErc20Contract } from '@/utils/contractHelpers'
import { formatNumber } from '@/utils/formatNumber'
import PriceTooltip from '../../PriceTooltip/PriceTooltip'
import TokenCircle from '@/components/TokenCircle/TokenCircle'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

interface ITansactionItem {
  index: any
  item: any
  expandListHistory: any
  toggleExpandTransaction: any
  price: any
  onShowTransaction: any
}
const TransactionHistoryItem: React.FC<ITansactionItem> = ({
  index,
  item,
  expandListHistory,
  price,
  toggleExpandTransaction,
  onShowTransaction
}) => {
  const { chainId, library } = useWeb3React()
  const [loading, setLoading] = useState(true)
  const { tokens, networkConfig } = useFreeContext()
  const [displayItem, setDisplayItem] = useState<any>(item)

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
        if ([56].includes(chainId)) {
          return price.binancecoin.usd
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
        if (tokenData.name === 'USDT') {
          return price.tether.usd
        }
        if (tokenData.name === 'DAI') {
          return price.dai.usd
        }
      }
      return price.ethereum.usd
    },
    [chainId, tokens, price]
  )

  const getTransactionTransferTokenAndAmount = useCallback(
    async (transaction) => {
      const getPrice = async (transactionToken) => {
        let pastPrice = getTokenPrice(transactionToken)
        try {
          const transferToken = tokens.find(
            (tokenItem) => tokenItem.tokenAddress.toLowerCase() === transactionToken.toLowerCase()
          )
          const rawResponse = await fetch(
            fetchUSDPriceApi(
              transferToken ? transferToken.tokenId : tokens[0].tokenId,
              convertDateString(transaction.executionDate)
            )
          )

          const content = await rawResponse.json()
          if (content?.data && content?.data.market_data) {
            pastPrice = content.data.market_data.current_price.usd
          }
          return pastPrice
        } catch (err) {
          sentryCaptureException(err)
          return '1'
        }
      }
      if (transaction.value !== '0') {
        const pastTokenPrice = await getPrice('')
        const currentTokenPrice = await getTokenPrice('')
        item.recipients.push({
          address: transaction.to,
          amount: formatEther(transaction.value),
          currentPrice: currentTokenPrice * Number(formatEther(transaction.value)),
          pastPrice: pastTokenPrice * Number(formatEther(transaction.value))
        })
        item.symbol = networkConfig.nativeToken
        item.tokenAddress = ''
        item.totalAmount = formatEther(transaction.value)
        item.currentPrice = currentTokenPrice * Number(formatEther(transaction.value))
        item.pastPrice = pastTokenPrice * Number(formatEther(transaction.value))
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
        const pastTokenPrice = await getPrice(transaction.to)
        const { parameters } = transaction.dataDecoded
        const [address, amount] = parameters

        const formatedAmount = formatUnits(amount.value, Number(unit)).toString()
        item.recipients.push({
          address: address.value,
          amount: formatedAmount,
          currentPrice: currentTokenPrice * Number(formatedAmount),
          pastPrice: pastTokenPrice * Number(formatedAmount)
        })
        item.tokenAddress = transaction.to
        item.totalAmount = formatedAmount
        item.currentPrice = currentTokenPrice * Number(formatedAmount)
        item.pastPrice = pastTokenPrice * Number(formatedAmount)
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
        if (tokenAddress === '') {
          item.symbol = networkConfig.nativeToken
        }
        const pastPrice = await getPrice(tokenAddress)
        const currentPrice = getTokenPrice(tokenAddress)
        const sum = await recipients.reduce((amount, itemAmount) => {
          if (itemAmount.value !== '0') {
            const transferAmount = formatUnits(itemAmount.value, unit)
            item.recipients.push({
              address: itemAmount.to,
              amount: transferAmount,
              currentPrice: Number(currentPrice) * Number(transferAmount),
              pastPrice: Number(pastPrice) * Number(transferAmount)
            })
            return BigNumber.from(amount).add(BigNumber.from(itemAmount.value))
          }
          const transferAmount = formatUnits(itemAmount.dataDecoded.parameters[1].value, Number(unit))
          item.recipients.push({
            address: itemAmount.dataDecoded.parameters[0].value,
            amount: transferAmount,
            currentPrice: Number(currentPrice) * Number(transferAmount),
            pastPrice: Number(pastPrice) * Number(transferAmount)
          })
          return BigNumber.from(amount).add(BigNumber.from(itemAmount.dataDecoded.parameters[1].value))
        }, '0')

        item.totalAmount = formatUnits(sum, unit)
        item.currentPrice = Number(currentPrice) * Number(formatUnits(sum, unit))
        item.pastPrice = Number(pastPrice) * Number(formatUnits(sum, unit))
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
      await getTransactionTransferTokenAndAmount(item).then(() => setDisplayItem(item))

      setLoading(false)
    }

    callback()

    return () => {
      setDisplayItem(undefined)
    }
  }, [item])

  const currentTransaction =
    (expandListHistory && expandListHistory.find((trans) => trans.safeTxHash === item.safeTxHash)) ||
    (expandListHistory && expandListHistory[0])

  const isRejectedTransaction = item && item.value === '0' && item.dataDecoded === null && item.data === null

  return (
    <div>
      <div className="bg-white px-8 py-2">
        <div className={`w-full border border-[#EAECF0] rounded-lg ${loading ? 'animate-pulse' : ''}`}>
          <div
            aria-hidden
            className={` w-full flex justify-between items-center rounded-t-lg bg-[#F8F9FA] p-4  ${
              currentTransaction && currentTransaction.isExpanded ? 'border-b border-[#EAECF0] ' : ''
            }`}
          >
            <div className="flex items-center gap-4 ">
              <div className="flex items-center gap-3">
                {currentTransaction && currentTransaction.isExpanded ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpandTransaction(displayItem && displayItem.safeTxHash)
                    }}
                  >
                    <img src="/svg/RedExpandArrow.svg" alt="ExpandArrow" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpandTransaction(displayItem && displayItem.safeTxHash)
                    }}
                    className="rotate-[30deg]"
                  >
                    <img src="/svg/ExpandArrow.svg" alt="ExpandArrow" />
                  </button>
                )}
              </div>
              <div className="flex items-stretch">
                {loading ? (
                  <div>
                    <div className="h-3.5 w-20 rounded-md bg-gray-400" />
                    <div className="h-3.5 w-36 rounded-md mt-1 bg-gray-300" />
                  </div>
                ) : (
                  <div className="pr-6 border-r border-[#EBEDEF]">
                    <h1 className="text-grey-900 font-semibold text-sm">
                      {displayItem &&
                      displayItem.recipients &&
                      displayItem.recipients.length &&
                      displayItem.recipients.length !== 1
                        ? `${displayItem.recipients.length} Recipients`
                        : '1 Recipient'}
                    </h1>
                    <p className="text-grey-50 text-sm text-medium">
                      {format(new Date(displayItem.executionDate), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                )}

                {displayItem && !isRejectedTransaction && (
                  <div className="pl-6">
                    {loading ? (
                      <>
                        <div className="h-4 w-20 rounded-md bg-gray-400" />
                        <div className="h-4 w-36 rounded-md mt-1 bg-gray-300" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {displayItem.token ? (
                            <TokenImage className="h-4 w-4" tokenAddress={displayItem && displayItem.tokenAddress} />
                          ) : (
                            <TokenCircle className="h-4 w-4" symbol={displayItem && displayItem.symbol} />
                          )}

                          <h1 className="text-grey-900 font-semibold text-sm">
                            {' '}
                            {formatNumber(item.totalAmount)} {displayItem.symbol}
                          </h1>
                        </div>
                        <div className="text-grey-50 items-center text-sm text-medium flex gap-1">
                          <div className="flex gap-1 items-center">
                            ~
                            {displayItem.token &&
                              (displayItem
                                ? formatNumber(displayItem.pastPrice, { useGrouping: true, maximumFractionDigits: 6 })
                                : formatNumber(displayItem.currentPrice, {
                                    useGrouping: true,
                                    maximumFractionDigits: 6
                                  }))}{' '}
                            USD
                            <img
                              data-tip
                              data-for={`transaction_${item.nonce}_${item.safeTxHash}`}
                              src="/svg/Info.svg"
                              alt="Info"
                            />
                          </div>
                          <ReactTooltip
                            id={`transaction_${item.nonce}_${item.safeTxHash}`}
                            borderColor="#eaeaec"
                            border
                            backgroundColor="white"
                            textColor="#111111"
                            effect="solid"
                            className="!opacity-100 !rounded-lg"
                            place="top"
                          >
                            {displayItem.token ? (
                              <PriceTooltip price={displayItem.currentPrice} />
                            ) : (
                              'Unable to fetch price.'
                            )}
                          </ReactTooltip>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center pr-4  ">
                {loading ? (
                  <SkeletonLabel />
                ) : displayItem && isRejectedTransaction ? (
                  <LabelRejected />
                ) : (
                  <LabelSuccessful />
                )}
              </div>
              {loading ? (
                <div className="w-[173px] h-10 bg-gray-300 rounded-md border border-transparent" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpandTransaction(item.safeTxHash)
                  }}
                  type="button"
                  className="border border-[#DDE2E7] hover:bg-gray-50  text-sm font-semibold border-transparent text-black-0 rounded-lg py-2 w-[173px] bg-white whitespace-nowrap flex justify-center"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
          {currentTransaction && currentTransaction.isExpanded && (
            <div className="transition ease-in-out duration-300">
              <div className="px-6 max-h-[330px] overflow-auto scrollbar">
                {displayItem &&
                  displayItem.recipients &&
                  displayItem.recipients.map((recipient, recipientIndex) => (
                    <TransactionTab
                      isRejectedTransaction={isRejectedTransaction}
                      token={displayItem.token}
                      tokenSymbol={displayItem && displayItem.symbol}
                      totalAmount={recipient.amount}
                      address={recipient.address}
                      key={recipientIndex}
                      currentPrice={recipient.currentPrice}
                      pastPrice={recipient.pastPrice}
                      index={recipientIndex}
                      hash={displayItem.safeTxHash}
                    />
                  ))}
              </div>
              <div className="border-t p-4 flex justify-between items-center  text-grey-50 text-sm font-medium">
                <div className="flex gap-1 whitespace-nowrap items-center">
                  <p className="items-center flex">Transaction Hash: </p>
                  <WalletAddress
                    scanType="txHash"
                    address={displayItem && displayItem.transactionHash}
                    noAvatar
                    noColor
                    showFirst={5}
                    showLast={4}
                  />
                </div>
                <button
                  className="bg-gray-1200 text-black-0 text-sm hover:bg-gray-200 font-semibold w-[173px] h-10 rounded-lg"
                  type="button"
                  onClick={() => onShowTransaction(displayItem)}
                >
                  View All Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistoryItem
