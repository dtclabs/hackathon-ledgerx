/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useWeb3React } from '@web3-react/core'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import ReactTooltip from 'react-tooltip'
import { IRecentlyTransactionExpanded } from '../../MetamaskHistory/MetaMaskHistoryPending'
import TokenImage from '@/components/TokenImage/TokenImage'
import { toPlainString } from '@/utils/eToNumber'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import { LabelSuccessful, LabelPending } from '@/components/Label/Label'
import { toShort } from '@/utils/toShort'
import { fetchUSDPriceApi } from '@/utils/fetchUSDPrice'
import useFreeContext from '@/hooks/useFreeContext'
import PriceTooltip from '../../PriceTooltip/PriceTooltip'
import { formatNumber } from '@/utils/formatNumber'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

interface IMetamaskPendingTransactionTab {
  transaction: IRecentlyTransactionExpanded
  toggleExpandTransaction: (hash: string) => void
  onShowModal: (transaction: any) => void
  price: any
}

const MetamaskPendingTransactionTab: React.FC<IMetamaskPendingTransactionTab> = ({
  price,
  transaction,
  onShowModal,
  toggleExpandTransaction
}) => {
  const { chainId } = useWeb3React()
  const { tokens, networkConfig } = useFreeContext()

  const token = tokens.find(
    (tokenItem) =>
      transaction.recipients &&
      transaction.recipients[0] &&
      transaction.recipients[0].tokenAddress === tokenItem.tokenAddress
  )

  const recipients = transaction && transaction.recipients
  const decimals = (transaction && transaction.recipients && transaction && transaction.recipients[0].decimal) || 18

  const totalAmount: string = useMemo(
    () =>
      transaction &&
      transaction.recipients &&
      transaction.recipients.reduce((a, b) => Number(a) + Number(b.amount), '0'),
    [transaction]
  )
  const [pastPrice, setPastPrice] = useState<any>()

  useEffect(() => {
    const callback = async () => {
      try {
        if (transaction.timestamp) {
          const datePrice = format(Number(transaction.timestamp) * 1000, 'dd-MM-yyyy')
          if ((token && token.name !== 'USDC') || !token) {
            const rawResponse = await fetch(fetchUSDPriceApi(token ? token.tokenId : tokens[0].tokenId, datePrice))

            const content = await rawResponse.json()
            setPastPrice(content.data.market_data.current_price.usd)
          } else {
            setPastPrice(1)
          }
        }
      } catch (error) {
        sentryCaptureException(error)
        setPastPrice(undefined)
      }
    }
    callback()
  }, [transaction.timestamp])

  return (
    <div className="bg-white px-8 py-2">
      <div className="w-full border border-[#EAECF0] rounded-lg">
        <div
          aria-hidden
          className={` ${
            transaction && transaction.isExpanded ? 'border-b' : 'border-0'
          } w-full flex justify-between items-center rounded-t-lg bg-[#F8F9FA] p-4   border-[#EAECF0] `}
        >
          <div className="flex items-center gap-4 ">
            <div className="flex items-center gap-3">
              {transaction && transaction.isExpanded ? (
                <button onClick={() => toggleExpandTransaction(transaction.hash)} type="button">
                  <img src="/svg/RedExpandArrow.svg" alt="ExpandArrow" />
                </button>
              ) : (
                <button
                  onClick={() => toggleExpandTransaction(transaction.hash)}
                  type="button"
                  className="rotate-[30deg]"
                >
                  <img src="/svg/ExpandArrow.svg" alt="ExpandArrow" />
                </button>
              )}
            </div>
            <div className="flex items-stretch">
              <div className="pr-6 border-r border-[#EBEDEF]">
                <h1 className="text-grey-900 font-semibold text-sm">
                  {transaction && transaction.recipients && transaction.recipients.length > 1
                    ? `${transaction && transaction.recipients && transaction.recipients.length} Recipients`
                    : '1 Recipient'}
                </h1>
                {transaction && (
                  <p className="text-grey-50 text-sm text-medium">
                    {format(Number(transaction.timestamp * 1000), 'dd MMM yyyy, hh:mm a')}
                  </p>
                )}
              </div>
              <div className="pl-6">
                <div className="flex items-center gap-1">
                  <TokenImage className="h-full w-3" tokenAddress={token && token.tokenAddress} />
                  <p className="text-grey-900 font-semibold text-base">
                    {totalAmount &&
                      formatNumber(
                        formatUnits(
                          Number(totalAmount).toLocaleString('fullwide', {
                            useGrouping: false
                          }),
                          decimals
                        )
                      )}{' '}
                    {(token && token.name) || networkConfig.nativeToken}
                  </p>
                </div>
                <div className="text-grey-900 text-sm flex gap-1 items-center">
                  ~{' '}
                  {pastPrice
                    ? formatNumber(
                        Number(
                          formatUnits(
                            toPlainString(
                              Number(totalAmount).toLocaleString('fullwide', {
                                useGrouping: false
                              })
                            ),
                            decimals
                          )
                        ) * Number(pastPrice),
                        { maximumFractionDigits: 6 }
                      )
                    : formatNumber(
                        getTotalUSDAmount(
                          chainId,
                          (totalAmount !== '0' &&
                            formatUnits(
                              toPlainString(
                                Number(totalAmount).toLocaleString('fullwide', {
                                  useGrouping: false
                                })
                              ),
                              decimals
                            )) ||
                            formatEther(totalAmount),
                          price,
                          token
                        ),
                        { maximumFractionDigits: 6 }
                      )}{' '}
                  USD
                  <img data-tip data-for={`total_${transaction.hash}`} src="/svg/Info.svg" alt="Info" />
                </div>

                <ReactTooltip
                  id={`total_${transaction.hash}`}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg"
                >
                  <PriceTooltip
                    price={getTotalUSDAmount(
                      chainId,
                      (totalAmount !== '0' &&
                        formatUnits(
                          Number(totalAmount).toLocaleString('fullwide', {
                            useGrouping: false
                          }),
                          decimals
                        )) ||
                        formatEther(totalAmount),
                      price,
                      token
                    )}
                  />
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className=" ">{!transaction.isExecuted ? <LabelPending /> : <LabelSuccessful />}</div>

            <button
              onClick={() => toggleExpandTransaction(transaction.hash)}
              type="button"
              className="border border-[#DDE2E7] hover:bg-gray-50 text-sm font-semibold border-transparent text-black-0 rounded-lg py-2 w-[173px] bg-white whitespace-nowrap flex justify-center"
            >
              View Details
            </button>
          </div>
        </div>
        {transaction && transaction.isExpanded && (
          <div className="transition ease-in-out duration-300">
            <div className="px-6 max-h-[330px] overflow-auto scrollbar">
              {recipients &&
                recipients.map((data, key) => (
                  <div key={key} className="w-full flex justify-between items-center  rounded-b-lg">
                    <div className="py-6 text-grey-900 font-semibold flex items-center gap-4">
                      <WalletAddress address={data.address} noColor showFirst={5} showLast={4} />
                    </div>

                    <div>
                      <div className="py-2 ">
                        <div className="flex justify-end items-center gap-2 text-grey-900 font-semibold">
                          <img alt="token" className="h-4 w-auto" src={token.logoUrl} />
                          <div>
                            {formatNumber(
                              formatUnits(
                                Number(data.amount).toLocaleString('fullwide', {
                                  useGrouping: false
                                }),
                                decimals
                              )
                            )}{' '}
                            {(token && token.name) || networkConfig.nativeToken}
                          </div>
                        </div>
                        <div className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
                          ~{' '}
                          {pastPrice
                            ? formatNumber(
                                Number(
                                  formatUnits(
                                    toPlainString(
                                      Number(data.amount).toLocaleString('fullwide', {
                                        useGrouping: false
                                      })
                                    ),
                                    decimals
                                  )
                                ) * Number(pastPrice)
                              )
                            : formatNumber(
                                getTotalUSDAmount(
                                  chainId,
                                  formatUnits(
                                    Number(data.amount).toLocaleString('fullwide', {
                                      useGrouping: false
                                    }),
                                    decimals
                                  ),
                                  price,
                                  token
                                )
                              )}{' '}
                          USD
                          <img
                            data-tip
                            data-for={`recipient_${key}_${transaction.hash}`}
                            src="/svg/Info.svg"
                            alt="Info"
                          />
                        </div>
                      </div>
                    </div>

                    <ReactTooltip
                      id={`recipient_${key}_${transaction.hash}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      className="!opacity-100 !rounded-lg"
                      place="left"
                    >
                      <PriceTooltip
                        price={getTotalUSDAmount(
                          chainId,
                          formatUnits(
                            Number(data.amount).toLocaleString('fullwide', {
                              useGrouping: false
                            }),
                            decimals
                          ),
                          price,
                          token
                        )}
                      />
                    </ReactTooltip>
                  </div>
                ))}
            </div>
            <div className="border-t  p-4 flex justify-between items-center text-grey-50 text-sm font-medium">
              Tx Hash: {toShort(transaction && transaction.hash, 5, 4)}
              <button
                className="bg-gray-1200 text-black-0 text-sm font-semibold w-[173px] h-10 rounded-lg"
                type="button"
                onClick={() => onShowModal({ ...transaction, pastPrice })}
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

export default MetamaskPendingTransactionTab
