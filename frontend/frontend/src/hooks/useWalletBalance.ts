import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'
import { useAppSelector } from '@/state'
import { freeSelectors } from '@/state/free/reducer'
import useFreeContext from './useFreeContext'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

export const useETHBalance = () => {
  const { account, library } = useWeb3React()
  const [eth, setETH] = useState<string | undefined>()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    const callback = async () => {
      try {
        if (library && account) {
          const value = await library.getBalance(account)
          setETH(value._hex)
        }
      } catch (error) {
        sentryCaptureException(error)
        setETH('0x00')
      }
    }
    callback()
  }, [account, library, reset])

  return eth
}

export const useUSDCBalance = () => {
  const { account } = useWeb3React()
  const { usdcContract } = useFreeContext()
  const [usdcToken, setUSDCToken] = useState<string | undefined>()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    const callback = async () => {
      try {
        if (account && usdcContract) {
          const value = await usdcContract?.balanceOf(account)
          setUSDCToken(value._hex)
        } else if (account && !usdcContract) {
          setUSDCToken('0x00')
        }
      } catch (error) {
        sentryCaptureException(error)
        setUSDCToken('0x00')
      }
    }
    callback()
  }, [account, usdcContract, reset])

  return usdcToken
}

export const useXSGDBalance = () => {
  const { account } = useWeb3React()
  const { xsgdContract } = useFreeContext()
  const [xsgdToken, setXSGDToken] = useState<string | undefined>()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    const callback = async () => {
      try {
        if (account && xsgdContract) {
          const value = await xsgdContract?.balanceOf(account)
          setXSGDToken(value._hex)
        } else if (account && !xsgdContract) {
          setXSGDToken('0x00')
        }
      } catch (error) {
        sentryCaptureException(error)
        setXSGDToken('0x00')
      }
    }
    callback()
  }, [account, xsgdContract, reset])

  return xsgdToken
}

export const useXIDRBalance = () => {
  const { account } = useWeb3React()
  const { xidrContract } = useFreeContext()
  const [xidrToken, setXIDRToken] = useState<string | undefined>()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    const callback = async () => {
      try {
        if (account && xidrContract) {
          const value = await xidrContract?.balanceOf(account)
          setXIDRToken(value._hex)
        } else if (account && !xidrContract) {
          setXIDRToken('0x00')
        }
      } catch (error) {
        sentryCaptureException(error)
        setXIDRToken('0x00')
      }
    }
    callback()
  }, [account, xidrContract, reset])

  return xidrToken
}

export const useMetamaskBalance = (price: any) => {
  const { account, chainId } = useWeb3React()
  const { tokens } = useFreeContext()
  const ethBalance = useETHBalance()
  const xsgdBalance = useXSGDBalance()
  const usdcBalance = useUSDCBalance()
  const xidrBalance = useXIDRBalance()
  const [balance, setBalance] = useState<string>()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    if (typeof ethBalance !== 'undefined' && xsgdBalance && usdcBalance && xidrBalance) {
      let sum = getTotalUSDAmount(chainId, formatEther(ethBalance), price)

      if (xsgdBalance !== '0x00') {
        const token = tokens.find((item) => item.name === 'XSGD')
        if (token)
          sum = (
            Number(sum) + Number(getTotalUSDAmount(chainId, formatUnits(xsgdBalance, token.decimal), price, token))
          ).toFixed(6)
      }
      if (usdcBalance !== '0x00') {
        const token = tokens.find((item) => item.name === 'USDC')
        if (token)
          sum = (
            Number(sum) + Number(getTotalUSDAmount(chainId, formatUnits(usdcBalance, token.decimal), price, token))
          ).toFixed(6)
      }
      if (xidrBalance !== '0x00') {
        const token = tokens.find((item) => item.name === 'XIDR')
        if (token)
          sum = (
            Number(sum) + Number(getTotalUSDAmount(chainId, formatUnits(xidrBalance, token.decimal), price, token))
          ).toFixed(6)
      }
      setBalance(sum)
    }
  }, [chainId, ethBalance, price, tokens, usdcBalance, xidrBalance, xsgdBalance, account, reset])

  return { balance, setBalance }
}

export const useUSDTBalance = () => {
  const { account } = useWeb3React()
  const { usdtContract } = useFreeContext()
  const [usdtToken, setUSDTToken] = useState<string | undefined>()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    const callback = async () => {
      try {
        if (account && usdtContract) {
          const value = await usdtContract?.balanceOf(account)
          setUSDTToken(value._hex)
        } else if (account && !usdtContract) {
          setUSDTToken('0x00')
        }
      } catch (error) {
        sentryCaptureException(error)
        setUSDTToken('0x00')
      }
    }
    callback()
  }, [account, usdtContract, reset])

  return usdtToken
}
export const useDAIBalance = () => {
  const [daiToken, setDAIToken] = useState<string | undefined>()
  const { account } = useWeb3React()
  const { daiContract } = useFreeContext()
  const reset = useAppSelector(freeSelectors.resetMetamaskBalanceSelector)

  useEffect(() => {
    const callback = async () => {
      try {
        if (account && daiContract) {
          const value = await daiContract?.balanceOf(account)
          setDAIToken(value._hex)
        } else if (account && !daiContract) {
          setDAIToken('0x00')
        }
      } catch (error) {
        sentryCaptureException(error)
        setDAIToken('0x00')
      }
    }
    callback()
  }, [account, daiContract, reset])

  return daiToken
}
