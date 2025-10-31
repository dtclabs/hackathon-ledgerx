import { selectChartOfAccountsMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { selectContactAddressMap } from '@/slice/contacts/contacts.selectors'
import {
  selectTokenFiatPriceMap,
  selectTokenPriceMap,
  selectVerifiedCryptocurrencyMap
} from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectReviewData } from '@/slice/transfer/transfer.selectors'
import { useAppSelector } from '@/state'
import { useEffect, useMemo } from 'react'
import { IReviewItem } from '../Transfer.types'
import { fiatCurrenciesMapSelector, orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { getCurrencyImage } from './useFiatPaymentForm/useFiatPaymentForm'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { format } from 'date-fns'

interface CurrencyTotals {
  [tokenId: string]: {
    amount: number
    symbol: string
    code: string
    image: string
    tokenAmount: string
    fiatPrice: number
  }
}

interface ISuccessModalCopy {
  sourceWalletType: string
  threshold: number
}

const useFiatPaymentReviewData = () => {
  const reviewData = useAppSelector(selectReviewData)
  const fiatCurrenciesMap = useAppSelector(fiatCurrenciesMapSelector)
  const chartOfAccountMap = useAppSelector(selectChartOfAccountsMap)
  const organizationSettings = useAppSelector(orgSettingsSelector)
  const verifiedCryptocurrencies: any = useAppSelector(selectVerifiedCryptocurrencyMap)
  const tokenFiatPriceMap = useAppSelector(selectTokenFiatPriceMap)

  const [triggerTokenPriceQuery] = useLazyGetTokenPriceQuery()

  useEffect(() => {
    // Get price after refreshing review page and get data from storage
    if (organizationSettings?.fiatCurrency?.code) {
      const recipient = reviewData?.recipients[0]
      const sourceCryptoCurrency = verifiedCryptocurrencies[recipient.sourceCurrency?.symbol?.toLowerCase()]
      const fiatPrice = tokenFiatPriceMap[sourceCryptoCurrency?.publicId]?.[organizationSettings?.fiatCurrency?.code]

      if (!fiatPrice) {
        triggerTokenPriceQuery({
          params: {
            cryptocurrencyId: sourceCryptoCurrency?.publicId,
            date: format(new Date(), 'yyyy-MM-dd'),
            fiatCurrency: organizationSettings?.fiatCurrency?.code ?? 'USD'
          }
        })
      }
    }
  }, [])

  const reviewItems: IReviewItem[] = useMemo(() => {
    const results: IReviewItem[] = []
    const recipients = reviewData?.recipients || []

    if (recipients?.length > 0) {
      recipients?.forEach((recipient, index) => {
        const fiatCurrency = fiatCurrenciesMap[recipient.tokenId?.toLowerCase()]
        const sourceCryptoCurrency = verifiedCryptocurrencies[recipient.sourceCurrency?.symbol?.toLowerCase()]
        const fiatPrice =
          tokenFiatPriceMap[sourceCryptoCurrency?.publicId]?.[organizationSettings?.fiatCurrency?.code] || '0'

        const chartOfAccount = recipient.chartOfAccountId
        const chartOfAccountObj = chartOfAccountMap[chartOfAccount]

        const recipientName = ''

        results.push({
          id: recipient.bankAccount.metadata.id,
          bankAccount: recipient.bankAccount,
          recipientName,
          note: recipient.note,
          files: recipient.files,
          draftStatus: recipient.draftMetadata?.status ?? null,
          draftMetadata: recipient.draftMetadata,
          chartOfAccount: {
            id: chartOfAccount,
            code: chartOfAccountObj?.code,
            name: chartOfAccountObj?.name,
            type: chartOfAccountObj?.type
          },
          currency: {
            id: fiatCurrency?.code,
            image: getCurrencyImage(fiatCurrency?.code),
            amount: recipient.amount,
            symbol: fiatCurrency?.symbol,
            code: fiatCurrency?.code
          },
          sourceCurrency: {
            amount: recipient.sourceAmount?.toString() || '',
            id: sourceCryptoCurrency?.publicId,
            image: sourceCryptoCurrency?.image?.small,
            symbol: sourceCryptoCurrency?.symbol,
            fiatPrice: parseFloat(fiatPrice) * parseFloat(recipient.sourceAmount)
          },
          tags: recipient?.annotations || [],
          quote: recipient.quote
        })
      })
    }
    return results
  }, [tokenFiatPriceMap])

  const tokenPriceTotals = useMemo(() => {
    const recipients = reviewData?.recipients || []

    const currencyTotals: CurrencyTotals = {}

    let totalSourceAmount = 0
    let totalFiatPrice = 0

    if (recipients?.length > 0) {
      recipients.forEach((recipient) => {
        const fiatCurrency = fiatCurrenciesMap[recipient.tokenId?.toLowerCase()]
        const amount = parseFloat(recipient.amount)
        const sourceCryptoCurrency = verifiedCryptocurrencies[recipient.sourceCurrency?.symbol?.toLowerCase()]

        if (fiatCurrency) {
          const fiatPrice =
            parseFloat(recipient?.sourceAmount) *
            parseFloat(tokenFiatPriceMap[sourceCryptoCurrency?.publicId]?.[organizationSettings?.fiatCurrency?.code])

          if (currencyTotals[fiatCurrency.code]) {
            currencyTotals[fiatCurrency.code].amount += amount
          } else {
            currencyTotals[fiatCurrency.code] = {
              amount,
              code: fiatCurrency.code,
              symbol: fiatCurrency.symbol,
              image: getCurrencyImage(fiatCurrency.code),
              tokenAmount: recipient?.sourceAmount?.toString(),
              fiatPrice
            }
          }
          totalSourceAmount += parseFloat(recipient?.sourceAmount)
          totalFiatPrice += fiatPrice
        }
      })
    }

    // Convert the token totals object to an array of objects
    const currencyTotalsArray = Object.entries(currencyTotals)
      .map(([tokenId, { amount, symbol, image, tokenAmount, code }]) => ({
        id: tokenId,
        amount,
        symbol,
        image,
        tokenAmount,
        code
      }))
      .sort((a, b) => parseFloat(b.tokenAmount) - parseFloat(a.tokenAmount))

    return {
      currencyTotals: currencyTotalsArray,
      totalSourceAmount,
      totalFiatPrice
    }
  }, [tokenFiatPriceMap])

  const successModalCopy = ({ sourceWalletType, threshold }: ISuccessModalCopy) => {
    if (sourceWalletType === 'eth') {
      return {
        title: 'Transfer successfully sent!',
        description: 'Thanks for using our transfer service.',
        declineText: 'Skip',
        acceptText: 'Send Another Transfer'
      }
    }
    return {
      title: `${threshold === 1 ? 'Transfer successfully sent!' : 'Transfer submitted to pending queue!'}`,
      description: `${
        threshold === 1
          ? 'Thanks for using our transfer service.'
          : 'Other organization members will need to approve the transaction in order for it to be executed'
      }`,
      declineText: `${threshold === 1 ? 'Skip' : 'Continue to Pending Queue'}`,
      acceptText: 'Send Another Transfer'
    }
  }

  return {
    successModalCopy,
    tokenPriceTotals,
    reviewItems,
    sourceCurrency: reviewData?.recipients[0]?.sourceCurrency
  }
}

export default useFiatPaymentReviewData
