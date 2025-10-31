/* eslint-disable guard-for-in */
import { useAppSelector } from '@/state'
import { useWeb3React } from '@web3-react/core'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectChainByIdMap } from '@/slice/chains/chain-selectors'
import type {
  IParsedPendingTransaction,
  IPendingTransaction
} from '@/slice/pending-transactions/pending-transactions.dto'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useLazyGetPendingTransactionsNewQuery } from '@/slice/pending-transactions/pending-transactions.api'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useMemo, useState } from 'react'
import {
  checkTransactionExecutedByConnectedAccount,
  checkIsConnectedAccountSafeOwner,
  checkIsTransactionRejected
} from '../pending-approval.utils'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { isArray } from 'lodash'

interface IParseTransactionAmountParams {
  transaction: IParsedPendingTransaction
}

interface IParseTransactionOwnershipParams {
  transactions?: IParsedPendingTransaction[][]
}

interface IUsePendingApproval {
  safeInitSkip?: boolean
}

const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT

const usePendingApproval = ({ safeInitSkip }: IUsePendingApproval) => {
  const { account, chainId } = useWeb3React()
  const organizationId = useOrganizationId()
  const isMultiChainSafeEnabled = useAppSelector((state) => selectFeatureState(state, 'isMultiChainSafeEnabled'))

  const [selectedSafe, setSelectedSafe] = useState<any>(null)
  const [isNonceMismatch, setIsNonceMismatch] = useState(false)
  const [executableTransactions, setExecutableTransactions] = useState<IParsedPendingTransaction[]>([])
  const [queuedTransactions, setQueuedTransactions] = useState<IParsedPendingTransaction[]>([])
  const [permissionMap, setPermissionMap] = useState({})

  const walletIdMap = useAppSelector(selectWalletMapById)
  const chainIdMap = useAppSelector(selectChainByIdMap)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const organizationSettings = useAppSelector(orgSettingsSelector)

  const [triggerGetPendingTx, getPendingTxResponse] = useLazyGetPendingTransactionsNewQuery()

  const fetchAndParseRawTransactions = async (_safeId?: string) => {
    try {
      setExecutableTransactions([])
      setQueuedTransactions([])

      const currentChain = chainIdMap[chainId]

      const result = await triggerGetPendingTx({
        organizationId,
        params: {
          blockchainIds: account && currentChain ? [currentChain?.id] : [],
          walletIds: _safeId ? [_safeId] : []
        }
      }).unwrap()

      const { readyTransactions, remainingTransactions } = await parseExecutableTransactions(result?.data)

      setExecutableTransactions(readyTransactions)
      setQueuedTransactions(remainingTransactions)

      // if (_safeId && walletIdMap[_safeId]) {
      //   checkSafeNonce(walletIdMap[_safeId], readyTransactions)
      // }

      parseTransactionOwnership({
        transactions: [...readyTransactions, ...remainingTransactions]
      })
    } catch (err) {
      console.error(err)
    }
  }

  const checkSafeNonce = async (_safe, _transactions) => {
    // Default to no mismatch if address isn't provided
    if (!_safe || _transactions.length === 0) {
      setIsNonceMismatch(false)
      return
    }

    const safeCurrentNonce = _safe?.metadata?.nonce

    // Determine if the first transaction's nonce matches the safe's nonce
    const hasNonceMismatch = safeCurrentNonce !== _transactions[0]?.nonce
    setIsNonceMismatch(hasNonceMismatch)
  }

  const handleSetSelectedSafe = (_data) => {
    setIsNonceMismatch(false)
    setSelectedSafe(_data)
  }

  const parseTransactionOwnership = ({ transactions: _transactions }: IParseTransactionOwnershipParams) => {
    // Function to handle rendering of execute and reject buttons depending on connected wallet and transaction state
    // Is connected account owner of the safe
    const transactionPermissonMap = {}
    const transactions = _transactions ?? [...executableTransactions, ...queuedTransactions]
    transactions?.forEach((transaction) => {
      const transactionBlockchainId = transaction?.blockchainId
      const transactionSourceSafeId = transaction?.wallet?.id
      const sourceSafe = walletIdMap[transactionSourceSafeId]

      let ownerAddresses = []

      if (isMultiChainSafeEnabled && isArray(sourceSafe?.metadata)) {
        const currentChainOwners = sourceSafe?.metadata?.find(
          (chain) => chain.blockchainId === transactionBlockchainId
        ) ?? {
          ownerAddresses: []
        }
        ownerAddresses = currentChainOwners?.ownerAddresses.map((address) => address.address.toLowerCase())
      } else {
        // @ts-ignore
        ownerAddresses = sourceSafe?.metadata?.ownerAddresses.map((item) => item.address.toLowerCase())
      }

      transactionPermissonMap[transaction.id] = {
        isExecutedByConnectedAccount: checkTransactionExecutedByConnectedAccount({
          confirmations: transaction?.confirmations ?? [],
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        }),
        isConnectedAccountOwner: checkIsConnectedAccountSafeOwner({
          safeOwners: ownerAddresses,
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        })
      }
    })

    setPermissionMap((prevState) => ({
      ...prevState,
      ...transactionPermissonMap
    }))
  }

  const parseExecutableTransactions = async (_pendingTransactions) => {
    if (!_pendingTransactions || _pendingTransactions.length === 0) {
      return {
        readyTransactions: [],
        remainingTransactions: []
      }
    }

    const groupedBySafe = _pendingTransactions.reduce((acc, transaction) => {
      const safeAddress = transaction.safeTransaction.safe
      if (!acc[safeAddress]) {
        acc[safeAddress] = []
      }
      acc[safeAddress].push(transaction)
      return acc
    }, {})

    const readyToExecute = []
    const queued = []

    for (const [safeAddress, transactions] of Object.entries(groupedBySafe)) {
      const sortedTransactions = (transactions as any[]).sort((a, b) => a.nonce - b.nonce)
      let firstExecutableFound = false
      let previousNonce = -1

      for (const transaction of sortedTransactions) {
        const parsedTransaction = {
          ...transaction,
          isUnknown: transaction?.type ? transaction?.type === 'unknown' : false
        }

        if (parsedTransaction.confirmations.length >= parsedTransaction.confirmationsRequired) {
          const isLowestExecutable = parsedTransaction.nonce <= sortedTransactions[0].nonce

          if (!firstExecutableFound && isLowestExecutable) {
            // Mark the first executable transaction
            readyToExecute.push({
              ...parsedTransaction,
              isQueued: false,
              isTransactionExecutable: true,
              isFinishedParsingData: false,
              isRejected: checkIsTransactionRejected(parsedTransaction)
            })
            firstExecutableFound = true
            previousNonce = parsedTransaction.nonce
          } else if (parsedTransaction.nonce === previousNonce + 1) {
            // Subsequent transactions that are consecutive and have sufficient confirmations
            readyToExecute.push({
              ...parsedTransaction,
              isQueued: true,
              isTransactionExecutable: true,
              isFinishedParsingData: false,
              isRejected: checkIsTransactionRejected(parsedTransaction)
            })
            previousNonce = parsedTransaction.nonce
          } else {
            // Break in the consecutive sequence, push to queued
            queued.push({
              ...parsedTransaction,
              isQueued: true,
              isTransactionExecutable:
                parsedTransaction.confirmations.length >= parsedTransaction.confirmationsRequired,
              isFinishedParsingData: false,
              isRejected: checkIsTransactionRejected(parsedTransaction)
            })
          }
        } else {
          // Transactions that do not have enough confirmations are queued
          queued.push({
            ...parsedTransaction,
            isQueued: true,
            isTransactionExecutable: false,
            isFinishedParsingData: false,
            isRejected: checkIsTransactionRejected(parsedTransaction)
          })
        }
      }
    }

    const { updatedReadyTransactions, updatedRemainingTransactions } = await parseTransactionFiatAndCrypto({
      readyTransactions: readyToExecute,
      remainingTransactions: queued
    })

    setExecutableTransactions(updatedReadyTransactions)
    setQueuedTransactions(updatedRemainingTransactions)

    return {
      readyTransactions: updatedReadyTransactions,
      remainingTransactions: updatedRemainingTransactions
    }
  }

  const parseTransactionFiatAndCrypto = async ({ readyTransactions, remainingTransactions }) => {
    const updatedReadyTransactions = readyTransactions.map((transaction) => ({
      ...transaction,
      isFinishedParsingData: false,
      ...parseTransactionFiatAndCryptoData({ transaction })
    }))

    const updatedRemainingTransactions = remainingTransactions.map((transaction) => ({
      ...transaction,
      isFinishedParsingData: false,
      ...parseTransactionFiatAndCryptoData({ transaction })
    }))

    return {
      updatedReadyTransactions,
      updatedRemainingTransactions
    }
  }

  const parseTransactionFiatAndCryptoData = ({
    transaction
  }: IParseTransactionAmountParams): {
    cryptocurrencies: any[]
    fiatTotalAmount: number
    fiatCurrencyData: any
  } => {
    const fiatCurrencyData = {
      iso: organizationSettings?.country?.iso,
      code: organizationSettings?.fiatCurrency?.code,
      symbol: organizationSettings?.fiatCurrency?.symbol,
      decimals: organizationSettings?.fiatCurrency?.decimal
    }

    let fiatTotalAmount = 0
    const cryptocurrenciesMap = new Map()

    if (transaction?.recipients?.length > 0) {
      transaction.recipients.forEach((recipient) => {
        fiatTotalAmount += parseFloat(recipient.fiatAmount)
        // cryptocurrenciesMap.set(recipient.cryptocurrency.name, recipient.cryptocurrency)
        if (recipient.cryptocurrency && recipient.cryptocurrency.name) {
          const cryptocurrencyName = recipient.cryptocurrency.name
          const currentAmount = parseFloat(recipient.cryptocurrencyAmount) || 0

          if (cryptocurrenciesMap.has(cryptocurrencyName)) {
            // Update the total amount if the cryptocurrency already exists
            const existingEntry = cryptocurrenciesMap.get(cryptocurrencyName)
            existingEntry.totalCryptocurrencyAmount += currentAmount
            cryptocurrenciesMap.set(cryptocurrencyName, existingEntry)
          } else {
            const { image } = recipient.cryptocurrency
            // Create a new entry for the cryptocurrency
            cryptocurrenciesMap.set(cryptocurrencyName, {
              totalCryptocurrencyAmount: currentAmount,
              name: recipient.cryptocurrency?.name,
              symbol: recipient.cryptocurrency?.symbol,
              image: image?.thumb
            })
          }
        }
      })
    }

    return {
      cryptocurrencies: Array.from(cryptocurrenciesMap.values()),
      fiatTotalAmount,
      fiatCurrencyData
    }
  }

  const parsedChainData = useMemo(
    () =>
      supportedChains?.map((chain) => ({
        value: chain.chainId,
        label: chain.name,
        imageUrl: chain.imageUrl,
        rpcUrl: chain.rpcUrl,
        safeUrl: chain.safeUrl,
        symbol: chain.symbol
      })),
    [supportedChains]
  )

  return {
    chainOptions: parsedChainData,
    executableTransactions,
    queuedTransactions,
    fetchAndParseRawTransactions,
    isLoading:
      getPendingTxResponse.isLoading || getPendingTxResponse.isFetching || getPendingTxResponse?.isUninitialized,

    parseTransactionOwnership,
    selectedSafe,
    setSelectedSafe: handleSetSelectedSafe,
    isNonceMismatch,
    permissionMap
  }
}

export default usePendingApproval
