import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { usePostAnalysisForPayoutMutation } from '@/api-v2/analysis-api'

const usePostPendingPaymentHandler = () => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const [postPayoutAnalysis] = usePostAnalysisForPayoutMutation()
  const [triggerGetPrice] = useLazyGetTokenPriceQuery()
  const handlePostExecutionAnalysis = async ({ transactions, transactionHash }) => {
    const uniqueCryptocurrencies = new Set()
    const cryptoCurrencyPriceMap = new Map()

    transactions.forEach((transaction) => {
      for (const recipient of transaction.recipients) {
        uniqueCryptocurrencies.add(recipient?.cryptocurrency?.publicId)
      }
    })
    const cryptocurrencies = Array.from(uniqueCryptocurrencies)
    // TODO - Handle the case where the price is not available for a token
    try {
      await Promise.all(
        cryptocurrencies.map(async (cryptocurrency) => {
          const price = await triggerGetPrice({
            params: {
              cryptocurrencyId: cryptocurrency as string,
              fiatCurrency: 'USD',
              date: new Date().toISOString()
            }
          }).unwrap()
          cryptoCurrencyPriceMap[cryptocurrency as string] = price?.data
        })
      )
    } catch (err) {
      console.log('Error fetching token price from prices API - Pending Approval page', err)
    }

    for (const transaction of transactions) {
      try {
        let total = 0.0
        const cryptoCurrencyTotals = new Map()

        for (const recipient of transaction.recipients) {
          if (cryptoCurrencyTotals.has(recipient?.cryptocurrency?.publicId)) {
            const currentTotal = cryptoCurrencyTotals.get(recipient?.cryptocurrency?.publicId)
            cryptoCurrencyTotals.set(
              recipient?.cryptocurrency?.publicId,
              currentTotal + parseFloat(recipient?.cryptocurrencyAmount)
            )
          } else {
            cryptoCurrencyTotals.set(recipient?.cryptocurrency?.publicId, parseFloat(recipient?.cryptocurrencyAmount))
          }
        }

        cryptoCurrencyTotals.forEach((value, key) => {
          const price = cryptoCurrencyPriceMap[key]
          total += value * price
        })
        const firstTransaction = transactions[0]
        postPayoutAnalysis({
          blockchainId: selectedChain?.id,
          type: 'safe',
          sourceType: 'gnosis_safe',
          sourceAddress: firstTransaction?.wallet?.address,
          sourceWalletId: firstTransaction?.wallet?.id,
          hash: transactionHash,
          applicationName: 'full_app',
          totalLineItems: firstTransaction?.recipients?.length,
          notes: firstTransaction?.notes,
          lineItems: transaction?.recipients?.map((recipient) => ({
            address: recipient?.address,
            cryptocurrencyId: recipient?.cryptocurrency?.publicId,
            amount: recipient?.cryptocurrencyAmount,
            chartOfAccountId: recipient?.chartOfAccount?.id ?? null,
            notes: recipient?.notes ?? null,
            files: recipient?.files ?? null
          })),
          totalAmount: total?.toFixed(6),
          valueAt: new Date().toISOString()
        })
      } catch (err) {
        console.log('Error while fetching token price from prices API - Pending Approval page', err)
        // log.error(
        //   'Error while fetching token price from prices API - Pending Approval page',
        //   ['Error while fetching token price from prices API - Pending Approval page'],
        //   { actualErrorObject: err && JSON.stringify(err) },
        //   `${window.location.pathname}`
        // )
      }
    }
  }
  return {
    handlePostExecutionAnalysis
  }
}

export default usePostPendingPaymentHandler
