/* eslint-disable lines-between-class-members */
/* eslint-disable prefer-template */
/* eslint-disable guard-for-in */
// Libraries
import { useRef, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'

// Utilities
import { useAppSelector } from '@/state'
import { formatEther } from 'ethers/lib/utils'
import {
  generatePaymentString,
  checkSafeBalanceForTransfer,
  createSafeBalanceAddressMap,
  createRecipientAmountAddressMap
} from '../utilities'

// Types
import { Result } from '@/shared/types'
import {
  InsufficientFunds,
  InsufficientApprovalAmount,
  TokenNotFoundError,
  NoWalletFound,
  GenericError,
  IGenericError,
  ITokenNotFound,
  INoWalletFound,
  IInsufficientFunds,
  IInsufficientApprovalAmount
} from '@/shared/error-types'
import { SourceType } from '@/slice/wallets/wallet-types'
import { IRecipientItemForm } from '../Transfer.types'
import {
  ICryptocurrencyType,
  ICryptocurrency,
  IChainCryptocurrency
} from '@/slice/cryptocurrencies/cryptocurrency.types'

// Selectors
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { DISPERSE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'
import {
  selectVerifiedCryptocurrencyIdMap,
  selectSelectedChainCryptocurrencyAddressMap,
  selectedChainNativeToken,
  selectVerifiedCryptocurrencyAddressMap,
  selectVerifiedCryptocurrencyMap
} from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectIsEoaTransfer } from '@/slice/transfer/transfer.selectors'

// Hooks
import { useSafeClient } from '@/hooks-v2/web3Hooks/useSafeClient'
import useErc20Contract from '@/hooks-v2/web3Hooks/useERC20Contract'
import useDisperseContract from '@/hooks-v2/web3Hooks/useDisperseContract'
import { CurrencyType } from '@/api-v2/payment-api'

const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
]
interface IHandlePreTransactionValidation {
  sourceWalletId: string
  recipients: IRecipientItemForm[]
  destinationCurrencyType?: CurrencyType
}

type PreTransactionValidationErrors =
  | IGenericError
  | ITokenNotFound
  | INoWalletFound
  | IInsufficientFunds
  | IInsufficientApprovalAmount
  | IGenericError

type HandleDispersePrevalidationErrors = ITokenNotFound

