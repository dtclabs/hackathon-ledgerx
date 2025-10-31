/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-param-reassign */
import * as Yup from 'yup'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { CHAIN_NAME } from '@/constants/chains'
import { size } from '@/constants/pagePagination'
import { isAllowed } from '@/hooks/contract'
import { useChainName } from '@/hooks/useChainName'
import useFreeContext from '@/hooks/useFreeContext'
import useSafe from '@/hooks/useSafe'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import { useUSDPrice } from '@/hooks/useUSDPrice'
import { useMetamaskBalance } from '@/hooks/useWalletBalance'
import { useAppDispatch, useAppSelector } from '@/state'
import { Button } from '@/components-v2'
import FormErrorLabel from '@/components/FormErrorLabel/FormErrorLabel'
import {
  importSource,
  removeAllTransactions,
  removeCompletedTransactions,
  resetSourceList,
  setResetBalance,
  setResetMetamaskBalance,
  updateSourceByAddress
} from '@/state/free/actions'
import { freeSelectors } from '@/state/free/reducer'
import { setGlobalError } from '@/state/global/actions'
import { getErc20Contract } from '@/utils/contractHelpers'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'
import { logEvent } from '@/utils/logEvent'
import { triggerHotjarEvent } from '@/utils/triggerHotjarEvent'
import { EthSignSignature } from '@gnosis.pm/safe-core-sdk'
import { SafeTransactionData, SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import {
  SafeBalanceResponse,
  SafeInfoResponse,
  SafeMultisigTransactionListResponse,
  SafeMultisigTransactionResponse
} from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core'
import { constants } from 'ethers'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import { v4 } from 'uuid'
import { ESourceMethod } from '../_deprecated/Transactions/constants'
import ConfirmPayment from './components/ConfirmPayment/ConfirmPayment'
import Header from './components/Header/Header'
import SourceDetail from './components/SourceDetail/SourceDetail'
import Stepper from './components/Stepper/Stepper'
import { transactionTabs } from './components/TransactionTables/interface'
import TransactionTables from './components/TransactionTables/TransactionTables'
import { ETransactionStatus, IMetamaskTransaction, ITransactionForm } from './interface'
import { useRouter } from 'next/router'
import { useNativeToken } from '@/hooks/useNativeToken'
import { formatNumber } from '@/utils/formatNumber'
import { PaymentContactDropdown } from '@/components-v2/ContactDropdownPaymentLink'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useFieldArray } from 'react-hook-form'
import { captureException as sentryCaptureException, captureMessage as sentryCaptureMessage } from '@sentry/nextjs'
import { useGetVerifiedCryptoCurrenciesQuery } from '@/api-v2/cryptocurrencies'
import Typography from '@/components-v2/atoms/Typography'
import ImportSourceModal from './components/ImportSource/ImportSourceModal'

export interface IOrganization {
  organization: any
  isGenericLink: boolean
}

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .typeError('Please enter an amount')
    .required('Please enter an amount')
    .positive('Please enter positive values only'),
  remarks: Yup.string().max(50),
  contacts: Yup.array().of(
    Yup.object().shape({
      providerId: Yup.string(),
      content: Yup.string().required('Contact is required')
    })
  )
})

const NETWORK_MAP = {
  1: 'ethereum',
  5: 'goerli'
}

