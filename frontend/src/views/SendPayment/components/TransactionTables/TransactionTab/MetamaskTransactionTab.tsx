/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import InputDataDecoder from 'ethereum-input-data-decoder'
import ReactTooltip from 'react-tooltip'
import { IMetamaskTransaction } from '@/views/SendPayment/interface'
import TokenImage from '@/components/TokenImage/TokenImage'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import { IDisperseMethod } from '@/utils/getDataDecoded'
import { LabelSuccessful, ReceivedLabel, SkeletonLabel } from '@/components/Label/Label'
import { getTransactionMethod } from '@/utils/getTransactionMethod'
import { formatNumber } from '@/utils/formatNumber'
import { getErc20Contract } from '@/utils/contractHelpers'
import { fetchUSDPriceApi } from '@/utils/fetchUSDPrice'
import useFreeContext from '@/hooks/useFreeContext'
import { getImplementationAddress } from '@/utils/proxy'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'
import PriceTooltip from '../../PriceTooltip/PriceTooltip'
import TokenCircle from '@/components/TokenCircle/TokenCircle'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

interface IMetamaskTransactionTab {
  item: IMetamaskTransaction
  metamaskTransactions: IMetamaskTransaction[]
  toggleExpandTransaction: (hash: string) => void
  onShowTransactionMetaMask: (item: any) => void
  price: any
}

