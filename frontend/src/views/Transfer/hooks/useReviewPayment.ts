import { useMemo } from 'react'
import { useAppSelector } from '@/state'
import { IReviewItem } from '../Transfer.types'
import { usePaymentFormLogic } from './usePaymentForm/usePaymentFormLogic'
import { selectWalletMapById, selectWalletMapByAddress } from '@/slice/wallets/wallet-selectors'
import { useWatch } from 'react-hook-form'
import {
  selectTokenPriceMap,
  selectVerifiedCryptocurrencyIdMap
} from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectContactAddressMap } from '@/slice/contacts/contacts.selectors'
import { selectChartOfAccountsMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { selectReviewData } from '@/slice/transfer/transfer.selectors'

interface TokenTotals {
  [tokenId: string]: {
    amount: number
    symbol: string
    image: string
    tokenPrice: string
  }
}

interface ISuccessModalCopy {
  sourceWalletType: string
  threshold: number
}

const usePaymentReviewData = () => {
  const recipients = useAppSelector(selectReviewData)?.recipients
  const verifiedCryptocurrencyIdMap = useAppSelector(selectVerifiedCryptocurrencyIdMap)
  const contactAddressMap = useAppSelector(selectContactAddressMap)
  const walletAddressMap = useAppSelector(selectWalletMapByAddress)
  const chartOfAccountMap = useAppSelector(selectChartOfAccountsMap)
  const cryptocurrencyPriceMap = useAppSelector(selectTokenPriceMap)

  const reviewItems: IReviewItem[] = useMemo(() => {
    const results: IReviewItem[] = []
    const mergedContacts = {
      ...contactAddressMap,
      ...walletAddressMap
    }
    if (recipients?.length > 0) {
      recipients?.forEach((recipient, index) => {
        const systemContact = mergedContacts[recipient?.walletAddress?.toLowerCase()]
        const token = verifiedCryptocurrencyIdMap[recipient.tokenId]

        const chartOfAccount = recipient.chartOfAccountId
        const chartOfAccountObj = chartOfAccountMap[chartOfAccount]

        let recipientName = null
        if (systemContact) {
          recipientName = systemContact?.name ? systemContact?.name : systemContact?.contactName
        }
        results.push({
          id: recipient.walletAddress,
          walletAddress: recipient.walletAddress,
          recipientName,
          note: recipient.note,
          files: recipient.files,
          draftStatus: recipient.draftMetadata?.status ?? null,
          draftMetadata: recipient.draftMetadata,
          chartOfAccount: chartOfAccountObj
            ? {
                id: chartOfAccount,
                code: chartOfAccountObj?.code,
                name: chartOfAccountObj?.name,
                type: chartOfAccountObj?.type
              }
            : null,
          tags: recipient?.annotations || [],
          currency: {
            id: token?.publicId,
            image: token?.image.thumb,
            amount: recipient.amount,
            symbol: token?.symbol
          }
        })
      })
    }
    return results
  }, [])

  const tokenPriceTotals = useMemo(() => {
    const tokenTotals: TokenTotals = {}
    let paymentTotal = 0
    if (recipients?.length > 0) {
      recipients.forEach((recipient) => {
        const token = verifiedCryptocurrencyIdMap[recipient.tokenId]
        const amount = parseFloat(recipient.amount)
        const tokenPrice = cryptocurrencyPriceMap[recipient.tokenId]

        if (token) {
          if (tokenTotals[token.publicId]) {
            tokenTotals[token.publicId].amount += amount
          } else {
            tokenTotals[token.publicId] = {
              amount,
              symbol: token.symbol,
              image: token.image.thumb,
              tokenPrice
            }
          }
          paymentTotal += amount * tokenPrice
        }
      })
    }

    // Convert the token totals object to an array of objects
    const tokenTotalsArray = Object.entries(tokenTotals)
      .map(([tokenId, { amount, symbol, image, tokenPrice }]) => ({
        id: tokenId,
        amount,
        symbol,
        image,
        tokenPrice
      }))
      .sort((a, b) => parseFloat(b.tokenPrice) - parseFloat(a.tokenPrice))

    return {
      tokenTotals: tokenTotalsArray,
      paymentTotal
    }
  }, [])

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
    reviewItems
  }
}

export default usePaymentReviewData
