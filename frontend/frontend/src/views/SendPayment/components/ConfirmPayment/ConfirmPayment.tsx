/* eslint-disable dot-notation */
import warning from '@/assets/svg/warning.svg'
import { Button } from '@/components-v2'
import { Divider } from '@/components-v2/Divider'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import Loader from '@/components/Loader/Loader'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import useFreeContext from '@/hooks/useFreeContext'
import { useNetWork } from '@/hooks/useNetwork'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import Cancel from '@/public/svg/Cancel.svg'
import Success from '@/public/svg/Success.svg'
import { getErc20Contract } from '@/utils/contractHelpers'
import { logEvent } from '@/utils/logEvent'
import { getImplementationAddress } from '@/utils/proxy'
import { triggerHotjarEvent } from '@/utils/triggerHotjarEvent'
import Safe from '@gnosis.pm/safe-core-sdk'
import { MetaTransactionData, TransactionResult } from '@gnosis.pm/safe-core-sdk-types'
import { useWeb3React } from '@web3-react/core'
import { useAppSelector } from '@/state'
import { selectChainByNameMap } from '@/slice/chains/chain-selectors'
import { ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import ThankCard from '../ThankCard/ThankCard'
import { usePaymentLinkMetaMutation } from '@/api-v2/payment-link-api'
import { PROVIDER_MAP } from '@/components-v2/ContactDropdownPaymentLink/ContactDropdownPaymentlink'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import useSwitchNetwork from '@/hooks-v2/web3Hooks/useSwitchNetwork'

const metamaskErrorHandler = (_error) => {
  let message = ''
  if (_error.code === 'ACTION_REJECTED' && String(_error).includes('user rejected transaction')) {
    message = 'You have rejected the transaction'
  } else if (
    _error.code === 'UNPREDICTABLE_GAS_LIMIT' &&
    _error?.error?.message.includes('transfer amount exceeds balance')
  ) {
    return 'You have insufficient funds for this transaction'
  } else if (_error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Unpredictable Gas Limit'
  } else {
    return 'Sorry, an error has occured'
  }

  return message
}

interface IConfirmPayment {
  sourceAddress: string
  tokenAddress: string
  usdPrice: string
  organizationName: string
  nameNetwork: string
  setStep: React.Dispatch<React.SetStateAction<number>>
  sourceList: string[]
  setLoading: any
  setIsCancel: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
  isCancel: boolean
  step: number
  safe: Safe
  fetchData: () => Promise<void>
  approveToken: () => Promise<void>
  allowance: boolean
  tokenImage: any
  approving: boolean
  isGenericLink?: boolean
  genericLinkAmount?: string
  genericLinkMetaData?: {
    remarks: string
    contactDetails: any
  }
}

interface ITxSuccessParams {
  result: ITxSuccess
  isSuccess: boolean
}

interface ITxSuccess {
  blockHash: string
  blockNumber: string
  from: string
  to: string
  transactionHash: string
}

const ConfirmPayment: React.FC<IConfirmPayment> = ({
  sourceAddress,
  tokenAddress,
  usdPrice,
  organizationName,
  nameNetwork,
  setStep,
  sourceList,
  setLoading,
  setIsCancel,
  isCancel,
  loading,
  step,
  safe,
  fetchData,
  approveToken,
  allowance,
  tokenImage,
  approving,
  isGenericLink,
  genericLinkAmount,
  genericLinkMetaData
}) => {
  const chainMapByName = useAppSelector(selectChainByNameMap)
  const { recipients: importRecipients } = useFreeContext()
  const { switchNetwork } = useSwitchNetwork()

  const safeService = useSafeServiceClient()
  const router = useRouter()
  const { library, chainId } = useWeb3React()
  const { networkConfigs } = useNetWork()
  const [triggerPostPaymentLinkMeta, postPaymentLinkMetaResult] = usePaymentLinkMetaMutation()

  const [transactionHash, setTransactionHash] = useState<any>()
  const [error, setError] = useState<any>()

  const handleBack = () => {
    setStep(2)
  }

  const checkTransaction = (txHash) => {
    const checkTransactionLoop = () =>
      window.ethereum
        .request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        })
        .then((res: any) => {
          if (res !== null) {
            return {
              blockHash: res.blockHash,
              from: res.from,
              to: res.to,
              transactionHash: res.transactionHash,
              isSuccess: true
            }
          }
          return checkTransactionLoop()
        })

    return checkTransactionLoop()
  }

  const handleSendByMetamask = async () => {
    try {
      if (chainId !== 1) {
        const ethereumChain = chainMapByName['ethereum']

        await switchNetwork({
          chainName: ethereumChain.name,
          chainId: ethereumChain?.chainId,
          rpcUrls: [ethereumChain?.rpcUrl]
        })
      }
      const paymentAmount = isGenericLink ? genericLinkAmount.toString() : importRecipients[0].amount[0].toString()

      if (tokenAddress) {
        // send token

        const implementationAddress = await getImplementationAddress(library, tokenAddress)
        const response = await fetch(networkConfigs.contractABIApi(implementationAddress || tokenAddress))
        const contractRes = await response.json()
        if (contractRes && contractRes.result) {
          const ErcContract = getErc20Contract(tokenAddress, library.getSigner())
          const decimals = await ErcContract.decimals()
          const amount = parseUnits(paymentAmount, decimals).toString()
          const signer = library.getSigner()

          if (tokenAddress) {
            const contract = new ethers.Contract(tokenAddress, contractRes.result, signer)
            const tx = await contract.transfer(importRecipients[0].address[0], amount)
            setTransactionHash(tx.hash)
            setStep(4)
            const { isSuccess, ...res } = await checkTransaction(tx.hash)
            // Only send if Payment ID exists
            triggerPostPaymentLinkMeta({
              orgId: String(router.query.organizationId),
              payload: {
                hash: res.transactionHash,
                fromAddress: res.from,
                toAddress: res.to,
                invoice: router.query.remarks ? String(router.query.remarks) : null,
                paymentLinkId: String(router.query.id),
                completedAt: String(new Date().toISOString()),
                cryptocurrencyAmount: paymentAmount,
                cryptocurrencySymbol: importRecipients[0].token[0].toString(),
                fiatValue: String(usdPrice),
                remarks: genericLinkMetaData.remarks,
                contactDetails: genericLinkMetaData.contactDetails.map((contact) => ({
                  type: PROVIDER_MAP[contact.providerId],
                  value: contact.content
                }))
              }
            })

            setLoading(isSuccess)
          }
        }
      } else {
        // send ETH
        const transactionParameter = {
          from: sourceAddress,
          to: importRecipients[0].address[0],
          value: ethers.utils.parseUnits(paymentAmount.toString())
        }
        const signer = library.getSigner()
        const tx = await signer.sendTransaction(transactionParameter)
        setStep(4)
        setTransactionHash(tx.hash)
        const { isSuccess, ...res } = await checkTransaction(tx.hash)
        // Only send if Payment ID exists
        triggerPostPaymentLinkMeta({
          orgId: String(router.query.organizationId),
          payload: {
            hash: res.transactionHash,
            fromAddress: res.from,
            toAddress: res.to,
            invoice: router.query.remarks ? String(router.query.remarks) : null,
            paymentLinkId: String(router.query.id),
            completedAt: String(new Date().toISOString()),
            cryptocurrencyAmount: paymentAmount,
            cryptocurrencySymbol: importRecipients[0].token[0].toString(),
            fiatValue: String(usdPrice),
            remarks: genericLinkMetaData.remarks,
            contactDetails: genericLinkMetaData.contactDetails.map((contact) => ({
              type: PROVIDER_MAP[contact.providerId],
              value: contact.content
            }))
          }
        })
        setLoading(isSuccess)
      }

      logEvent({
        event: 'confirm_transaction',
        payload: {
          event_category: 'Payment app',
          event_label: '',
          value: usdPrice,
          chain: nameNetwork,
          recipients: importRecipients[0].address[0]
        }
      })
    } catch (errorMsg: any) {
      const _error = metamaskErrorHandler(errorMsg)

      setError(_error)
      sentryCaptureException(_error)
      setStep(4)
      setLoading(true)
      setIsCancel(true)
    }
  }

  const handleSendByGnosis = async () => {
    if (safe) {
      let transactionExcuted: TransactionResult
      let transactions: MetaTransactionData
      const paymentAmount = isGenericLink ? genericLinkAmount.toString() : importRecipients[0].amount[0].toString()
      if (tokenAddress) {
        const contract = getErc20Contract(tokenAddress, library.getSigner())
        const decimals = await contract.decimals()
        const encodeData = contract.interface.encodeFunctionData('transfer', [
          importRecipients[0].address[0],
          parseUnits(paymentAmount.replace(/\s/g, ''), decimals).toString()
        ])
        transactions = {
          to: tokenAddress,
          data: encodeData,
          value: '0'
        }
      } else {
        transactions = {
          to: importRecipients[0].address[0],
          data: '0x',
          value: parseEther(paymentAmount.replace(/\s/g, '')).toString()
        }
      }

      try {
        const nonce = await safeService.getNextNonce(sourceAddress)
        if (transactions) {
          const safeTransaction = await safe.createTransaction({
            safeTransactionData: transactions,
            options: { nonce }
          })
          const safeInfo = await safeService.getSafeInfo(sourceAddress)
          if (safeInfo.threshold !== 1) {
            const singedTransaction = await safe.signTransaction(safeTransaction)
            triggerHotjarEvent()
            const safeTxHash = await safe.getTransactionHash(safeTransaction)
            setTransactionHash(safeTxHash)
            const signValue = Array.from(singedTransaction.signatures.values())
            await safeService.proposeTransaction({
              safeAddress: sourceAddress,
              safeTransactionData: singedTransaction.data,
              safeTxHash,
              senderAddress: sourceList && sourceList[0],
              origin,
              senderSignature: signValue[0].data
            })
            await safeService.confirmTransaction(safeTxHash, signValue[0].data)

            logEvent({
              event: 'confirm_transaction',
              payload: {
                event_category: 'Payment app',
                event_label: '',
                value: usdPrice,
                chain: nameNetwork,
                recipients: importRecipients[0].address[0]
              }
            })

            triggerPostPaymentLinkMeta({
              orgId: String(router.query.organizationId),
              payload: {
                hash: safeTxHash,
                fromAddress: sourceAddress,
                toAddress: sourceList && sourceList[0],
                invoice: router.query.remarks ? String(router.query.remarks) : null,
                paymentLinkId: String(router.query.id),
                completedAt: String(new Date().toISOString()),
                cryptocurrencyAmount: paymentAmount,
                cryptocurrencySymbol: importRecipients[0].token[0].toString(),
                fiatValue: String(usdPrice),
                remarks: genericLinkMetaData.remarks,
                contactDetails: genericLinkMetaData.contactDetails.map((contact) => ({
                  type: PROVIDER_MAP[contact.providerId],
                  value: contact.content
                }))
              }
            })
            await fetchData()
          } else {
            transactionExcuted = await safe.executeTransaction(safeTransaction)
            const txHash = transactionExcuted.hash
            setTransactionHash(txHash)
            // dispatch(setResetBalance())
            triggerHotjarEvent()
            triggerPostPaymentLinkMeta({
              orgId: String(router.query.organizationId),
              payload: {
                hash: txHash,
                fromAddress: sourceAddress,
                toAddress: sourceList && sourceList[0],
                invoice: router.query.remarks ? String(router.query.remarks) : null,
                paymentLinkId: String(router.query.id),
                completedAt: String(new Date().toISOString()),
                cryptocurrencyAmount: paymentAmount,
                cryptocurrencySymbol: importRecipients[0].token[0].toString(),
                fiatValue: String(usdPrice),
                remarks: genericLinkMetaData.remarks,
                contactDetails: genericLinkMetaData.contactDetails.map((contact) => ({
                  type: PROVIDER_MAP[contact.providerId],
                  value: contact.content
                }))
              }
            })
          }
        }
        setStep(4)
        setLoading(true)
      } catch (errorMsg: any) {
        setStep(4)
        setLoading(true)
        setIsCancel(true)
        sentryCaptureException(errorMsg)
        // if (
        //   !errorMsg.message.includes('Contract with a Signer cannot override') &&
        //   !errorMsg.message.includes('isExecuted')
        // ) {
        //   setResultStatus(EProcessStatus.REJECTED)
        //   setErrorMsg(errorMsg as string)
        // }
      }
    }
  }

  const handlePay = async () => {
    setLoading(false)
    setIsCancel(false)
    if (sourceList && sourceAddress !== sourceList[0]) {
      await handleSendByGnosis()
    } else {
      await handleSendByMetamask()
    }
  }

  return (
    <div className="w-full p-8">
      {step === 4 && (
        <div className="flex items-center justify-center mb-4">
          {!loading ? (
            <img className="animate-spin" src="/svg/OrangeLoader.svg" alt="loader" />
          ) : isCancel ? (
            <Image src={Cancel} alt="cancel" />
          ) : (
            <Image src={Success} alt="success" />
          )}
        </div>
      )}
      {step === 3 && <div className="text-xl font-semibold leading-7 text-center">Confirm Payment</div>}
      {step === 4 && (
        <>
          <div className="text-xl font-semibold leading-7 text-center">
            {!loading ? 'Payment Pending' : !isCancel ? 'Payment Successful' : 'Payment Failed'}
          </div>
          {isCancel && (
            <div className="text-sm font-inter flex items-center justify-center mt-2 text-[#C61616]">
              <div className="mr-2 flex items-center">
                <Image src={warning} alt="warning" width={16} height={16} />
              </div>
              {error && error}
            </div>
          )}
        </>
      )}
      <div className="border-b my-8" />
      <div className="">
        {step === 3 && importRecipients[0].remark[0] && (
          <div className="flex justify-between pb-4">
            <div className="text-grey-800">Invoice</div>
            <div className="text-neutral-900">{importRecipients[0].remark[0]}</div>
          </div>
        )}
        {transactionHash && (
          <div className="flex justify-between pb-4">
            <div className="text-grey-800">Transaction Hash</div>
            <div>
              <WalletAddress
                address={transactionHash}
                noAvatar
                noColor
                showFirst={5}
                showLast={4}
                scanType="txHash"
                addressClassName="w-[125px]"
                addressWidth="w-[90%]"
              />
            </div>
          </div>
        )}
        <div className="flex justify-between pb-4">
          <div className="text-grey-800">Amount</div>
          <div className="text-sm leading-5 flex items-center gap-2">
            <Image src={tokenImage} width={20} height={20} />
            {isGenericLink
              ? `${parseFloat(genericLinkAmount)} ${importRecipients[0].token}`
              : `${parseFloat(importRecipients[0].amount[0])} ${importRecipients[0].token}`}

            <DividerVertical space="mx-0" />
            <div className="text-sm text-grey-700">{`$${usdPrice} USD`}</div>
          </div>
        </div>
        <div className="flex justify-between pb-4">
          <div className="text-grey-800">From</div>
          <div>
            <WalletAddress
              address={sourceAddress}
              noAvatar
              noColor
              showFirst={5}
              showLast={4}
              addressClassName="w-[125px]"
              addressWidth="w-[90%]"
            />
          </div>
        </div>
        <div className="flex justify-between pb-4">
          <div className="text-grey-800">To</div>
          <div className="flex items-center">
            <div className="text-neutral-900" style={{ whiteSpace: 'nowrap' }}>
              {organizationName}
            </div>
            <DividerVertical space="mx-2" />
            <WalletAddress
              address={importRecipients[0].address[0]}
              noAvatar
              noColor
              showFirst={5}
              showLast={4}
              addressClassName="w-[125px]"
              addressWidth="w-[90%]"
            />
          </div>
        </div>
        <div className="flex justify-between pb-4">
          <div className="text-grey-800 basis-1/5">Remarks</div>
          <div className=" basis-4/5">
            <pre
              className="font-inter text-neutral-900"
              style={{
                textAlign: 'right',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                wordBreak: 'break-all'
              }}
            >
              {genericLinkMetaData.remarks}
            </pre>
          </div>
        </div>
        {step === 3 && (
          <div className="flex justify-between pb-4">
            <div className="text-grey-800">Chain</div>
            <div className="text-neutral-900">{nameNetwork}</div>
          </div>
        )}
        {step === 3 && (
          <div className="flex gap-2">
            <Button color="secondary" size="lg" onClick={handleBack}>
              Back
            </Button>
            {!allowance && sourceList && sourceAddress === sourceList[0] && tokenAddress !== '' ? (
              <Button size="lg" fullWidth onClick={approveToken} loader={approving}>
                Approve {importRecipients[0].token} support for this wallet
              </Button>
            ) : (
              <Button size="lg" fullWidth onClick={handlePay}>
                Pay Now
              </Button>
            )}
          </div>
        )}
        {step === 4 && isCancel && (
          <Button size="lg" fullWidth onClick={handlePay}>
            Try Again
          </Button>
        )}
        {step === 4 && loading && !isCancel && (
          <>
            <Divider />
            <ThankCard
              className="mt-8"
              title="Thank you for using HQ Payment Link!"
              description="Want to streamline your Web3 FinOps? Experience the full version of LedgerX."
            />
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://ledgerx.com"
              className="mt-8 py-4 block w-full font-semibold text-center rounded-[4px] text-base hover:bg-grey-901 text-white bg-grey-900"
            >
              Learn More
            </a>
          </>
        )}
      </div>
    </div>
  )
}
export default ConfirmPayment
