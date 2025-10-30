/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import ReactTooltip from 'react-tooltip'
import Modal from '@/components/Modal'
import { IRecipient } from '@/state/free/interface'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import TokenImage from '@/components/TokenImage/TokenImage'
import { toPlainString } from '@/utils/eToNumber'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { formatNum } from '../TotalAmount/TotalAmount'
import useFreeContext from '@/hooks/useFreeContext'
import PriceTooltip from '../PriceTooltip/PriceTooltip'
import TokenCircle from '@/components/TokenCircle/TokenCircle'

// import { Container } from './styles';
export interface IMetamaskTransactionProcessingDetail {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  transaction: any
  price: any
}

const MetamaskTransactionProcessingDetail: React.FC<IMetamaskTransactionProcessingDetail> = ({
  price,
  showModal,
  transaction,
  setShowModal
}) => {
  const { tokens } = useFreeContext()
  const { chainId } = useWeb3React()
  const amount = transaction && transaction.recipients && transaction.recipients.map((item) => item.amount)
  const tokenAddress = transaction && transaction.recipients && transaction.recipients[0].tokenAddress
  const decimals = (transaction && transaction.recipients && transaction.recipients[0].decimal) || 18
  const token = tokens.find((item) => item.tokenAddress === tokenAddress)

  const totalAmount = useMemo(() => {
    if (transaction && transaction.recipients) {
      const sum = amount.reduce((acc, recipient) => acc.add(recipient), BigNumber.from('0'))
      return sum
    }
    return BigNumber.from('0')
  }, [amount, transaction])

  const recipientItem = (recipient: IRecipient, index: number) => (
    <div
      key={index}
      className={`flex justify-between items-center h-[52px] py-[14px] px-4 ${
        index % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FFFFFF]'
      } `}
    >
      <div className="flex items-center gap-5">
        <WalletAddress
          noColor
          showLast={4}
          showFirst={5}
          sizeAvatar={24}
          address={recipient.address}
          className="text-black-0 font-medium text-sm leading-5"
        />
      </div>
      <div>
        <div>
          <div>
            <div className="flex justify-end items-center gap-1">
              <TokenImage className="h-4 w-4" tokenAddress={recipient.tokenAddress} />

              <p className="font-semibold text-sm leading-4 text-black-0">
                {' '}
                {formatNum(
                  toPlainString(
                    Number(
                      formatUnits(
                        Number(recipient.amount).toLocaleString('fullwide', {
                          useGrouping: false
                        }),
                        decimals
                      )
                    )
                  )
                )}
              </p>
            </div>

            <div className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
              ~{' '}
              {transaction.pastPrice
                ? formatNum(
                    Number(
                      Number(
                        Number(
                          formatUnits(
                            toPlainString(
                              Number(recipient.amount).toLocaleString('fullwide', {
                                useGrouping: false
                              })
                            ),
                            decimals
                          )
                        ) * Number(transaction.pastPrice)
                      ).toFixed(6)
                    )
                  )
                : formatNum(
                    Number(toPlainString(getTotalUSDAmount(chainId, Number(recipient.amount).toString(), price, token)))
                  )}{' '}
              USD
              <img
                data-tip
                data-for={`recipientPending_detail_${index}_${transaction.Hash}`}
                src="/svg/Info.svg"
                alt="Info"
              />
            </div>
          </div>
        </div>
        <ReactTooltip
          id={`recipientPending_detail_${index}_${transaction.Hash}`}
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
                Number(recipient.amount).toLocaleString('fullwide', {
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
    </div>
  )

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="w-[770px]">
        <div className="p-8 flex justify-between items-center bg-white rounded-t-[24px] border border-b">
          <h1 className="text-2xl leading-8 text-black-0 font-supply">TRANSFER SUMMARY</h1>
          <button type="button" onClick={() => setShowModal(false)}>
            <img src="/svg/close.svg" alt="close" />
          </button>
        </div>
        <div className="p-6 bg-white font-inter text-gray-700 max-h-reviewModal overflow-auto scrollbar">
          <div className="border-b border-[#EBEDEF] pb-8">
            <div>
              <h1 className="flex font-medium text-sm leading-4 text-black-0  ">Transaction Hash</h1>
              <div className="flex items-center text-base leading-5 font-supply text-black-0">
                <WalletAddress
                  showLast={4}
                  showFirst={5}
                  address={transaction && transaction.hash}
                  scanType="txHash"
                  noAvatar
                  noColor
                />
              </div>
            </div>
            <div className="flex justify-start gap-16">
              <div>
                <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Nonce</h1>
                <p className="font-supply text-base leading-5 text-black-0">{transaction && transaction.nonce}</p>
              </div>
              <div className="flex justify-end">
                <div>
                  <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Executed</h1>
                  <p className="font-supply text-base leading-5 text-black-0">
                    {format(new Date(Number(transaction && transaction.timestamp) * 1000), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <div className="pt-8 pb-4">
                <div className="text-black-0 py-2 w-fit rounded-lg font-semibold text-sm">Recipients</div>
              </div>
              <div className="bg-[#F8F9FA] rounded-t-md flex text-sm leading-4 text-[#727B84] justify-between items-center pl-4 pr-6 py-4 border border-[#EBEDEF] border-b-0">
                <div className="flex">
                  <p className="w-12">No.</p>
                  <p>Wallet address</p>
                </div>
                <p>Amount</p>
              </div>
              <div className="max-h-[210px] overflow-auto scrollbar rounded-b-md border border-[#EBEDEF]">
                {transaction &&
                  transaction.recipients &&
                  transaction.recipients.map((recipient, index) => recipientItem(recipient, index))}
              </div>

              <div className="flex justify-end mt-6">
                <div>
                  <div className="text-right mr-3 text-sm leading-4 font-semibold flex gap-1 items-center">
                    Total:{' '}
                    {transaction.pastPrice
                      ? formatNum(
                          Number(
                            Number(
                              Number(
                                formatUnits(
                                  toPlainString(
                                    Number(totalAmount).toLocaleString('fullwide', {
                                      useGrouping: false
                                    })
                                  ),
                                  decimals
                                )
                              ) * Number(transaction.pastPrice)
                            ).toFixed(6)
                          )
                        )
                      : formatNum(
                          toPlainString(Number(toPlainString(getTotalUSDAmount(chainId, totalAmount, price, token))))
                        )}{' '}
                    USD
                    <img data-tip data-for={`detail_total_${transaction.hash}`} src="/svg/Info.svg" alt="Info" />
                  </div>
                </div>
                <ReactTooltip
                  id={`detail_total_${transaction.hash}`}
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
                        Number(totalAmount).toLocaleString('fullwide', {
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
            </div>
          </div>
        </div>
        <div className="px-6 py-8 flex justify-end items-center bg-white rounded-b-[24px] border-t border-[#EBEDEF] ">
          <button
            className="bg-grey-900 hover:bg-grey-901 font-semibold font-inter text-white w-full py-4 leading-6 text-base rounded-lg"
            type="button"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MetamaskTransactionProcessingDetail