const MetamaskTransactionTab: React.FC<IMetamaskTransactionTab> = ({
  item,
  price,
  toggleExpandTransaction,
  onShowTransactionMetaMask
}) => {
  const { account, chainId, library } = useWeb3React()
  const [loading, setLoading] = useState(false)
  const { networkConfig: networkConfigs, tokens } = useFreeContext()

  const [displayItem, setDisplayItem] = useState<IMetamaskTransaction>()

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
        if ([56].includes(chainId)) {
          return price.binancecoin.usd
        }
        return price.ethereum.usd
      }
      const tokenData = tokens && tokens.find((tokenItem) => tokenItem.tokenAddress === tokenAdd)
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
      return 1
    },
    [price]
  )

  // const getDataDecoded = async (contractAddress: string, inputData?: string) => {
  //   if (!inputData || !contractAddress) {
  //     return null
  //   }
  //   const implementationAddress = await getImplementationAddress(library, contractAddress)

  //   const getResponse = async () => {
  //     const response = await fetch(networkConfigs.contractABIApi(implementationAddress || contractAddress))
  //     const res = await response.json()

  //     return res
  //   }

  //   const response = await getResponse()

  //   if (response && response.result && response.status !== '0') {
  //     const decoder = new InputDataDecoder(response.result)
  //     return decoder.decodeData(inputData)
  //   }

  //   return null
  // }

  // useEffect(() => {
  //   let isMounted = true
  //   const callback = async () => {
  //     setLoading(true)
  //     const getPrice = async (transactionToken, transaction) => {
  //       let pastPrice = getTokenPrice(transactionToken)
  //       try {
  //         const transferToken = tokens.find(
  //           (tokenItem) => tokenItem.tokenAddress.toLowerCase() === transactionToken.toLowerCase()
  //         )
  //         const rawResponse = await fetch(
  //           fetchUSDPriceApi(
  //             transferToken ? transferToken.tokenId : tokens[0].tokenId,
  //             format(transaction.timeStamp * 1000, 'dd-MM-yyyy')
  //           )
  //         )

  //         const content = await rawResponse.json()
  //         if (content?.data && content?.data.market_data) {
  //           pastPrice = content.data.market_data.current_price.usd
  //         }
  //         return pastPrice
  //       } catch (err) {
  //         sentryCaptureException(err)
  //         return '1'
  //       }
  //     }

  //     try {
  //       const dataDecoded = await getDataDecoded(item.input !== '0x' && item.to, item.input)

  //       if (dataDecoded && networkConfigs.disperse.toLowerCase() === item.to.toLowerCase()) {
  //         let pastPrice = await getPrice('', item)
  //         let unit = 18
  //         dataDecoded.inputs.push([])
  //         if (dataDecoded.method === IDisperseMethod.DisperseToken) {
  //           item.tokenAddress = `0x${dataDecoded.inputs[0]}`
  //           pastPrice = await getPrice(`0x${dataDecoded.inputs[0]}`, item)
  //           const erc20 = getErc20Contract(`0x${dataDecoded.inputs[0]}`, library)
  //           unit = await erc20.decimals()
  //           const symbol = await erc20.symbol()
  //           item.symbol = symbol
  //           const sum = dataDecoded.inputs[2].reduce((amount, dataItem, index) => {
  //             dataDecoded.inputs[3].push({
  //               address: dataDecoded.inputs[1][index],
  //               totalAmount: Number(formatUnits(dataItem.toString(), Number(unit))),
  //               pastPrice: Number(pastPrice) * Number(formatUnits(dataItem.toString(), Number(unit))),
  //               currentPrice:
  //                 Number(getTokenPrice(`0x${dataDecoded.inputs[0]}`)) *
  //                 Number(formatUnits(dataItem.toString(), Number(unit)))
  //             })
  //             return BigNumber.from(amount).add(BigNumber.from(dataItem).toString())
  //           }, '0')
  //           item.dataDecoded = dataDecoded
  //           const tokenData = tokens.find(
  //             (tokenItem) => tokenItem.tokenAddress.toLowerCase() === `0x${dataDecoded.inputs[0]}`.toLowerCase()
  //           )
  //           item.totalCurrentPriceUSD = Number(getTotalUSDAmount(chainId, formatUnits(sum, unit), price, tokenData))
  //           item.totalPastPriceUSD = Number(pastPrice) * Number(formatUnits(sum, unit))
  //           item.totalAmount = Number(formatUnits(sum, unit))
  //         }

  //         if (dataDecoded.method === IDisperseMethod.DisperseEther) {
  //           const sum = dataDecoded.inputs[1].reduce((amount, dataItem, index) => {
  //             dataDecoded.inputs[2].push({
  //               address: dataDecoded.inputs[0][index],
  //               totalAmount: Number(formatEther(dataItem.toString())),
  //               pastPrice: Number(pastPrice) * Number(formatEther(dataItem.toString())),
  //               currentPrice: Number(getTokenPrice('')) * Number(formatEther(dataItem.toString()))
  //             })
  //             return BigNumber.from(amount).add(BigNumber.from(dataItem).toString())
  //           }, '0')
  //           item.tokenAddress = ''
  //           item.symbol = networkConfigs.nativeToken
  //           item.dataDecoded = dataDecoded
  //           item.totalCurrentPriceUSD = Number(getTotalUSDAmount(chainId, formatEther(sum), price))
  //           item.totalPastPriceUSD = Number(pastPrice) * Number(formatEther(sum))
  //           item.totalAmount = Number(formatEther(sum))
  //         }
  //       } else if (dataDecoded && ['transfer'].includes(dataDecoded.method)) {
  //         item.tokenAddress = item.to
  //         const pastPrice = await getPrice(item.to, item)
  //         const erc20 = getErc20Contract(item.to, library)
  //         const symbol = await erc20.symbol()
  //         item.symbol = symbol
  //         const unit = await erc20.decimals()
  //         const tokenData = tokens.find((tokenItem) => tokenItem.tokenAddress.toLowerCase() === item.to)
  //         item.totalCurrentPriceUSD = Number(
  //           getTotalUSDAmount(chainId, formatUnits(dataDecoded.inputs[1].toString(), unit), price, tokenData)
  //         )
  //         item.totalPastPriceUSD = Number(pastPrice) * Number(formatUnits(dataDecoded.inputs[1].toString(), unit))
  //         item.totalAmount = Number(formatUnits(dataDecoded.inputs[1].toString(), unit))
  //       } else if (item.value !== '0') {
  //         const pastPrice = await getPrice('', item)
  //         item.tokenAddress = ''
  //         item.totalCurrentPriceUSD = Number(getTotalUSDAmount(chainId, formatEther(item.value), price))
  //         item.totalPastPriceUSD = Number(pastPrice) * Number(formatEther(item.value))
  //         item.totalAmount = Number(formatEther(item.value))
  //         item.symbol = networkConfigs.nativeToken
  //       } else {
  //         item.dataDecoded = dataDecoded
  //         item.totalCurrentPriceUSD = 0
  //         item.totalPastPriceUSD = 0
  //         item.totalAmount = 0
  //       }
  //     } catch (err) {
  //       if (item.value !== '0') {
  //         const pastPrice = await getPrice('', item)
  //         item.tokenAddress = ''
  //         item.totalCurrentPriceUSD = Number(getTotalUSDAmount(chainId, formatEther(item.value), price))
  //         item.totalPastPriceUSD = Number(pastPrice) * Number(formatEther(item.value))
  //         item.totalAmount = Number(formatEther(item.value))
  //         item.symbol = networkConfigs.nativeToken
  //       }
  //       sentryCaptureException(err)
  //     }
  //     if (isMounted) {
  //       setDisplayItem(item)
  //       setLoading(false)
  //     }
  //   }
  //   if (item && price) {
  //     callback()
  //   }

  //   return () => {
  //     setDisplayItem(undefined)
  //     isMounted = false
  //   }
  // }, [item.hash, price])

  return (
    <div className="bg-white px-8 py-2 ">
      <div className={`w-full border border-[#EAECF0] rounded-lg ${loading ? 'animate-pulse' : ''}`}>
        <div
          aria-hidden
          className={` w-full flex justify-between items-center rounded-t-lg bg-[#F8F9FA] p-4  ${
            (displayItem &&
              displayItem.isExpanded &&
              (displayItem.dataDecoded &&
              !Object.values(IDisperseMethod).includes(displayItem.dataDecoded.method as IDisperseMethod)
                ? 'border-b border-[#EAECF0] '
                : 'rounded-b-none')) ||
            'rounded-b-lg'
          }`}
        >
          <div className="flex items-center gap-4 ">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpandTransaction(item.hash)
                }}
                type="button"
                disabled={!displayItem}
                className={item && item.isExpanded ? '' : 'rotate-[30deg]'}
              >
                {item && item.isExpanded ? (
                  <img src="/svg/RedExpandArrow.svg" alt="ExpandArrow" />
                ) : (
                  <img src="/svg/ExpandArrow.svg" alt="ExpandArrow" />
                )}
              </button>
            </div>
            <div className="flex items-stretch">
              <div className="pr-6 border-r border-[#EBEDEF]">
                {loading ? (
                  <>
                    <div className="h-3.5 w-20 rounded-md bg-gray-400" />
                    <div className="h-3.5 w-36 rounded-md mt-1 bg-gray-300" />
                  </>
                ) : (
                  <>
                    <p className="text-grey-900 font-semibold capitalize text-base">
                      {displayItem && displayItem.to.toLowerCase() === account.toLowerCase()
                        ? 'Received Funds'
                        : displayItem && displayItem.dataDecoded
                        ? !Object.values(IDisperseMethod).includes(displayItem.dataDecoded.method as IDisperseMethod)
                          ? displayItem.dataDecoded.method
                            ? `${getTransactionMethod(displayItem.dataDecoded.method)}`
                            : 'Contract Interaction'
                          : (displayItem.dataDecoded.inputs &&
                              displayItem.dataDecoded.inputs[1] &&
                              displayItem.dataDecoded.inputs[1].length !== 1 &&
                              `${displayItem.dataDecoded.inputs[1].length} Recipients`) ||
                            '1 Recipient'
                        : displayItem && !displayItem.dataDecoded && displayItem.input === '0x'
                        ? '1 Recipient'
                        : 'Contract Interaction'}
                    </p>
                    <p className="text-grey-50 text-sm text-medium">
                      {format(Number(item.timeStamp) * 1000, 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </>
                )}
              </div>
              {displayItem &&
                (displayItem.to.toLowerCase() === account.toLowerCase() ||
                  (displayItem.value !== '0' && displayItem.functionName === '') ||
                  (displayItem.dataDecoded &&
                    Object.values(IDisperseMethod).includes(displayItem.dataDecoded.method as IDisperseMethod)) ||
                  displayItem.functionName.includes('disperseEther') ||
                  (displayItem.symbol && (displayItem.value !== '0' || displayItem.totalAmount !== 0))) && (
                  <div className="pl-6">
                    {loading ? (
                      <>
                        <div className="h-3.5 w-20 rounded-md bg-gray-400" />
                        <div className="h-3.5 w-36 rounded-md mt-1 bg-gray-300" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {token ? (
                            <TokenImage
                              type="tokenAddress"
                              tokenAddress={displayItem && displayItem.tokenAddress}
                              className="h-4 w-4"
                            />
                          ) : (
                            <TokenCircle symbol={displayItem && displayItem.symbol} className="h-4 w-4" />
                          )}
                          <p className="text-grey-900 font-semibold text-base">
                            {(displayItem &&
                              displayItem.totalAmount &&
                              formatNumber(displayItem && displayItem.totalAmount)) ||
                              (displayItem &&
                                displayItem.value &&
                                formatNumber(formatEther(displayItem && displayItem.value)))}{' '}
                            {displayItem && displayItem.symbol}
                          </p>
                        </div>
                        <div className="text-grey-900 text-sm flex gap-1 items-center">
                          ~{' '}
                          {token &&
                            (displayItem && displayItem.totalPastPriceUSD
                              ? formatNumber(displayItem.totalPastPriceUSD, { maximumFractionDigits: 6 })
                              : 0)}{' '}
                          USD
                          <img data-tip data-for={`total_${item.nonce}_${item.hash}`} src="/svg/Info.svg" alt="Info" />
                        </div>

                        <ReactTooltip
                          id={`total_${item.nonce}_${item.hash}`}
                          borderColor="#eaeaec"
                          border
                          backgroundColor="white"
                          textColor="#111111"
                          effect="solid"
                          className="!opacity-100 !rounded-lg"
                        >
                          {token ? (
                            <PriceTooltip
                              price={
                                displayItem && displayItem.totalCurrentPriceUSD ? displayItem.totalCurrentPriceUSD : 0
                              }
                            />
                          ) : (
                            'Unable to fetch price.'
                          )}
                        </ReactTooltip>
                      </>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <>
                <SkeletonLabel />
                <div className="w-[173px] bg-gray-300 rounded-md h-10" />
              </>
            ) : (
              <>
                <div className="flex items-center ">
                  {item && item.to && item.to.toLowerCase() === account.toLowerCase() ? (
                    <ReceivedLabel />
                  ) : (
                    <LabelSuccessful />
                  )}
                </div>
                <button
                  type="button"
                  disabled={!displayItem}
                  className="bg-white w-[173px] font-semibold text-black-0 text-sm leading-6 h-10 rounded-lg border flex items-center justify-center border-[#DDE2E7]  "
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpandTransaction(item.hash)
                  }}
                >
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
        {item &&
          item.isExpanded &&
          displayItem &&
          displayItem.dataDecoded &&
          ((displayItem.dataDecoded.method &&
            Object.values(IDisperseMethod).includes(displayItem.dataDecoded.method as IDisperseMethod) && (
              <div className="transition ease-in-out duration-300 ">
                <div className="px-6 max-h-[330px] overflow-auto scrollbar">
                  {displayItem.dataDecoded.inputs &&
                    displayItem.dataDecoded.inputs[displayItem.dataDecoded.inputs.length - 1].map(
                      (recipient, index) => (
                        <div key={index} className="w-full flex justify-between items-center  rounded-b-lg">
                          <div className="py-6 text-grey-900 font-semibold flex items-center gap-4">
                            <WalletAddress address={`${recipient.address}`} noColor showFirst={5} showLast={4} />
                          </div>

                          <div>
                            <div className="py-2 ">
                              <div className="flex justify-end items-center gap-2 text-grey-900 font-semibold">
                                {token ? (
                                  <TokenImage
                                    tokenAddress={displayItem && displayItem.tokenAddress}
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  <TokenCircle className="w-4 h-4" symbol={displayItem && displayItem.symbol} />
                                )}

                                <div>{formatNumber(recipient.totalAmount)}</div>
                                {displayItem.symbol}
                              </div>
                              <div className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
                                ~ {token && formatNumber(recipient.pastPrice, { maximumFractionDigits: 6 })} USD
                                <img
                                  data-tip
                                  data-for={`recipient_${index}_${item.nonce}_${item.hash}`}
                                  src="/svg/Info.svg"
                                  alt="Info"
                                />
                              </div>
                            </div>
                          </div>
                          {recipient && recipient.currentPrice && (
                            <ReactTooltip
                              id={`recipient_${index}_${item.nonce}_${item.hash}`}
                              borderColor="#eaeaec"
                              border
                              backgroundColor="white"
                              textColor="#111111"
                              effect="solid"
                              className="!opacity-100 !rounded-lg"
                              place="left"
                            >
                              {token ? <PriceTooltip price={recipient.currentPrice} /> : 'Unable to fetch price.'}
                            </ReactTooltip>
                          )}
                        </div>
                      )
                    )}
                </div>
                <div className="border-t gap-2 p-4 flex justify-between items-center text-grey-50 text-sm font-medium whitespace-nowrap">
                  Tx Hash:
                  <WalletAddress
                    noAvatar
                    address={displayItem.hash}
                    noColor
                    showFirst={5}
                    showLast={4}
                    scanType="txHash"
                  />
                  <button
                    className="bg-gray-1200 text-black-0 text-sm font-semibold w-[173px] h-10 rounded-lg"
                    type="button"
                    onClick={() => onShowTransactionMetaMask(displayItem)}
                  >
                    View All Details
                  </button>
                </div>
              </div>
            )) || (
            <div className="transition ease-in-out duration-300 ">
              <div className="px-6 max-h-[330px] overflow-auto scrollbar">
                <div className="w-full flex justify-between items-center  rounded-b-lg">
                  <div className="py-6 text-grey-900 font-semibold flex items-center gap-4">
                    <WalletAddress
                      address={`${displayItem.to}`}
                      scanType="address"
                      noColor
                      showFirst={5}
                      showLast={4}
                    />
                  </div>
                </div>
              </div>
              <div className="border-t p-4 flex justify-between items-center text-grey-50 text-sm font-medium whitespace-nowrap gap-2">
                Tx Hash:{' '}
                <WalletAddress
                  noAvatar
                  address={displayItem.hash}
                  noColor
                  showFirst={5}
                  showLast={4}
                  scanType="txHash"
                />
              </div>
            </div>
          ))}
        {item && item.isExpanded && displayItem && !displayItem.dataDecoded && (
          <div className="transition ease-in-out duration-300">
            <div className="px-6 max-h-[330px] overflow-auto scrollbar">
              <div className="w-full flex justify-between items-center rounded-b-lg">
                <div className="py-6 text-grey-900 font-semibold flex items-center gap-4">
                  <WalletAddress address={displayItem.to} noColor showFirst={5} showLast={4} />
                </div>
                {!displayItem.dataDecoded && displayItem.value !== '0' && displayItem.input === '0x' && (
                  <>
                    <div>
                      <div className="py-2 ">
                        <div className="flex justify-end items-center gap-2 text-grey-900 font-semibold">
                          <TokenImage tokenAddress={displayItem.tokenAddress} className="w-3 h-auto" />
                          {displayItem.totalAmount && formatNumber(displayItem.totalAmount)} {displayItem.symbol}
                        </div>
                        <p className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
                          ~ {formatNumber(displayItem.totalPastPriceUSD, { maximumFractionDigits: 6 })} USD
                          <img data-tip data-for={`total_${item.nonce}_${item.hash}`} src="/svg/Info.svg" alt="Info" />
                        </p>
                      </div>
                    </div>
                    {displayItem && displayItem.totalCurrentPriceUSD && (
                      <ReactTooltip
                        id={`total_${item.nonce}_${item.hash}`}
                        borderColor="#eaeaec"
                        border
                        backgroundColor="white"
                        textColor="#111111"
                        effect="solid"
                        className="!opacity-100 !rounded-lg"
                      >
                        <PriceTooltip price={displayItem.totalCurrentPriceUSD} />
                      </ReactTooltip>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="border-t p-4 flex justify-between items-center text-grey-50 text-sm font-medium">
              <div className="flex items-center w-full gap-2 h-10">
                <span className="whitespace-nowrap">Tx Hash:</span>
                <WalletAddress
                  className="text-grey-50"
                  address={displayItem.hash}
                  scanType="txHash"
                  noColor
                  showFirst={5}
                  showLast={4}
                  noAvatar
                />
              </div>
              {!displayItem.dataDecoded && displayItem.input === '0x' && (
                <button
                  className="bg-gray-1200 text-black-0 text-sm font-semibold w-[173px] h-10 rounded-lg"
                  type="button"
                  onClick={() => onShowTransactionMetaMask(displayItem)}
                >
                  View All Details
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MetamaskTransactionTab
