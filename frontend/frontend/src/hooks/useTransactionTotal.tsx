/* eslint-disable no-console */
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { ESourceMethod } from '@/views/_deprecated/Transactions/constants'
import { getErc20Contract } from '@/utils/contractHelpers'
import useFreeContext from './useFreeContext'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'

export const useTransactionTotal = (transaction: any, price) => {
  const [total, setTotal] = useState('0')
  const [loadingTotal, setLoadingTotal] = useState(false)
  const [totalUSD, setTotalUSD] = useState('0')
  const [token, setToken] = useState('')
  const { library, chainId } = useWeb3React()
  const { tokens } = useFreeContext()

  const callback = useCallback(async () => {
    if (!library) {
      return
    }
    setLoadingTotal(true)
    if (transaction.value !== '0') {
      const amount = formatEther(transaction.value).toString()
      setToken('')
      setTotal(amount)
      setTotalUSD(getTotalUSDAmount(chainId, amount, price))
      setLoadingTotal(false)
      return
    }
    if (transaction.value === '0' && transaction.data === null && transaction.dataDecoded === null) {
      setToken('')
      setTotal('0')
      setTotalUSD('0')
    }
    if (transaction.dataDecoded && transaction.dataDecoded.method === ESourceMethod.Transfer) {
      const erc20 = getErc20Contract(transaction.to, library)
      const unit = await erc20.decimals()
      const amount = formatUnits(transaction.dataDecoded.parameters[1].value, Number(unit)).toString()
      const selectedToken = tokens.find((item) => item.tokenAddress.toLowerCase() === transaction.to.toLowerCase())
      setToken(transaction.to)
      setTotal(amount)
      setTotalUSD(getTotalUSDAmount(chainId, amount, price, selectedToken))
      setLoadingTotal(false)
      return
    }

    if (transaction.dataDecoded && transaction.dataDecoded.method === ESourceMethod.MultiSend) {
      const transactions = transaction.dataDecoded.parameters[0].valueDecoded
      const sum = transactions.reduce((amount, item) => {
        if (item.value !== '0') {
          return BigNumber.from(amount).add(BigNumber.from(item.value).toString())
        }

        return BigNumber.from(amount).add(BigNumber.from(item.dataDecoded.parameters[1].value).toString())
      }, '0')

      if (transactions[0].value !== '0') {
        const amount = formatEther(sum.toString()).toString()
        setToken('')
        setTotal(amount)
        setTotalUSD(getTotalUSDAmount(chainId, amount, price))
      } else {
        const erc20 = getErc20Contract(transactions[0].to, library)
        const unit = await erc20.decimals()
        const amount = formatUnits(sum.toString(), Number(unit)).toString()
        const selectedToken = tokens.find(
          (item) => item.tokenAddress.toLowerCase() === transactions[0].to.toLowerCase()
        )
        setTotal(amount)
        setToken(transactions[0].to)
        setTotalUSD(getTotalUSDAmount(chainId, amount, price, selectedToken))
      }
    }
    setLoadingTotal(false)
  }, [library, transaction.data, transaction.dataDecoded, transaction.to, transaction.value])

  useEffect(() => {
    callback()

    return () => {
      setTotal('0')
      setTotalUSD('0')
      setToken('')
      setLoadingTotal(false)
    }
  }, [callback])

  return { total, totalUSD, token, loadingTotal }
}
