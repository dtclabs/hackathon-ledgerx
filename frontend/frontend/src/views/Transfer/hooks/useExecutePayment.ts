/* eslint-disable no-promise-executor-return */
/* eslint-disable no-else-return */
/* eslint-disable guard-for-in */
import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'

import { Result } from '@/shared/types'
import {
  ITokenNotFound,
  IWalletActionRejected,
  WalletActionRejected,
  TokenNotFoundError,
  INoWalletFound
} from '@/shared/error-types'
import { parseUnits } from 'ethers/lib/utils'
import { toChecksumAddress } from 'ethereumjs-util'
import { sumStringAndDecimalArray } from '@/utils-v2/math.utils'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { ISource, SourceType } from '@/slice/wallets/wallet-types'
import { useSyncPendingTransactionsMutation } from '@/slice/wallets/wallet-api'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { IRecipientItemForm } from '../Transfer.types'
import { CurrencyType } from '@/api-v2/payment-api'

import { useAppSelector } from '@/state'
import usePaymentHandler from './usePaymentHandler'
import { useSafeSdk } from '@/hooks-v2/web3Hooks/useSafeSdk'
import { useSafeClient } from '@/hooks-v2/web3Hooks/useSafeClient'
import useErc20Contract from '@/hooks-v2/web3Hooks/useERC20Contract'
import useDisperseContract from '@/hooks-v2/web3Hooks/useDisperseContract'

import {
  selectVerifiedCryptocurrencyIdMap,
  selectSelectedChainCryptocurrencyAddressMap,
  selectVerifiedCryptocurrencyMap
} from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectIsEoaTransfer } from '@/slice/transfer/transfer.selectors'
import { USDT_ABI } from '@/constants-v2/abi/usdt20.abi'
import { isEmpty } from 'lodash'

interface IHandlePreTransactionValidation {
  sourceWalletId: any
  recipients: any
  remarks: string
  destinationCurrencyType?: CurrencyType
}

