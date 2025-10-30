/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import Modal from '@/components/Modal'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import Close from '@/assets/svg/Close.svg'
import TokenImage from '@/components/TokenImage/TokenImage'
import { IMetamaskTransaction } from '../../interface'
import { formatNumber } from '@/utils/formatNumber'
import { IDisperseMethod } from '@/utils/getDataDecoded'
import PriceTooltip from '../PriceTooltip/PriceTooltip'
import useFreeContext from '@/hooks/useFreeContext'
import TokenCircle from '@/components/TokenCircle/TokenCircle'

interface ITransactionDetail {
  transaction: IMetamaskTransaction
  showModalMetaMask: boolean
  setShowModalMetaMask: (showModal: boolean) => void
}

const DiseperseRecipientItem = ({
  index,
  address,
  symbol,
  currentPrice,
  token,
  pastPrice,
  totalAmount,
  hash
}: {
  index: number
  symbol?: string
  address: string
  token: any
  currentPrice: number
  pastPrice: number
  totalAmount: number
  hash: string
}) => (
  <div
    key={index}
    className={`flex justify-between items-center h-[52px] py-[14px] px-4 ${
      index % 2 !== 0 ? 'bg-[#F8F9FA]' : 'bg-[#FFFFFF]'
    }`}
  >
    <div className="flex items-center gap-5">
      <WalletAddress
        noColor
        showLast={4}
        showFirst={5}
        sizeAvatar={24}
        address={`${address}`}
        className="text-black-0 font-medium text-sm leading-5"
      />
    </div>
    <div>
      <div>
        <div className="flex justify-end items-center gap-1">
          <TokenImage className="h-4 w-4" tokenAddress={token && token.tokenAddress} />
          <p className="font-semibold text-sm leading-4 text-black-0">
            {formatNumber(totalAmount)} {symbol}
          </p>
        </div>

        <div className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
          ~ {token && formatNumber(pastPrice, { maximumFractionDigits: 6 })} USD
          <img data-tip data-for={`recipient_detail_${index}_${hash}`} src="/svg/Info.svg" alt="Info" />
        </div>
      </div>
    </div>
    {currentPrice && (
      <ReactTooltip
        id={`recipient_detail_${index}_${hash}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        className="!opacity-100 !rounded-lg"
        place="left"
      >
        {token ? <PriceTooltip price={currentPrice} /> : 'Unable to fetch price.'}
      </ReactTooltip>
    )}
  </div>
)

const RecipientItem = ({
  address,
  tokenAdd,
  transaction,
  token
}: {
  address: string
  tokenAdd: string
  token: any
  transaction: IMetamaskTransaction
}) => (
  <div className="flex justify-between items-center h-[52px] py-[14px] px-4 bg-[#FFFFFF] ">
    <div className="flex items-center gap-5">
      <WalletAddress
        noColor
        showLast={4}
        showFirst={5}
        sizeAvatar={24}
        address={`${address}`}
        className="text-black-0 font-medium text-sm leading-5"
      />
    </div>
    <div>
      <div>
        <div className="flex justify-end items-center gap-1">
          {token ? (
            <TokenImage className="h-4 w-4" tokenAddress={tokenAdd} />
          ) : (
            <TokenCircle className="h-4 w-4" symbol={transaction && transaction.symbol} />
          )}

          <p className="font-semibold text-sm leading-4 text-black-0">
            {formatNumber(transaction.totalAmount)} {transaction.symbol}
          </p>
        </div>

        <div className="text-grey-50 text-sm text-medium flex justify-end gap-1 items-center">
          ~ {token && formatNumber(transaction.totalPastPriceUSD, { maximumFractionDigits: 6 })} USD
          <img data-tip data-for={`recipientItem_${address}_${transaction.hash}`} src="/svg/Info.svg" alt="Info" />
        </div>
      </div>
    </div>
    <ReactTooltip
      id={`recipientItem_${address}_${transaction.hash}`}
      borderColor="#eaeaec"
      border
      backgroundColor="white"
      textColor="#111111"
      effect="solid"
      className="!opacity-100 !rounded-lg"
      place="left"
    >
      {token ? <PriceTooltip price={transaction.totalCurrentPriceUSD} /> : 'Unable to fetch price.'}
    </ReactTooltip>
  </div>
)

const MetamaskTransactionDetail: React.FC<ITransactionDetail> = ({
  transaction,
  showModalMetaMask,
  setShowModalMetaMask
}) => {
  const { tokens } = useFreeContext()

  const token = useMemo(
    () =>
      (transaction &&
        tokens.find(
          (tokenItem) =>
            tokenItem.tokenAddress &&
            transaction.tokenAddress &&
            tokenItem.tokenAddress.toLowerCase() === transaction.tokenAddress.toLowerCase()
        )) ||
      (transaction && transaction.tokenAddress === '' && tokens[0]) ||
      null,
    [transaction, tokens]
  )

  return (
    showModalMetaMask && (
      <Modal showModal={showModalMetaMask} setShowModal={setShowModalMetaMask}>
        <div className="w-[770px]">
          <div className="p-8 flex justify-between items-center bg-white rounded-t-[24px] border border-b">
            <h1 className="text-2xl leading-8 text-black-0 font-supply">TRANSFER SUMMARY</h1>
            <button type="button" onClick={() => setShowModalMetaMask(false)}>
              <Image src={Close} alt="close" />
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
                    address={transaction.hash}
                    scanType="txHash"
                    noAvatar
                    noColor
                  />
                </div>
              </div>
              <div className="flex justify-start gap-16">
                <div>
                  <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Nonce</h1>
                  <p className="font-supply text-base leading-5 text-black-0">{transaction.nonce}</p>
                </div>
                <div className="flex justify-end">
                  <div>
                    <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Executed</h1>
                    <p className="font-supply text-base leading-5 text-black-0">
                      {format(new Date(Number(transaction.timeStamp) * 1000), 'dd MMM yyyy, hh:mm a')}
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
                  {transaction.dataDecoded &&
                    transaction.dataDecoded.method &&
                    Object.values(IDisperseMethod).includes(transaction.dataDecoded.method as IDisperseMethod) &&
                    transaction.dataDecoded.inputs &&
                    transaction.dataDecoded.inputs[transaction.dataDecoded.inputs.length - 1] &&
                    transaction.dataDecoded.inputs[transaction.dataDecoded.inputs.length - 1].map(
                      (recipient, index) => (
                        <DiseperseRecipientItem
                          symbol={transaction && transaction.symbol}
                          hash={transaction.hash}
                          key={index}
                          address={recipient.address}
                          currentPrice={recipient.currentPrice}
                          index={index}
                          pastPrice={recipient.pastPrice}
                          token={token}
                          totalAmount={recipient.totalAmount}
                        />
                      )
                    )}
                  {transaction.value !== '0' && transaction.input === '0x' && (
                    <RecipientItem token={token} address={transaction.to} tokenAdd="" transaction={transaction} />
                  )}
                </div>
                <div className="flex justify-end pt-6">
                  <div>
                    <div className="text-right mr-3 text-sm leading-4 font-semibold flex gap-1 items-center">
                      Total: {token && formatNumber(transaction.totalPastPriceUSD, { maximumFractionDigits: 6 })} USD
                      <img
                        data-tip
                        data-for={`detail_total_${transaction.nonce}_${transaction.hash}`}
                        src="/svg/Info.svg"
                        alt="Info"
                      />
                    </div>
                  </div>
                  {transaction && typeof transaction.totalCurrentPriceUSD !== 'undefined' && (
                    <ReactTooltip
                      id={`detail_total_${transaction.nonce}_${transaction.hash}`}
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      className="!opacity-100 !rounded-lg"
                      place="left"
                    >
                      {token ? <PriceTooltip price={transaction.totalCurrentPriceUSD} /> : 'Unable to fetch price.'}
                    </ReactTooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-8 flex justify-end items-center bg-white rounded-b-[24px] border-t border-[#EBEDEF] ">
            <button
              className="bg-grey-900 hover:bg-grey-901 font-semibold font-inter text-white w-full py-4 leading-6 text-base rounded-lg"
              type="button"
              onClick={() => setShowModalMetaMask(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    )
  )
}
export default MetamaskTransactionDetail
