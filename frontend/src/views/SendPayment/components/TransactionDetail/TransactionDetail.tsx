/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
import { SafeInfoResponse, SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import Modal from '@/components/Modal'
import { OwnerConfirmedLabel, OwnerPendingLabel } from '@/components/Label/Label'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import Close from '@/assets/svg/Close.svg'
import TabItem from '../FreeTabsComponent/TabItem'
import { detailTabs } from './data'
import Tabs from '../FreeTabsComponent/Tabs'
import TokenImage from '@/components/TokenImage/TokenImage'
import { formatNumber } from '@/utils/formatNumber'
import PriceTooltip from '../PriceTooltip/PriceTooltip'
import useFreeContext from '@/hooks/useFreeContext'
import TokenCircle from '@/components/TokenCircle/TokenCircle'

interface ITransactionDetail {
  price: any
  showModal: boolean
  source: SafeInfoResponse
  setShowModal: (showModal: boolean) => void
  transaction: SafeMultisigTransactionResponse | any
}

const RecipientItem = ({
  address,
  transaction,
  token,
  pastPrice,
  currentPrice,
  amount,
  tokenSymbol,
  index = 0,
  networkConfig
}: {
  transaction: any
  address: string
  token: any
  index?: any
  amount: number
  pastPrice?: number
  currentPrice: number
  tokenSymbol?: string
  networkConfig: any
}) => (
  <div
    className={`flex justify-between items-center h-[52px] py-[14px] px-4 ${
      index % 2 !== 0 ? 'bg-[#F8F9FA]' : 'bg-[#FFFFFF]'
    }`}
  >
    <div className="flex items-center gap-5">
      <WalletAddress
        sizeAvatar={24}
        showFirst={5}
        showLast={4}
        address={address}
        noColor
        className="text-black-0 font-medium text-sm leading-5"
      />
    </div>
    <div>
      {transaction &&
        !transaction.isRejectedTransaction &&
        (transaction.executionDate ? (
          <div className="font-medium text-sm flex justify-end text-right   text-grey-50 mt-1">
            <div>
              <div className="flex justify-end items-center leading-3 gap-1 mb-1">
                {token ? (
                  <TokenImage className="h-4 w-4" tokenAddress={token && token.tokenAddress} />
                ) : (
                  <TokenCircle className="h-4 w-4" symbol={tokenSymbol} />
                )}
                <p className="font-semibold text-sm leading-4 text-black-0">
                  {formatNumber(amount, { useGrouping: true })} {tokenSymbol || networkConfig.nativeToken}
                </p>
              </div>
              <div className="flex gap-1 items-center justify-end">
                ~
                {token &&
                  (pastPrice
                    ? formatNumber(pastPrice, { useGrouping: true, maximumFractionDigits: 6 })
                    : formatNumber(currentPrice, {
                        useGrouping: true,
                        maximumFractionDigits: 6
                      }))}{' '}
                USD
                <img
                  data-tip
                  data-for={`transaction_detail_${index}_${transaction.nonce}_${transaction.safeTxHash}`}
                  src="/svg/Info.svg"
                  alt="Info"
                />
              </div>
              <ReactTooltip
                id={`transaction_detail_${index}_${transaction.nonce}_${transaction.safeTxHash}`}
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
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-end items-center gap-1">
              {token ? (
                <TokenImage className="h-4 w-4" tokenAddress={token.tokenAddress} />
              ) : (
                <TokenCircle className="h-4 w-4" symbol={transaction && transaction.symbol} />
              )}
              <div className="font-semibold text-sm leading-4 text-black-0 ">
                {formatNumber(amount)} {transaction.symbol || networkConfig.nativeToken}
              </div>
            </div>
            <div className="font-medium text-sm leading-3 flex justify-end text-right items-end gap-1 text-grey-50 mt-1">
              ~{' '}
              {token &&
                formatNumber(currentPrice, {
                  useGrouping: true,
                  maximumFractionDigits: 6
                })}{' '}
              USD
              {!token ? (
                <>
                  <img
                    data-tip
                    data-for={`transaction_detail_${index}_${transaction.nonce}_${transaction.safeTxHash}`}
                    src="/svg/Info.svg"
                    alt="Info"
                  />
                  <ReactTooltip
                    id={`transaction_detail_${index}_${transaction.nonce}_${transaction.safeTxHash}`}
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
                </>
              ) : (
                ''
              )}
            </div>
          </div>
        ))}
    </div>
  </div>
)

const SignerItem = ({ address, label, index }: { address: string; label: any; index?: number | 0 }) => (
  <div
    className={`flex justify-between items-center h-[52px] py-[14px] px-4 ${
      index % 2 !== 0 ? 'bg-[#F8F9FA]' : 'bg-[#FFFFFF]'
    }`}
  >
    <div className="flex items-center gap-5">
      <WalletAddress
        sizeAvatar={24}
        showFirst={5}
        showLast={4}
        address={address}
        noColor
        className="text-black-0 font-medium text-sm leading-5"
      />
    </div>
    <div>{label}</div>
  </div>
)

const TransactionDetail: React.FC<ITransactionDetail> = ({ transaction, showModal, setShowModal, source, price }) => {
  const [activeTab, setActiveTab] = useState<string>('Recipients')
  const { tokens, networkConfig } = useFreeContext()

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

  useEffect(() => {
    if (showModal) setActiveTab('Recipients')
  }, [showModal])

  return (
    showModal && (
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className="w-[700px]">
          <div className="p-8 flex justify-between items-center bg-white rounded-t-[24px] border border-b">
            <h1 className="text-2xl leading-8 text-black-0 font-supply">TRANSFER SUMMARY</h1>
            <button type="button" onClick={() => setShowModal(false)}>
              <Image src={Close} alt="close" />
            </button>
          </div>
          <div className="p-6 bg-white font-inter text-gray-700 max-h-reviewModal overflow-auto scrollbar">
            <div className="border-b border-[#EBEDEF] pb-8">
              <div>
                <h1 className="flex font-medium text-sm leading-4 text-black-0  ">
                  {transaction && (transaction.hash || transaction.transactionHash)
                    ? 'Transaction Hash'
                    : 'Safe Transaction Hash'}
                </h1>
                <div className="flex items-center text-base leading-5 font-supply text-black-0">
                  {transaction.transactionHash ? (
                    <WalletAddress
                      showLast={4}
                      showFirst={5}
                      scanType="txHash"
                      address={transaction.transactionHash}
                      noAvatar
                      noColor
                    />
                  ) : transaction.hash ? (
                    <WalletAddress
                      showLast={4}
                      showFirst={5}
                      scanType="txHash"
                      address={transaction.hash}
                      noAvatar
                      noColor
                    />
                  ) : (
                    <WalletAddress
                      showLast={4}
                      showFirst={5}
                      address={transaction.safeTxHash}
                      noCopy
                      noScan
                      noAvatar
                      noColor
                    />
                  )}
                </div>
              </div>
              {transaction && transaction.executionDate ? (
                <div className="flex justify-between ">
                  <div>
                    <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Nonce</h1>
                    <p className="font-supply text-base leading-5 text-black-0">{transaction.nonce}</p>
                  </div>
                  <div className="flex ">
                    <div>
                      <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Created</h1>
                      <p className="font-supply text-base leading-5 text-black-0">
                        {format(new Date(transaction.submissionDate), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex ">
                    <div>
                      <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Executed</h1>
                      <p className="font-supply text-base leading-5 text-black-0">
                        {format(new Date(transaction.executionDate), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : transaction.time ? (
                <div className="flex justify-between ">
                  <div>
                    <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Nonce</h1>
                    <p className="font-supply text-base leading-5 text-black-0">{transaction.nonce}</p>
                  </div>
                  <div className="flex ">
                    <div>
                      <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Created</h1>
                      <p className="font-supply text-base leading-5 text-black-0">
                        {format(new Date(transaction.submissionDate), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex ">
                    <div>
                      <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Executed</h1>
                      <p className="font-supply text-base leading-5 text-black-0">
                        {format(new Date(transaction.time * 1000), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start gap-16">
                  <div>
                    <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Nonce</h1>
                    <p className="font-supply text-base leading-5 text-black-0">{transaction.nonce}</p>
                  </div>
                  <div className="flex justify-end">
                    <div>
                      <h1 className="font-medium mt-8 text-sm leading-4 text-black-0">Created</h1>
                      <p className="font-supply text-base leading-5 text-black-0">
                        {format(new Date(transaction.submissionDate), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Tabs
                noBorder
                tabsWrapperClass="py-8 px-0 h-[105px]"
                className="px-0"
                tabs={detailTabs}
                active={activeTab}
                setActive={setActiveTab}
              >
                <TabItem key={detailTabs[0].key}>
                  <div>
                    <div className="bg-[#F8F9FA] rounded-t-md flex text-sm leading-4 text-[#727B84] justify-between items-center pl-4 pr-6 py-4 border border-[#EBEDEF] border-b-0">
                      <div className="flex">
                        <p className="w-12">No.</p>
                        <p>Wallet address</p>
                      </div>
                      {transaction && !transaction.isRejectedTransaction && <p>Amount</p>}
                    </div>
                    <div className="max-h-[210px] overflow-auto scrollbar rounded-b-md border border-[#EBEDEF]">
                      {transaction &&
                        transaction.recipients &&
                        transaction.recipients.map((recipient, recipientIndex) => (
                          <RecipientItem
                            networkConfig={networkConfig}
                            key={recipientIndex}
                            transaction={transaction}
                            amount={recipient.amount}
                            address={recipient.address}
                            token={token}
                            tokenSymbol={transaction.symbol}
                            currentPrice={recipient.currentPrice}
                            pastPrice={recipient && recipient.pastPrice}
                            index={recipientIndex}
                          />
                        ))}
                    </div>
                    {transaction && !transaction.isRejectedTransaction && (
                      <div className="flex justify-end pt-6">
                        {transaction && transaction.executionDate ? (
                          <>
                            <div>
                              <div className="text-right mr-3 text-sm leading-4 font-semibold flex gap-1 items-center">
                                Total: {token && formatNumber(transaction.pastPrice, { maximumFractionDigits: 6 })} USD
                                <img
                                  data-tip
                                  data-for={`detail_${transaction.nonce}_${transaction.safeTxHash}`}
                                  src="/svg/Info.svg"
                                  alt="Info"
                                />
                              </div>
                            </div>
                            <ReactTooltip
                              id={`detail_${transaction.nonce}_${transaction.safeTxHash}`}
                              borderColor="#eaeaec"
                              border
                              backgroundColor="white"
                              textColor="#111111"
                              effect="solid"
                              className="!opacity-100 !rounded-lg"
                              place="left"
                            >
                              {token ? <PriceTooltip price={transaction.currentPrice} /> : 'Unable to fetch price.'}
                            </ReactTooltip>
                          </>
                        ) : (
                          <div className="text-right mr-3 text-sm leading-4 font-semibold mt-2 ">
                            Total: {token && formatNumber(transaction.currentPrice, { maximumFractionDigits: 6 })} USD
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabItem>
                <TabItem key={detailTabs[1].key}>
                  <div>
                    <div className="bg-[#F8F9FA] rounded-t-md flex text-sm leading-4 text-[#727B84] justify-between items-center pl-4 pr-6 py-4 border border-[#EBEDEF] border-b-0">
                      <div className="flex">
                        <p className="w-12">No.</p>
                        <p>Wallet address</p>
                      </div>
                      <p>Status</p>
                    </div>
                    <div className="max-h-[210px] overflow-auto scrollbar rounded-b-md border border-[#EBEDEF]">
                      {source.owners.map((owner, index) => (
                        <SignerItem
                          key={index}
                          address={owner}
                          label={
                            transaction.confirmations.find((item) => item.owner === owner) ? (
                              <OwnerConfirmedLabel />
                            ) : (
                              <OwnerPendingLabel />
                            )
                          }
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                </TabItem>
              </Tabs>
            </div>
          </div>
          <div className="px-6 py-8 flex justify-end items-center bg-white rounded-b-[24px] border-t border-[#EBEDEF] ">
            <button
              className="bg-grey-900 font-semibold font-inter text-white w-full hover:bg-grey-901 py-4 leading-6 text-base rounded-lg"
              type="button"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    )
  )
}
export default TransactionDetail