type ExecutePaymentErrors = ITokenNotFound | IWalletActionRejected | INoWalletFound

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const useExecutePayment = () => {
  const { account } = useWeb3React()
  const organizationId = useOrganizationId()
  const [isExecuting, setIsExecuting] = useState(false)
  const isEoaTransfer = useAppSelector(selectIsEoaTransfer)
  const selectedChainCryptocurrencies = useAppSelector(selectSelectedChainCryptocurrencyAddressMap)
  const walletMap = useAppSelector(selectWalletMapById)
  const selectedChain = useAppSelector(selectedChainSelector)
  const cryptocurrencyMap = useAppSelector(selectVerifiedCryptocurrencyIdMap)
  const verifiedCryptocurrencyMap = useAppSelector(selectVerifiedCryptocurrencyMap)
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [syncPendingTrigger] = useSyncPendingTransactionsMutation()
  const { prepareDataForPreExecute, postExecutedStatus, postFailedStatus, sendDraftAnalysisData, sendPostAnalysis } =
    usePaymentHandler()
  const { getSafeInfo, getNextNonce, proposeTransaction, confirmTransaction } = useSafeClient({
    rpcUrl: selectedChain?.rpcUrl,
    safeUrl: selectedChain?.safeUrl
  })

  const { reinitializeSafeService, createTransaction, getTransactionHash, executeTransaction, signTransactionHash } =
    useSafeSdk()

  const { setContract: setErc20Contract, getContractWithSigner } = useErc20Contract()

  const {
    setContract: setDisperseContract,
    executeBatchTokenTransfer,
    executeNativeCoinTransfer
  } = useDisperseContract()

  const executePayment = async ({
    recipients,
    sourceWalletId,
    remarks,
    destinationCurrencyType = CurrencyType.CRYPTO
  }: IHandlePreTransactionValidation): Promise<Result<string, ExecutePaymentErrors>> => {
    try {
      const wallet = walletMap[sourceWalletId]

      if (!wallet) {
        return {
          isSuccess: false,
          error: {
            type: 'NoWalletFound',
            sourceId: sourceWalletId
          }
        }
      }
      if (wallet.sourceType === SourceType.ETH) {
        if (isEoaTransfer) {
          await handleEoaTransfer({ recipients, sourceWalletId, remarks, destinationCurrencyType })
        } else {
          await handleDisperseTransaction({ recipients, sourceWalletId, remarks, destinationCurrencyType })
        }
      } else {
        await reinitializeSafeService({ rpcUrl: selectedChain?.rpcUrl, safeAddress: wallet.address })
        await handleSafeTransaction({
          recipients,
          safe: wallet,
          sourceWalletId: wallet.id,
          remarks,
          destinationCurrencyType
        })
        await sleep(1500)
        await syncPendingTrigger({ organisationId: organizationId }).unwrap()
        await sleep(2500)
      }
      return { isSuccess: true, data: 'txHash' }
    } catch (_err) {
      if (_err instanceof WalletActionRejected) {
        return {
          isSuccess: false,
          error: {
            type: 'WalletActionRejected',
            message: 'User rejected the transaction', // Todo - Make message optional and add default in Class
            systemMessage: sourceWalletId
          }
        }
      }
      return {
        isSuccess: false,
        error: {
          type: 'TokenNotFound',
          tokenId: '_err'
        }
      }
    }
  }

  const handleEoaTransfer = async ({
    recipients,
    sourceWalletId,
    remarks,
    destinationCurrencyType
  }: {
    recipients: IRecipientItemForm[]
    sourceWalletId: string
    remarks: string
    destinationCurrencyType: CurrencyType
  }) => {
    const recipient = recipients[0]

    const mappedToken =
      destinationCurrencyType === CurrencyType.FIAT
        ? verifiedCryptocurrencyMap[recipient?.sourceCurrency?.symbol?.toLowerCase()]
        : cryptocurrencyMap[recipient?.tokenId]

    // Todo - Update error
    if (isEmpty(mappedToken)) throw new TokenNotFoundError('Token not found', recipient?.tokenId)
    const token = getTokenChainsInfo({ token: mappedToken })

    const erc20Contract = await getContractWithSigner({ tokenAddress: token.address, erc20Abi: USDT_ABI })
    const balance = await erc20Contract.balanceOf(account)

    const amounts = recipients?.map((_recipient) =>
      destinationCurrencyType === CurrencyType.FIAT ? _recipient.sourceAmount : _recipient.amount
    )

    const totalAmountToSend = sumStringAndDecimalArray(amounts)

    try {
      const parsedTotalAmount = ethers.utils.parseUnits(totalAmountToSend.toString(), 6)
      const result = await erc20Contract.transfer(recipient.walletAddress, parsedTotalAmount)

      await prepareDataForPreExecute({
        recipients,
        sourceWalletId,
        remarks,
        proposedTransactionHash: result?.hash ?? null
      })
      await result.wait()
      await postExecutedStatus({ txHash: result.hash })
      await sendPostAnalysis({
        txHash: result.transactionHash,
        recipients,
        tokenPrice: 0, // TODO - Get token price
        type: 'eoa_wallet',
        sourceType: 'eoa_wallet',
        sourceAddress: sourceWalletId,
        sourceWalletId
      })
    } catch (err) {
      await postFailedStatus()
      throw err
    }
  }

  const handleDisperseTransaction = async ({
    recipients,
    sourceWalletId,
    remarks,
    destinationCurrencyType
  }: {
    recipients: IRecipientItemForm[]
    sourceWalletId: string
    remarks: string
    destinationCurrencyType: CurrencyType
  }): Promise<void> => {
    const recipient = recipients[0] // All tokens will be the same on EOA transfer

    const mappedToken =
      destinationCurrencyType === CurrencyType.FIAT
        ? verifiedCryptocurrencyMap[recipient?.sourceCurrency?.symbol?.toLowerCase()]
        : cryptocurrencyMap[recipient?.tokenId]

    // Todo - Update error
    if (!mappedToken) throw new TokenNotFoundError('Token not found', recipient?.tokenId)

    await setDisperseContract({ chainName: selectedChain?.id })

    const token = getTokenChainsInfo({ token: mappedToken })
    const amounts = recipients?.map((_recipient) =>
      destinationCurrencyType === CurrencyType.FIAT ? _recipient.sourceAmount : _recipient.amount
    )

    const recipientAddresses = recipients?.map((_recipient) => _recipient.walletAddress)
    const totalAmountToSend = sumStringAndDecimalArray(amounts)

    if (token.type === 'Coin') {
      try {
        if (destinationCurrencyType === CurrencyType.FIAT) {
          const preExecuteResult = await prepareDataForPreExecute({
            recipients,
            sourceWalletId,
            remarks,
            proposedTransactionHash: '0x'
          })

          if (preExecuteResult) {
            const result = await executeNativeCoinTransfer({
              payableAmount: String(totalAmountToSend),
              amounts,
              recipients: recipientAddresses,
              meta: {
                decimals: token.decimal
              }
            })

            await result.wait()
            await postExecutedStatus({ txHash: result.transactionHash })
            await sendPostAnalysis({
              txHash: result.transactionHash,
              recipients,
              tokenPrice: 0, // TODO - Get token price
              type: 'disperse',
              sourceType: 'eoa_wallet',
              sourceAddress: sourceWalletId,
              sourceWalletId
            })
          } else {
            throw new Error('Payment status is not in the correct state to execute the transaction.')
          }
        } else {
          const result = await executeNativeCoinTransfer({
            payableAmount: String(totalAmountToSend),
            amounts,
            recipients: recipientAddresses,
            meta: {
              decimals: token.decimal
            }
          })

          await prepareDataForPreExecute({
            recipients,
            sourceWalletId,
            remarks,
            proposedTransactionHash: result?.transactionHash ?? null
          })
          await result.wait()
          await postExecutedStatus({ txHash: result.transactionHash })
          await sendPostAnalysis({
            txHash: result.transactionHash,
            recipients,
            tokenPrice: 0, // TODO - Get token price
            type: 'disperse',
            sourceType: 'eoa_wallet',
            sourceAddress: sourceWalletId,
            sourceWalletId
          })
        }
      } catch (err) {
        await postFailedStatus()
        throw err
      }
    } else {
      try {
        const result = await executeBatchTokenTransfer({
          tokenAddress: token.address,
          payableAmount: String(totalAmountToSend),
          amounts,
          recipients: recipientAddresses,
          meta: {
            decimals: token.decimal
          }
        })
        await prepareDataForPreExecute({
          recipients,
          sourceWalletId,
          remarks,
          proposedTransactionHash: result?.transactionHash ?? null
        })
        await result.wait()
        await postExecutedStatus({ txHash: result.transactionHash })

        triggerSendAnalysis({
          eventType: 'PAYMENT_EXECUTION_PAYLOAD',
          metadata: {
            type: 'disperse',
            raw: recipients,
            encoded: {
              amounts,
              recipients: recipientAddresses,
              decimals: token.decimal,
              payableAmount: String(totalAmountToSend)
            }
          }
        })
        await sendPostAnalysis({
          txHash: result.transactionHash,
          recipients,
          tokenPrice: 0, // TODO - Get token price
          type: 'disperse',
          sourceType: 'eoa_wallet',
          sourceAddress: sourceWalletId,
          sourceWalletId
        })
      } catch (err) {
        await postFailedStatus()
        throw err
      }
    }
  }

  const handleSafeTransaction = async ({
    recipients,
    safe,
    sourceWalletId,
    remarks,
    destinationCurrencyType
  }: {
    sourceWalletId: any
    recipients: IRecipientItemForm[]
    remarks: string
    safe: ISource
    destinationCurrencyType: CurrencyType
  }): Promise<void> => {
    const recipientTransfersTokenIdMap = recipients.reduce((acc, recipient) => {
      const tokenId =
        destinationCurrencyType === CurrencyType.FIAT
          ? verifiedCryptocurrencyMap[recipient?.sourceCurrency?.symbol?.toLowerCase()]?.publicId
          : recipient.tokenId

      if (acc[tokenId]) {
        acc[tokenId].push(recipient)
      } else {
        acc[tokenId] = [recipient]
      }
      return acc
    }, {})

    const parsedDataForAnalysis = []
    const encodedTransactions = []
    // Iterate over each key-value pair in the object
    for (const tokenId in recipientTransfersTokenIdMap) {
      const token = selectedChainCryptocurrencies[tokenId]
      // Process the array for each key
      const array = recipientTransfersTokenIdMap[tokenId]
      if (token.type === 'Token') {
        const contract2 = await setErc20Contract({ tokenAddress: token.address })
        for (const item of array) {
          const decimals = await contract2.decimals()
          const _amount = destinationCurrencyType === CurrencyType.FIAT ? item.sourceAmount : item.amount

          if (parseInt(decimals) !== parseInt(token?.decimal)) {
            throw new Error('Decimals mismatch')
          }
          const encodeData = contract2.interface.encodeFunctionData('transfer', [
            item.walletAddress,
            parseUnits(_amount, decimals).toString()
          ])

          encodedTransactions.push({
            to: toChecksumAddress(token?.address),
            data: encodeData,
            value: '0'
          })

          parsedDataForAnalysis.push({
            rawAmount: _amount,
            parsedAmount: parseUnits(_amount, decimals).toString(),
            recipient: item.walletAddress,
            tokenId,
            chartOfAccountId: item.chartOfAccountId
          })
        }
      } else {
        for (const item of array) {
          const _amount = destinationCurrencyType === CurrencyType.FIAT ? item.sourceAmount : item.amount
          encodedTransactions.push({
            to: toChecksumAddress(item.walletAddress),
            data: '0x',
            value: parseUnits(_amount).toString()
          })

          parsedDataForAnalysis.push({
            rawAmount: _amount,
            parsedAmount: parseUnits(_amount).toString(),
            recipient: item.walletAddress,
            tokenId,
            chartOfAccountId: item.chartOfAccountId
          })
        }
      }
    }

    const nextNonce = await getNextNonce({ address: safe.address })

    const safeTransaction = await createTransaction({
      transactionData: encodedTransactions,
      options: { nonce: nextNonce } // To Add into queue
    })
    const txHash = await getTransactionHash(safeTransaction)
    const safeInfo = await getSafeInfo({ address: safe.address })

    if (safeInfo.threshold === 1) {
      // Execute transaction
      try {
        await prepareDataForPreExecute({
          recipients,
          sourceWalletId,
          remarks,
          proposedTransactionHash: txHash
        })

        const transactionExecuted = await executeTransaction({ safeTransaction })
        await transactionExecuted.transactionResponse.wait()

        await postExecutedStatus({ txHash: transactionExecuted.hash })
      } catch (err) {
        await postFailedStatus()
        throw err
      }
    } else {
      // Queue Transacton
      try {
        await prepareDataForPreExecute({
          recipients,
          sourceWalletId,
          remarks,
          proposedTransactionHash: txHash
        })
        const signature = await signTransactionHash({ hash: txHash })
        safeTransaction.addSignature(signature)

        const transactionConfig = {
          safeAddress: safe.address,
          safeTransactionData: safeTransaction.data,
          safeTxHash: txHash,
          senderAddress: account,
          senderSignature: signature.data
        }

        await proposeTransaction(transactionConfig)
        await confirmTransaction({ safeTxHash: txHash, signature: signature.data })
        triggerSendAnalysis({
          eventType: 'PAYMENT_EXECUTION_PAYLOAD',
          metadata: {
            type: 'safe',
            raw: recipients,
            encoded: parsedDataForAnalysis
          }
        })
        await postExecutedStatus({ safeHash: txHash })
      } catch (_err) {
        await postFailedStatus()
        throw _err
      }
    }
  }

  const getTokenChainsInfo = ({ token }) => {
    const tokenAddressBasedOnChain = token?.addresses?.find((address) => address.blockchainId === selectedChain?.id)
    if (!tokenAddressBasedOnChain) throw new Error('Token address not found for selected network')

    return tokenAddressBasedOnChain
  }

  return { executePayment, isExecuting }
}

export default useExecutePayment
