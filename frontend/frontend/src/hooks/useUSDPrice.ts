/* eslint-disable no-console */
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/state'
import { setGlobalError } from '@/state/global/actions'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

const tokenIds = [
  'xsgd',
  'ethereum',
  'straitsx-indonesia-rupiah',
  'avalanche-2',
  'matic-network',
  'binancecoin',
  'usd-coin',
  'tether',
  'dai',
  'sgd-tracker',
  'the-sandbox',
  'socol',
  'mantle'
]

export interface IPrice {
  [name: string]: {
    usd: number
  }
}

const fetchTokensUSD = (list: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/coingecko/simple/price?ids=${list}&vs_currencies=usd`

export const useUSDPrice = () => {
  const [price, setPrice] = useState<any>()
  const [success, setSuccess] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const callback = async () => {
      try {
        const tokens = tokenIds.join(',')
        const rawResponse = await fetch(fetchTokensUSD(tokens))
        const content = await rawResponse.json()
        if (content && content.data) {
          setPrice(content.data)
          setSuccess(true)
        } else setSuccess(false)
      } catch (error: any) {
        sentryCaptureException(error)
        setSuccess(false)
        dispatch(setGlobalError('Error Fetching Prices'))
      }
    }
    if (!success) callback()
  }, [dispatch, success])

  return { price }
}