const Free: React.FC<IOrganization> = ({ organization, isGenericLink }) => {
  const router = useRouter()
  const nameNetwork = useChainName()
  const forceNetwork = CHAIN_NAME.find((c) => c.name === 'Ethereum') // Ethereum only for now
  const safeService = useSafeServiceClient()
  const dispatch = useAppDispatch()
  const { account, library, chainId } = useWeb3React()
  const nativeToken = useNativeToken(chainId)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isCancel, setIsCancel] = useState(false)
  const [sourceAddress, setSourceAddress] = useState('')
  const { safe, loadSafe } = useSafe()
  const [balances, setBalances] = useState<SafeBalanceResponse[]>()
  const [list, setList] = useState<SafeMultisigTransactionResponse[]>()
  const [error, setError] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [approving, setApproving] = useState(false)
  const { disperse, networkConfig: networkConfigs, recipients: importRecipients } = useFreeContext()
  const [showError, setShowError] = useState(false)
  const [page, setPage] = useState(1)
  const [sourceList, setSourceList] = useState<string[]>()
  const [allowance, setAllowance] = useState<boolean>(true)
  const [source, setSource] = useState<SafeInfoResponse | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [executingTransaction, setExecutingTransaction] = useState<any | null>(null)
  const sourceListSelector = useAppSelector(freeSelectors.sourceListSelector)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [totalTransactions, setTotalTransactions] = useState([])
  const [showTransaction, setShowTransaction] = useState(false)
  const [showTransactionMetaMask, setShowTransactionMetaMask] = useState(false)
  const [metamaskTransactions, setMetamaskTransactions] = useState<IMetamaskTransaction[]>([])
  const [transactionDetail, setTransactionDetail] = useState()
  const [allTransactions, setAllTransactions] = useState<any>([])
  const [expandList, setExpandList] = useState<any[]>()
  const [expandListHistory, setExpandListHistory] = useState<any[]>()
  const [totalCountHistory, setTotalCountHistory] = useState(0)
  const [currentTableDataHistory, setCurrentTableDataHistory] = useState<any[]>([])
  const { price } = useUSDPrice()
  const [active, setActive] = useState<string>(transactionTabs[0].key)
  const [executedTran, setExecutedTran] = useState<any>()
  const [availableSourceList, setAvailableSourceList] = useState<string[]>([])
  const [connectError, setConnectError] = useState(false)
  const { balance: metamaskBalance, setBalance } = useMetamaskBalance(price)

  const offset = process.env.NEXT_PUBLIC_MAXIMUM_TRANSACTIONS_HISTORY || 20
  const reset = useAppSelector(freeSelectors.resetBalanceSelector)
  const [data, setData] = useState<ITransactionForm>({
    comment: '',
    description: '',
    recipients: [{ remark: '', address: '', amount: '0', tokenAddress: '', decimal: 18, id: v4() }],
    isExpanded: false
  })
  const [safeError, setSafeError] = useState<string>()
  // const selectedChain = useAppSelector((state) => state.platform.selectedChain.publicId)

  const { data: tokensData } = useGetVerifiedCryptoCurrenciesQuery({})

  const suportedToken = useMemo(() => {
    const tokenList = []
    if (tokensData) {
      tokensData.data.forEach((item) => {
        const tokenAddress = item.addresses.find((chain) => chain.blockchainId === NETWORK_MAP[chainId || 1])
        if (tokenAddress) {
          tokenList.push({
            id: item.publicId,
            value: item.publicId,
            name: item.symbol,
            symbol: item.symbol,
            tokenAddress: tokenAddress?.address || '',
            decimal: tokenAddress?.decimal,
            image: item.image
          })
        }
      })
    }
    return tokenList
  }, [tokensData, chainId])

  const importToken = useMemo(() => {
    const mainTokenName = importRecipients[0].token[0] || nativeToken

    if (!mainTokenName) {
      return undefined
    }
    const tokenName =
      suportedToken &&
      (suportedToken.find((item) => item.name.toLowerCase() === mainTokenName.toLowerCase()) || suportedToken[0])

    return tokenName
  }, [suportedToken])

  useEffect(() => {
    if (sourceListSelector) {
      setSourceList(sourceListSelector.map((item) => item.address))
    }
  }, [sourceListSelector])

  useEffect(() => {
    dispatch(removeAllTransactions())
  }, [dispatch])

  const renderFormValues = () => ({
    amount: '',
    remarks: '',
    contacts: [
      {
        providerId: '1',
        content: ''
      }
    ]
  })

  const genericPaymentForm = useForm({
    mode: 'all',
    shouldUnregister: false,
    resolver: yupResolver(validationSchema),
    defaultValues: renderFormValues()
  })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact
  } = useFieldArray({
    control: genericPaymentForm.control,
    name: 'contacts'
  })

  const handleShowImportModal = () => {
    setShowImportModal(true)
    logEvent({
      event: 'import_safe',
      payload: {
        event_category: 'Payment app',
        event_label: '',
        value: 1
      }
    })
  }

  const getSafeBalance = async (address: string) => {
    let balance: string
    try {
      const response = await safeService.getBalances(address)
      if (response && response.length > 1) {
        const { length } = response
        let sum = getTotalUSDAmount(chainId, formatEther(response[0].balance), price)
        for (let i = 0; i < length; i++) {
          const token = suportedToken.find(
            (tokenItem) =>
              response[i] &&
              response[i].tokenAddress &&
              tokenItem.tokenAddress.toLowerCase() === response[i].tokenAddress.toLowerCase()
          )
          if (token) {
            const tokenBalance = formatUnits(response[i].balance, response[i].token.decimals)
            const usdBalance = getTotalUSDAmount(chainId, tokenBalance, price, token)
            sum = (Number(sum) + Number(usdBalance)).toString()
          }
        }
        balance = sum
      } else {
        balance = getTotalUSDAmount(chainId, formatEther(response[0].balance), price)
      }
    } catch (err) {
      sentryCaptureException(err)
      balance = '0'
    }
    return balance
  }

  useEffect(() => {
    const callback = async () => {
      if (reset && safeService) {
        sourceListSelector.forEach(async (item, index) => {
          setTimeout(async () => {
            if (index !== 0) {
              const balance = await getSafeBalance(item.address)
              dispatch(updateSourceByAddress({ address: item.address, balance }))
            }
          }, 10000)
        })
      }
    }
    callback()
  }, [reset, safeService])

  const getSafes = useCallback(async () => {
    try {
      if (safeService && account) {
        const safelist = await safeService.getSafesByOwner(account)
        setAvailableSourceList(safelist.safes)
      }
    } catch (err) {
      sentryCaptureException(err)
      sentryCaptureMessage('Could not fetch existing safes. Please enter the safe address above manually.')
      setSafeError('Could not fetch existing safes. Please enter the safe address above manually.')
    }
  }, [account, dispatch, safeService])

  useEffect(() => {
    getSafes()
  }, [getSafes])

  const handleConfirm = async (safeInfoResponse: SafeInfoResponse) => {
    if (safeInfoResponse) {
      const balance = await getSafeBalance(safeInfoResponse.address)
      dispatch(importSource({ address: safeInfoResponse.address, balance }))
      setSourceAddress(safeInfoResponse.address)
      const newList = Array.from(new Set([...sourceList, safeInfoResponse.address]))
      setSourceList(newList)
      setShowImportModal(false)
    }
  }

  const approveToken = async () => {
    try {
      setApproving(true)
      if (disperse && importToken && importToken.tokenAddress !== '') {
        const contract = getErc20Contract(importToken.tokenAddress, library.getSigner())

        const isApproval = await contract?.approve(networkConfigs.disperse, constants.MaxUint256)

        await isApproval.wait().then(async () => {
          const isAllowance = await isAllowed(contract, account, networkConfigs.disperse)

          setAllowance(isAllowance)
        })
        setApproving(false)
      }
    } catch (err) {
      sentryCaptureException(err)
      setApproving(false)
    }
  }

  const getSafeInfo = useCallback(async () => {
    try {
      if (account && sourceAddress && safeService && sourceAddress !== account) {
        const response = await safeService.getSafeInfo(sourceAddress)
        setSource(response)
      }
    } catch (err) {
      sentryCaptureException(err)
      // dispatch(setGlobalError('Services not available.'))
    }
  }, [sourceAddress, safeService])

  const fetchBalances = useCallback(async () => {
    try {
      if (sourceAddress && account && sourceAddress !== account && safeService) {
        const balanceList = await safeService.getBalances(sourceAddress)
        setBalances(balanceList)
      }
    } catch (err) {
      sentryCaptureException(err)
      //
    }
  }, [account, safeService, sourceAddress])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  useEffect(() => {
    if (!account) {
      setSourceAddress('')
      setBalances([{ tokenAddress: null, token: null, balance: '0' }])
      setList([])
      setSourceList([])
      setTotalTransactions([])
      setAllTransactions([])
      setTotalCount(0)
      setTotalCountHistory(0)
      setMetamaskTransactions([])
      dispatch(resetSourceList())
      dispatch(removeAllTransactions())
      setAvailableSourceList([])
    } else {
      setSourceAddress(account)
      setBalance(undefined)
      dispatch(importSource({ address: account, balance: undefined, new: true }))
    }
  }, [account, dispatch])

  useEffect(() => {
    if (metamaskBalance) {
      dispatch(updateSourceByAddress({ address: account, balance: metamaskBalance }))
    } else {
      dispatch(setResetMetamaskBalance())
    }
  }, [metamaskBalance])

  useEffect(() => {
    const callback = async () => {
      if (importToken.tokenAddress !== '' && networkConfigs) {
        const contract = getErc20Contract(importToken.tokenAddress, library.getSigner())
        const isAllowance = await isAllowed(contract, account, networkConfigs.disperse)
        setAllowance(isAllowance)
      }
    }
    if (account && importToken && importToken.tokenAddress !== '') {
      callback()
    }
  }, [account, disperse, library, networkConfigs, importToken])

  useEffect(() => {
    if (error) {
      setShowError(true)
    }
  }, [error])

  useEffect(() => {
    if (sourceAddress) {
      setList([])
      setActive(transactionTabs[0].key)
      setCurrentTableDataHistory([])
      setMetamaskTransactions([])
      setTotalTransactions([])
      setBalances([{ tokenAddress: null, token: null, balance: '0' }])
      setExpandList([])
      setExpandListHistory([])
      setTotalCount(0)
      setTotalCountHistory(0)
      setPage(1)
    }
  }, [sourceAddress])

  useEffect(() => {
    getSafeInfo()
  }, [getSafeInfo])

  const toggleExpandTransaction = (hash: string) => {
    setExpandList((prev) =>
      prev.map((item) => ({ ...item, isExpanded: item.safeTxHash === hash ? !item.isExpanded : item.isExpanded }))
    )
    setExpandListHistory((prev) =>
      prev.map((item) => ({ ...item, isExpanded: item.safeTxHash === hash ? !item.isExpanded : item.isExpanded }))
    )
  }

  useEffect(() => {
    if (account && sourceAddress && sourceAddress !== account) {
      loadSafe(sourceAddress)
    }
  }, [loadSafe, sourceAddress])

  const handleShowTransaction = (transaction: any) => {
    if (!confirmLoading) {
      setTransactionDetail(transaction)
      setShowTransaction(true)
    }
  }
  const handleShowTransactionMetaMask = (transaction: any) => {
    if (!confirmLoading) {
      setTransactionDetail(transaction)
      setShowTransactionMetaMask(true)
    }
  }

  const fetchData = useCallback(async () => {
    if (account && sourceAddress === account) {
      return
    }

    if (account && safeService && sourceAddress && sourceAddress !== account) {
      try {
        setPage(1)
        const pendingTransactions: SafeMultisigTransactionListResponse = await safeService.getPendingTransactions(
          sourceAddress
        )
        setList(pendingTransactions.results)
        setTotalTransactions(pendingTransactions && pendingTransactions.results.sort((a, b) => a.nonce - b.nonce))
      } catch (err: any) {
        sentryCaptureException(err)
        dispatch(setGlobalError('Services not available.'))
      }
    }
  }, [sourceAddress, safeService, dispatch])

  const handleSign = async (transaction, e: any) => {
    e.stopPropagation()
    setConfirmLoading(true)

    setTimeout(async () => {
      transaction.status = ETransactionStatus.SIGNING
      if (safe && source && sourceAddress) {
        try {
          const sign = await safe.signTransactionHash(transaction.safeTxHash)
          await safeService.confirmTransaction(transaction.safeTxHash, sign.data)
          const response: SafeMultisigTransactionListResponse = await safeService.getPendingTransactions(
            transaction.safe
          )
          const result = await safeService.getMultisigTransactions(sourceAddress)
          if (result) setAllTransactions(result.results)

          if (response) setList(response.results)
        } catch (err: any) {
          sentryCaptureException(err?.message)
          setError(err.message)
          setShowError(true)
        }
      }
    }, 500)
    setConfirmLoading(false)
  }

  const filterSameNonceList = (listTrans: any) => {
    let transactions = listTrans || []
    for (let i = 0; i < transactions.length; i++) {
      const { nonce } = transactions[i]
      let sameNonceTransactions = transactions.filter((item) => item.nonce === nonce)

      if (sameNonceTransactions.length > 1) {
        sameNonceTransactions = sameNonceTransactions.sort(
          (a, b) => Date.parse(a.submissionDate) - Date.parse(b.submissionDate)
        )
        transactions = transactions.filter((item) => item !== sameNonceTransactions[0])
      }
    }
    return transactions
  }

  const sortByNonceASCGnosis = (listItem: any[]) =>
    listItem
      .filter(
        (item: any) =>
          (item.dataDecoded && item.dataDecoded.method === ESourceMethod.MultiSend) ||
          (item.dataDecoded && item.dataDecoded.method === ESourceMethod.Transfer) ||
          (item.value === '0' && item.dataDecoded === null && item.data === null) ||
          (!item.dataDecoded && item.value !== '0')
      )
      .sort((a, b) => a.nonce - b.nonce)

  const handleReject = async (transaction, e) => {
    e.stopPropagation()
    setTimeout(async () => {
      if (safe) {
        const createdTransaction: SafeTransactionDataPartial = {
          data: transaction.data,
          to: transaction.to,
          value: transaction.value,
          baseGas: transaction.baseGas,
          gasPrice: transaction.gasPrice,
          gasToken: transaction.gasToken,
          nonce: transaction.nonce,
          operation: transaction.operation,
          refundReceiver: transaction.refundReceiver,
          safeTxGas: transaction.safeTxGas
        }
        const safeTransaction = await safe.createTransaction({ safeTransactionData: createdTransaction })

        const rejectTransaction = await safe.createRejectionTransaction(safeTransaction.data.nonce)

        const safeTxHash = await safe.getTransactionHash(rejectTransaction)

        const sign = await safe.signTransactionHash(safeTxHash)
        const signValue = sign.data
        await safeService.proposeTransaction({
          safeAddress: sourceAddress,
          safeTransactionData: rejectTransaction.data,
          safeTxHash,
          senderAddress: account,
          senderSignature: signValue
        })
        await safeService.confirmTransaction(safeTxHash, signValue)
        const response: SafeMultisigTransactionListResponse = await safeService.getPendingTransactions(transaction.safe)
        setList(filterSameNonceList(response.results))
      }
    }, 500)
  }

  const executeTransaction = async (
    transaction: SafeMultisigTransactionResponse | any,
    safeTransactionData: SafeTransactionData
  ) => {
    if (safe) {
      const safeTransaction = await safe.createTransaction({ safeTransactionData })
      transaction.confirmations.forEach((confirmation) => {
        const signature = new EthSignSignature(confirmation.owner, confirmation.signature)
        safeTransaction.addSignature(signature)
      })
      const executeTxResponse = await safe.executeTransaction(safeTransaction)
      const time = await library.getBlock(executeTxResponse.transactionResponse.blockNumber)

      transaction.status = ETransactionStatus.CONFIRMING
      setExecutingTransaction({ ...transaction })

      if (executeTxResponse && executeTxResponse.transactionResponse) {
        await executeTxResponse.transactionResponse.wait()
        transaction.status = ETransactionStatus.CONFIRMED
        dispatch(setResetBalance())
      }
      setExecutedTran({ hash: executeTxResponse.hash, time: time.timestamp, price, ...transaction })
      setExecutingTransaction({ price, ...transaction })
      triggerHotjarEvent()
      return executeTxResponse
    }
    return null
  }

  const checkAvailableExecute = async (txHash: string) => {
    const transaction = await safeService.getTransaction(txHash)
    return transaction.isExecuted
  }

  const handleExecuted = async (transaction, e) => {
    e.stopPropagation()

    if (await checkAvailableExecute(transaction.safeTxHash)) {
      setError('This transaction is already executed.')
      setShowError(true)
      handleRefresh()
      return
    }

    transaction.status = ETransactionStatus.EXECUTING
    setExecutingTransaction({ ...transaction })

    if (transaction.confirmations.length === source.threshold) {
      try {
        const safeTransactionData: SafeTransactionData = {
          to: transaction.to,
          value: transaction.value,
          data: transaction.data || '0x',
          operation: transaction.operation,
          safeTxGas: transaction.safeTxGas,
          baseGas: transaction.baseGas,
          gasPrice: transaction.gasPrice.toString(),
          gasToken: transaction.gasToken,
          refundReceiver: transaction.refundReceiver,
          nonce: transaction.nonce
        }
        await executeTransaction(transaction, safeTransactionData)
        setTotalTransactions((prev) => prev.filter((item) => item.nonce !== transaction.nonce))
      } catch (err: any) {
        transaction.status = ''
        setExecutingTransaction({ ...transaction })
        if (!err.message.includes('Contract with a Signer cannot override')) {
          setError(err.message as string)
          setShowError(true)
        }
        sentryCaptureException(err?.message)
      }
    }
  }

  const currentTableData = useMemo(() => {
    const firstPageIndex = (page - 1) * size
    const lastPageIndex = firstPageIndex + size
    if (list) {
      let newList = sortByNonceASCGnosis(list)
      newList = filterSameNonceList(newList)
      setTotalCount(newList && newList.length)
      let tableData = newList && (newList.slice(firstPageIndex, lastPageIndex) as any)
      if (executingTransaction) {
        tableData = tableData.map((transaction) => {
          if (transaction.safeTxHash === executingTransaction.safeTxHash) {
            transaction.status = executingTransaction.status
          }

          return transaction
        })
      }
      setExpandList(tableData.map((item) => ({ safeTxHash: item.safeTxHash, isExpanded: false })))
      return tableData
    }
    setTotalCount(0)
    return []
  }, [page, list, executingTransaction])

  useEffect(() => {
    const callback = async () => {
      const firstPageIndex = (page - 1) * size
      const lastPageIndex = firstPageIndex + size
      const totaltransferTransactions = allTransactions.filter(
        (item: any) =>
          (item.dataDecoded && item.dataDecoded.method === ESourceMethod.MultiSend) ||
          (item.dataDecoded && item.dataDecoded.method === ESourceMethod.Transfer) ||
          (item.value === '0' && item.dataDecoded === null && item.data === null) ||
          (!item.dataDecoded && item.value !== '0')
      )

      const transferTransactions = filterSameNonceList(totaltransferTransactions)
      if (transferTransactions) {
        let tableData =
          transferTransactions &&
          (transferTransactions.filter((item) => item.isExecuted === true).slice(firstPageIndex, lastPageIndex) as any)
        if (executingTransaction) {
          tableData = tableData.map((transaction) => {
            if (transaction.safeTxHash === executingTransaction.safeTxHash) {
              transaction.status = executingTransaction.status
            }
            return transaction
          })
        }

        setExpandListHistory(tableData.map((item) => ({ safeTxHash: item.safeTxHash, isExpanded: false })))
        setCurrentTableDataHistory(tableData)
        setTotalCountHistory(transferTransactions.filter((item) => item.isExecuted === true).length)
      }
    }

    callback()
  }, [page, allTransactions, executingTransaction, price])

  const handleRefresh = async () => {
    try {
      if (safeService && sourceAddress && account && sourceList.length && sourceAddress !== account) {
        setRefreshLoading(true)
        setPage(1)
        const pendingTransactions: SafeMultisigTransactionListResponse = await safeService.getPendingTransactions(
          sourceAddress
        )

        const result = await safeService.getMultisigTransactions(sourceAddress)
        if (pendingTransactions && pendingTransactions.results) {
          setList([])
          setTotalTransactions([])
          let newList = sortByNonceASCGnosis(pendingTransactions.results)
          newList = filterSameNonceList(newList)
          setList(newList)
          setTotalCount(newList && newList.length)
          setTotalTransactions(pendingTransactions && pendingTransactions.results.sort((a, b) => a.nonce - b.nonce))
        }
        if (result) {
          setAllTransactions([])
          setAllTransactions(result.results)
        }
        setRefreshLoading(false)
      }
      if (account && sourceAddress === account && importRecipients?.length === 1) {
        setRefreshLoading(true)
        dispatch(removeCompletedTransactions())
        const rawResponse = await fetch(networkConfigs.apiLink(sourceAddress, offset))
        const content = await rawResponse.json()
        if (content && content.result && Array.isArray(content.result)) {
          setMetamaskTransactions([])
          // Don't show historic transactions for now. Only pending ones.
          // setMetamaskTransactions(content.result.map((item) => ({ ...item, isExpanded: false }))) //.filter(item => item.to === '0xd152f549545093347a162dce210e7293f1452150'))
        }
        setRefreshLoading(false)
      }
    } catch (err: any) {
      sentryCaptureException(err)
      console.log(err)
      setRefreshLoading(false)
      //
    }
  }

  useEffect(() => {
    if (sourceAddress) handleRefresh()
  }, [sourceAddress])

  useEffect(() => {
    if (executedTran && currentTableDataHistory.find((item) => item.transactionHash === executedTran.hash)) {
      setExecutedTran(null)
    }
  }, [currentTableDataHistory, executedTran])

  const USDAmount = (amount: string) => {
    const tokenData = suportedToken && suportedToken.find((item) => item.tokenAddress === importToken.tokenAddress)
    return formatNumber(getTotalUSDAmount(chainId, amount, price, tokenData), {
      maximumFractionDigits: 2
    })
  }

  useEffect(() => {
    if (!account) {
      setStep(1)
    } else {
      setStep(2)
    }
  }, [account])

  const handleOnClickRemoveContact = (_index) => {
    const contacts = genericPaymentForm.getValues('contacts')
    if (contacts.length > 1) {
      removeContact(_index)
    } else {
      genericPaymentForm.setValue('contacts.0.providerId', '1')
      genericPaymentForm.setValue('contacts.0.content', '')
      genericPaymentForm.trigger('contacts.0.providerId')
    }
  }

  const handleAddAnotherContact = () => {
    appendContact({
      providerId: '1',
      content: ''
    })
  }

  const handleFormSubmit = () => {
    genericPaymentForm.handleSubmit((_values) => {
      setStep(3)
    })()
  }

  const value = parseFloat(String(router.query.amount)).toLocaleString('en-US')
  return (
    <div className="w-full h-screen bg-gray-1300 ">
      <Header forceNetwork={forceNetwork} />
      <div className="w-full max-h-paymentMainView overflow-auto flex justify-center scrollbar relative z-auto">
        {/* {!account ? (
          <ConnectAccount />
        ) : ( */}
        <div className="w-full max-w-[1200px] py-8 px-5 block">
          <div className="text-center py-1 text-neutral-900">
            <Typography classNames="mb-2" variant="heading2">
              Payment Request From {organization?.data?.name}
            </Typography>
            <div className="text-sm text-black-0 font-inter font-medium leading-5">
              Created with{' '}
              <a
                className="text-neutral-900 underline"
                href="https://www.ledgerx.com/#hq-mini-apps"
                target="_blank"
                rel="noopener noreferrer"
              >
                HQ Payment Request
              </a>
            </div>
          </div>
          <div className="pb-6 pt-2">
            <Stepper step={step} />
          </div>
          {step < 3 && (
            <div className="w-[900px] mx-auto bg-white flex rounded-[24px] mb-8 font-inter">
              {isGenericLink ? (
                <div className="w-[45%] bg-[#101828] text-white rounded-l-[24px] p-8">
                  <div className="pb-8">
                    <div className="text-xs leading-[18px] mb-2">Amount</div>
                    <div className="bg-[#1D2939] flex items-center gap-2 border border-[#1D2939] rounded-lg p-0.5 w-full h-[36px] mb-1">
                      <div className="flex justify-center items-center pl-2 pr-1">
                        <img alt="img-token" src={importToken?.image?.small} width={25} height={25} />{' '}
                      </div>
                      <div style={{ borderLeft: '1px solid #F2F4F7', height: 20 }} />
                      <input
                        type="number"
                        name="amount"
                        // @ts-ignore
                        onWheel={(e) => e.target.blur()}
                        style={{ backgroundColor: '#1D2939', color: 'white' }}
                        {...genericPaymentForm.register('amount')}
                        className=" focus:outline-none text-sm  placeholder:text-[#98A2B3] placeholder:italic placeholder:leading-5  w-full font-inter rounded-lg flex gap-4 items-center px-1"
                        placeholder="Enter amount"
                      />
                      <div style={{ borderLeft: '1px solid #F2F4F7', height: 20 }} />
                      <div className="pr-2 text-sm" style={{ fontWeight: 500 }}>
                        {importToken?.image?.symbol}
                      </div>
                    </div>
                    <FormErrorLabel error={genericPaymentForm.formState.errors?.amount?.message} />

                    <div className="text-xs">{`= $${USDAmount(genericPaymentForm.watch('amount'))} USD`}</div>
                  </div>
                  <div className="pb-8">
                    <div className="text-xs leading-[18px]">To</div>
                    <div className="text-base font-semibold leading-7">{organization?.data?.name}</div>
                    <div className="text-xs">{importRecipients[0].address}</div>
                  </div>
                  <div className="pb-4 flex flex-col">
                    <div className="text-xs leading-[18px] pb-2">Remarks (max characters: 50)</div>
                    <input
                      name="remarks"
                      maxLength={50}
                      {...genericPaymentForm.register('remarks')}
                      style={{
                        backgroundColor: '#1D2939',
                        width: '100%',
                        fontSize: 12,
                        height: 36,
                        paddingLeft: 5,
                        border: '1px solid #1D2939',
                        borderRadius: '4px'
                      }}
                    />
                    <div
                      className={`flex justify-end text-xs mt-1 ${
                        genericPaymentForm.watch('remarks').length === 50 ? 'text-[#E83F6D]' : ''
                      }`}
                    >
                      {genericPaymentForm.watch('remarks').length}/50
                    </div>
                    {/* <FormErrorLabel error={genericPaymentForm.formState.errors?.remarks?.message} /> */}
                  </div>
                  <div className="pb-8">
                    <div className="text-xs leading-[18px] -mb-2">Your contact infomation</div>
                    <div>
                      {' '}
                      {contactFields.map((addressBlock, index) => (
                        <Fragment key={index}>
                          <PaymentContactDropdown
                            onClickRemoveAddress={handleOnClickRemoveContact}
                            watch={genericPaymentForm.watch}
                            setValue={genericPaymentForm.setValue}
                            trigger={genericPaymentForm.trigger}
                            index={index}
                            key={index}
                          />
                          <FormErrorLabel
                            error={
                              genericPaymentForm?.formState.errors?.contacts?.[index]?.providerId?.message ||
                              genericPaymentForm.formState.errors?.contacts?.[index]?.content?.message
                            }
                          />
                        </Fragment>
                      ))}
                      <Button
                        onClick={handleAddAnotherContact}
                        className="mt-4"
                        variant="contained"
                        color="gray"
                        size="xs"
                      >
                        + Add Another Contact Detail
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs leading-[18px]">Chain</div>
                    <div className="text-xl font-semibold leading-7">{nameNetwork || 'Ethereum'}</div>
                  </div>
                </div>
              ) : (
                <div className="w-[45%] bg-[#101828] text-white rounded-l-[24px] p-8">
                  {importRecipients[0].remark[0] && (
                    <div className="pb-8">
                      <div className="text-xs leading-[18px]">Invoice</div>
                      <div className="text-xl font-semibold leading-7">{importRecipients[0].remark}</div>
                    </div>
                  )}
                  <div className="pb-8">
                    <div className="text-xs leading-[18px]">Amount</div>
                    <div className="text-xl font-semibold leading-7 flex items-center gap-3">
                      <img alt="img-token" src={importToken?.image?.small} width={20} height={20} />{' '}
                      {`${value} ${importRecipients[0].token}`}
                    </div>
                    <div className="text-sm">{`= $${USDAmount(importRecipients[0].amount[0])} USD`}</div>
                  </div>
                  <div className="pb-8">
                    <div className="text-xs leading-[18px]">To</div>
                    <div className="text-xl font-semibold leading-7">{organization?.data?.name}</div>
                    <div className="text-sm">{importRecipients[0].address}</div>
                  </div>
                  <div>
                    <div className="text-xs leading-[18px]">Chain</div>
                    <div className="text-xl font-semibold leading-7">{nameNetwork || 'Ethereum'}</div>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <SourceDetail
                  account={account}
                  address={importRecipients[0].address[0]}
                  availableSourceList={availableSourceList}
                  onShowImportModal={handleShowImportModal}
                  setConnectError={setConnectError}
                  refreshLoading={refreshLoading}
                  sourceAddress={sourceAddress}
                  sourceList={sourceList}
                  setSourceAddress={setSourceAddress}
                  setStep={setStep}
                  isGenericLink={isGenericLink}
                  onGenericFormSubmit={handleFormSubmit}
                />
              </div>
            </div>
          )}
          {step >= 3 && (
            <div className="w-[650px] mx-auto bg-white rounded-[24px] mb-8 font-inter">
              <ConfirmPayment
                sourceAddress={sourceAddress}
                tokenImage={importToken?.logoUrl}
                tokenAddress={importToken?.tokenAddress}
                isGenericLink={isGenericLink}
                genericLinkMetaData={{
                  remarks: genericPaymentForm.getValues('remarks'),
                  contactDetails: genericPaymentForm.getValues('contacts')
                }}
                genericLinkAmount={genericPaymentForm.getValues('amount')}
                usdPrice={
                  isGenericLink
                    ? USDAmount(genericPaymentForm.getValues('amount'))
                    : USDAmount(importRecipients[0].amount[0])
                }
                organizationName={organization?.data?.name}
                nameNetwork={nameNetwork}
                sourceList={sourceList}
                setStep={setStep}
                setLoading={setLoading}
                setIsCancel={setIsCancel}
                step={step}
                loading={loading}
                isCancel={isCancel}
                safe={safe}
                fetchData={fetchData}
                approveToken={approveToken}
                allowance={allowance}
                approving={approving}
              />
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-3xl w-[900px] mx-auto">
              <TransactionTables
                price={price}
                active={active}
                organization={organization}
                totalCountHistory={totalCountHistory}
                list={list}
                page={page}
                error={error}
                source={source}
                balances={balances}
                showError={showError}
                sourceList={sourceList}
                totalCount={totalCount}
                expandList={expandList}
                sourceAddress={sourceAddress}
                refreshLoading={refreshLoading}
                totalTransactions={totalTransactions}
                transactionDetail={transactionDetail}
                currentTableData={currentTableData && currentTableData}
                showTransaction={showTransaction}
                showTransactionMetaMask={showTransactionMetaMask}
                executedTran={executedTran}
                setPage={setPage}
                onSign={handleSign}
                setActive={setActive}
                setError={setError}
                onReject={handleReject}
                onRefresh={handleRefresh}
                setShowError={setShowError}
                onExecuted={handleExecuted}
                setShowTransaction={setShowTransaction}
                onShowImportModal={handleShowImportModal}
                currentTableDataHistory={currentTableDataHistory}
                onShowTransaction={handleShowTransaction}
                onShowTransactionMetaMask={handleShowTransactionMetaMask}
                toggleExpandTransaction={toggleExpandTransaction}
                setShowTransactionMetaMask={setShowTransactionMetaMask}
                expandListHistory={expandListHistory}
                metamaskHistory={metamaskTransactions}
                setMetamaskTransactions={setMetamaskTransactions}
                availableSourceList={availableSourceList}
                setConnectError={setConnectError}
              />
            </div>
          )}

          <div className="h-20" />
          <ImportSourceModal
            availableSourceList={availableSourceList}
            sourceList={sourceList}
            showModal={showImportModal}
            onConfirm={handleConfirm}
            setShowModal={setShowImportModal}
            safeError={safeError}
            setSafeError={setSafeError}
          />
          <NotificationPopUp
            type="error"
            title="Warning"
            description="Please install Metamask to continue."
            onClose={() => setConnectError(false)}
            acceptText="Close"
            setShowModal={setConnectError}
            showModal={connectError}
          />
        </div>
      </div>
    </div>
  )
}

export default Free