const usePreTransactionValidation = () => {
  const { account, library } = useWeb3React()

  const [isValidating, setIsValidating] = useState(null)
  //   const insufficientBalancesError = useRef<string | null>(null)
  const currentPaymentTotal = useRef(null)
  const currentErc20TokenBalance = useRef(null)
  const errorMessageRef = useRef<string | null>(null)

  // Selectors
  const walletMap = useAppSelector(selectWalletMapById)
  const selectedChain = useAppSelector(selectedChainSelector)
  const nativeToken = useAppSelector(selectedChainNativeToken)
  const cryptocurrencyMap = useAppSelector(selectVerifiedCryptocurrencyIdMap)
  const cryptocurrencyAddressMap = useAppSelector(selectVerifiedCryptocurrencyAddressMap)
  const selectedChainCryptocurrencies = useAppSelector(selectSelectedChainCryptocurrencyAddressMap)
  const verifiedCryptocurrencies: any = useAppSelector(selectVerifiedCryptocurrencyMap)
  const isEoaTransfer = useAppSelector(selectIsEoaTransfer)

  // Utility Hooks
  const { setContract: setDisperseContract, estimateNativeCoinTransferGas } = useDisperseContract()
  const {
    setContract: setErc20Contract,
    checkContractAllowance,
    checkBalance,
    getContractWithSigner
  } = useErc20Contract()
  const { getBalances } = useSafeClient({
    rpcUrl: selectedChain?.rpcUrl,
    safeUrl: selectedChain?.safeUrl
  })

  const transactionPrevalidation = async ({
    recipients,
    sourceWalletId,
    destinationCurrencyType = CurrencyType.CRYPTO
  }: IHandlePreTransactionValidation): Promise<
    Result<null | { sourceAmounts: number[]; sourceCurrency: any }, PreTransactionValidationErrors>
  > => {
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
      errorMessageRef.current = null
      setIsValidating(true)
      if (destinationCurrencyType === CurrencyType.CRYPTO) {
        if (wallet.sourceType === SourceType.ETH) {
          await handleDispersePrevalidation({ recipients, sourceWalletId })
        } else {
          await handleSafePrevalidation({ sourceWalletId, recipients })
        }
      } else {
        if (wallet.sourceType === SourceType.ETH) {
          await handleDisperseFiatPrevalidation({ recipients, sourceWalletId })
        } else {
          await handleSafeFiatPrevalidation({ sourceWalletId, recipients })
        }
      }

      return { isSuccess: true, data: null }
    } catch (_err: any) {
      if (_err instanceof InsufficientFunds) {
        return {
          isSuccess: false,
          error: {
            type: 'InsufficientFunds',
            message: 'sds',
            systemMessage: _err.systemMessage,
            sourceWalletId: _err.sourceWalletId,
            amount: _err.amount,
            tokenId: '',
            tokenIds: []
          }
        }
      }
      if (_err instanceof InsufficientApprovalAmount) {
        return {
          isSuccess: false,
          error: {
            type: 'InsufficientApprovalAmount',
            message: _err.message,
            systemMessage: _err.systemMessage,
            currentApproval: _err.currentApproval,
            tokenId: _err.tokenId,
            tokenAddress: _err.tokenAddress,
            amount: _err.amount
          }
        }
      }

      return {
        isSuccess: false,
        error: {
          type: 'GenericError',
          systemMessage: _err?.message ?? 'Error tracking message',
          message: 'Sorry, an error occured'
        }
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleDispersePrevalidation = async ({
    recipients,
    sourceWalletId
  }: {
    recipients: IRecipientItemForm[]
    sourceWalletId: string
  }): Promise<Result<null, HandleDispersePrevalidationErrors>> => {
    const recipient = recipients[0] // All tokens will be the same on EOA transfer
    const mappedToken = cryptocurrencyMap[recipient?.tokenId]
    if (!mappedToken) throw new TokenNotFoundError('Token not found', recipient?.tokenId)
    // Get tokens data based on chain selected chain
    const result = getTokenChainsInfo({ token: mappedToken })
    if (result.isSuccess) {
      const token = result.data

      // Create array of amounts and recipient addresses for Dispers & Calculate total amount to send
      const { amounts, recipientAddresses, totalAmountToSend } = recipients?.reduce(
        (accumulator, _recipient) => {
          const { amount, walletAddress } = _recipient
          const num = Number(amount)
          // Check if num is not NaN before adding to totalAmountToSend
          if (!Number.isNaN(num)) {
            accumulator.totalAmountToSend += num
          }

          accumulator.amounts.push(amount)
          accumulator.recipientAddresses.push(walletAddress)

          return accumulator
        },
        { amounts: [], recipientAddresses: [], totalAmountToSend: 0 }
      ) || { amounts: [], recipientAddresses: [], totalAmountToSend: 0 }
      console.log('WHAT')
      // Native Coin Transfer
      if (token.type === ICryptocurrencyType.COIN) {
        const formattedTotalAmountToSend = totalAmountToSend.toFixed(result?.data.decimal ?? 18) // TODO - Check fixed length
        const walletBalance = await library.getBalance(account)

        await validateNativeTokenTransfer({
          walletBalance,
          sourceWalletId,
          totalAmountToSend: formattedTotalAmountToSend,
          amounts,
          recipients: recipientAddresses
        })
      } else {
        if (isEoaTransfer) {
          console.log('EOA Transfer')

          console.log('totalAmountToSend', totalAmountToSend)
          await validateEoaTransfer({ token, totalAmountToSend })
        } else {
          await validateTokenTransfer({ token, totalAmountToSend })
        }
      }
    }

    return {
      isSuccess: true,
      data: null
    }
  }

  const handleSafePrevalidation = async ({ sourceWalletId, recipients }) => {
    const wallet = walletMap[sourceWalletId]

    const safeBalances = await getBalances({ address: wallet.address })
    const safeBalanceMap = createSafeBalanceAddressMap(safeBalances)
    const tokenChainMap = selectedChainCryptocurrencies
    const recipientAmountMap = createRecipientAmountAddressMap(recipients, tokenChainMap)
    // Calculate the total amount required for each tokenId
    const insufficientBalances = checkSafeBalanceForTransfer(safeBalanceMap, recipientAmountMap)
    if (Object.keys(insufficientBalances).length > 0) {
      const symbol = nativeToken?.symbol
      const result = generatePaymentString(insufficientBalances, cryptocurrencyAddressMap, symbol)
      if (result.isSuccess) {
        errorMessageRef.current = result.data
      }
      throw new InsufficientFunds({
        type: 'InsufficientFunds',
        message: result.isSuccess ? result.data : 'Insufficient funds for transfer',
        systemMessage: 'Safe Prevalidation - Insufficient funds for transfer',
        tokenId: nativeToken?.publicId,
        amount: 'N/A',
        sourceWalletId: wallet.address
      })
    }
  }

  const validateNativeTokenTransfer = async ({
    walletBalance,
    sourceWalletId,
    totalAmountToSend,
    amounts,
    recipients
  }): Promise<Result<null, any>> => {
    await setDisperseContract({ chainName: selectedChain?.id })

    if (parseFloat(formatEther(walletBalance)) < totalAmountToSend) {
      currentErc20TokenBalance.current = parseFloat(formatEther(walletBalance)).toFixed(4)
      currentPaymentTotal.current = totalAmountToSend
      const symbol = nativeToken?.symbol
      const remainingBalance = totalAmountToSend - parseFloat(formatEther(walletBalance)) // TODO - Use selected chain
      const message = `You need at least at least ${remainingBalance} more ${symbol} to proceed with this payment.`
      errorMessageRef.current = message
      throw new InsufficientFunds({
        type: 'InsufficientFunds',
        message,
        systemMessage: 'Validating Native Token Transfer - Insufficient funds for transfer',
        tokenId: nativeToken?.publicId,
        amount: totalAmountToSend,
        sourceWalletId
      })
    }
    const gasEstimate = await estimateNativeCoinTransferGas({
      payableAmount: String(totalAmountToSend),
      amounts,
      recipients,
      meta: {
        decimals: 18
      }
    })

    // TODO - Check if this is sketchy
    if (parseFloat(gasEstimate.eth) + totalAmountToSend > parseFloat(walletBalance)) {
      const remainingBalance = parseFloat(gasEstimate.eth) + totalAmountToSend - parseFloat(walletBalance)
      const message = `You need at least at least ${remainingBalance} more ETH to proceed with this payment. Due to estimated gas fees.`

      errorMessageRef.current = message
      throw new InsufficientFunds({
        type: 'InsufficientFunds',
        message,
        systemMessage: 'Insufficient balance for transfer with gas fees',
        tokenId: nativeToken?.publicId,
        amount: totalAmountToSend,
        sourceWalletId: ''
      })
    }

    return {
      isSuccess: true,
      data: null
    }
  }

  const validateTokenTransfer = async ({
    token,
    totalAmountToSend
  }: {
    token: IChainCryptocurrency
    totalAmountToSend: any
  }) => {
    // Set ERC Contract to check approvals and balance
    await setErc20Contract({ tokenAddress: token.address })
    currentPaymentTotal.current = totalAmountToSend
    const disperseContractAddress = DISPERSE_CONTRACT_MAP[selectedChain?.id]
    // Check token approval

    const currentAllownce = await checkContractAllowance({
      ownerAddress: account,
      spenderAddress: disperseContractAddress
    })
    if (currentAllownce.isSuccess) {
      if (parseFloat(currentAllownce.data) < totalAmountToSend) {
        const message = `Your current allowance for ${token.symbol} is ${currentAllownce.data}. You need at least ${totalAmountToSend} to proceed with this payment.`
        errorMessageRef.current = message
        throw new InsufficientApprovalAmount({
          type: 'InsufficientApprovalAmount',
          message,
          systemMessage: 'Insufficient approval for transfer - Disperse ERC20 Token Transfer',
          tokenId: token.publicId,
          currentApproval: currentAllownce.data,
          tokenAddress: token.address,
          amount: totalAmountToSend
        })
      }

      const balanceResult = await checkBalance({ walletAddress: account })
      if (balanceResult.isSuccess) {
        if (parseFloat(balanceResult.data) < totalAmountToSend) {
          const remainingBalance = totalAmountToSend - parseFloat(balanceResult.data)
          const message = `You need at least at least ${remainingBalance} more ${token.symbol} to proceed with this payment.`
          errorMessageRef.current = message
          throw new InsufficientFunds({
            type: 'InsufficientFunds',
            message,
            sourceWalletId: '',
            tokenId: token.publicId,
            amount: totalAmountToSend,
            systemMessage: 'Insufficient balance for transfer'
          })
        }
      }
    }
  }

  const validateEoaTransfer = async ({
    token,
    totalAmountToSend
  }: {
    token: IChainCryptocurrency
    totalAmountToSend: any
  }) => {
    // Set ERC Contract to check approvals and balance
    const contract = await getContractWithSigner({ tokenAddress: token.address, erc20Abi: USDT_ABI })
    currentPaymentTotal.current = totalAmountToSend

    const parsedSendAmount = ethers.utils.parseUnits(totalAmountToSend.toString(), token?.decimal)
    const balance = await contract.balanceOf(account)

    if (balance.lt(parsedSendAmount)) {
      const remainingBalance = totalAmountToSend - parseFloat(balance.toString())
      const message = `You need at least at least ${remainingBalance} more ${token.symbol} to proceed with this payment.`
      errorMessageRef.current = message
      throw new InsufficientFunds({
        type: 'InsufficientFunds',
        message,
        sourceWalletId: '',
        tokenId: token.publicId,
        amount: totalAmountToSend,
        systemMessage: 'Insufficient balance for transfer'
      })
    }
  }

  const getTokenChainsInfo = ({
    token
  }: {
    token: ICryptocurrency
  }): Result<IChainCryptocurrency, TokenNotFoundError> => {
    const tokenAddressBasedOnChain = token?.addresses?.find((address) => address.blockchainId === selectedChain?.id)
    // TODO - Add token ID
    if (!tokenAddressBasedOnChain) throw new TokenNotFoundError('Token address not found for selected network', 'ID')

    return {
      isSuccess: true,
      data: {
        name: token.name,
        publicId: token.publicId,
        symbol: token.symbol,
        image: token.image.small,
        isVerified: token.isVerified,
        address: tokenAddressBasedOnChain.address,
        blockchainId: tokenAddressBasedOnChain.blockchainId,
        type: tokenAddressBasedOnChain.type,
        decimal: tokenAddressBasedOnChain.decimal
      }
    }
  }

  const handleDisperseFiatPrevalidation = async ({
    recipients,
    sourceWalletId
  }: {
    recipients: IRecipientItemForm[]
    sourceWalletId: string
  }): Promise<Result<null, HandleDispersePrevalidationErrors>> => {
    const sourceCurrency = recipients[0]?.sourceCurrency?.symbol?.toLowerCase() || 'usdc'

    const tokenPay = {
      ...verifiedCryptocurrencies[sourceCurrency],
      address:
        verifiedCryptocurrencies[sourceCurrency].addresses?.find((add) => add.blockchainId === selectedChain?.id)
          ?.address || null
    } // Only supported usdc for now

    const { totalAmountToSend } = recipients?.reduce(
      (accumulator, _recipient) => {
        const sourceAmount = parseFloat(_recipient.sourceAmount) || 0
        if (!Number.isNaN(sourceAmount)) {
          accumulator.totalAmountToSend += sourceAmount
        }
        return accumulator
      },
      { totalAmountToSend: 0 }
    ) || { totalAmountToSend: 0 }

    await validateTokenTransfer({ token: tokenPay, totalAmountToSend })

    return {
      isSuccess: true,
      data: null
    }
  }

  const handleSafeFiatPrevalidation = async ({ sourceWalletId, recipients }) => {
    const wallet = walletMap[sourceWalletId]
    const sourceCurrency = recipients[0]?.sourceCurrency?.symbol?.toLowerCase() || 'usdc'

    const tokenPay = {
      ...verifiedCryptocurrencies[sourceCurrency],
      address:
        verifiedCryptocurrencies[sourceCurrency].addresses?.find((add) => add.blockchainId === selectedChain?.id)
          ?.address || null
    } // Only supported usdc for now

    const safeBalances = await getBalances({ address: wallet.address })
    const safeBalanceMap = createSafeBalanceAddressMap(safeBalances)

    const { totalAmountToSend } = recipients?.reduce(
      (accumulator, _recipient) => {
        const sourceAmount = parseFloat(_recipient.sourceAmount) || 0
        if (!Number.isNaN(sourceAmount)) {
          accumulator.totalAmountToSend += sourceAmount
        }
        return accumulator
      },
      { totalAmountToSend: 0 }
    ) || { totalAmountToSend: 0 }

    if (safeBalanceMap[tokenPay.address] < totalAmountToSend || !safeBalanceMap[tokenPay.address]) {
      const message = `Your current allowance for ${tokenPay.symbol} is ${
        safeBalanceMap[tokenPay.address] || 0
      }. You need at least ${totalAmountToSend} to proceed with this payment.`
      errorMessageRef.current = message

      throw new InsufficientFunds({
        type: 'InsufficientFunds',
        message,
        systemMessage: 'Safe Prevalidation - Insufficient funds for transfer',
        tokenId: nativeToken?.publicId,
        amount: 'N/A',
        sourceWalletId: wallet.address
      })
    }
    return {
      isSuccess: true,
      data: null
    }
  }

  return {
    isValidating,
    transactionPrevalidation,
    currentErc20TokenBalance: currentErc20TokenBalance.current,
    currentPaymentTotal: currentPaymentTotal.current,
    errorMessage: errorMessageRef.current
  }
}

export default usePreTransactionValidation
