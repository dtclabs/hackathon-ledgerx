import { useRef, useEffect } from 'react'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { createCowSwapWidget, TradeType } from '@cowprotocol/widget-lib'
import { CowEventListeners, CowEvents } from '@cowprotocol/events'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { ethers } from 'ethers'
import { selectVerifiedCryptocurrencyMap2 as selectVerifiedCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { isEmpty } from 'lodash'

const params = {
  appCode: 'HQ-App',
  width: '600',
  height: '400',
  standaloneMode: true,
  theme: 'light',
  enabledTradeTypes: [TradeType.SWAP],
  sounds: {
    postOrder: null,
    orderExecuted: null,
    orderError: null
  }
}

const CowSwap = () => {
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const selectedChain = useAppSelector(selectedChainSelector)
  const verifiedTokens = useAppSelector(selectVerifiedCryptocurrencyMap)
  const wallets = useAppSelector((state) => state.wallets.wallets)
  const [triggerGetPrice] = useLazyGetTokenPriceQuery()

  const isMounted = useRef(false) // Track whether component is mounted

  useEffect(() => {
    // Ensure component is mounted before proceeding
    if (!isMounted.current && !isEmpty(verifiedTokens) && wallets.length > 0) {
      const listeners: CowEventListeners = [
        {
          event: CowEvents.ON_FULFILLED_ORDER,
          handler: (event) => console.log('Order on fulfilled', event)
        },
        {
          event: CowEvents.ON_POSTED_ORDER,
          handler: async (event) => sendData(event)
        }
      ]
      const widgetContainer = document.getElementById('swap-widget')
      if (widgetContainer) {
        // @ts-ignore
        createCowSwapWidget(widgetContainer, { params, listeners })
      }
      isMounted.current = true // Set mounted flag to true after mounting
    }
  }, [verifiedTokens, wallets])

  const sendData = async (_event) => {
    const walletResult = wallets?.find((wallet) => wallet?.address?.toLowerCase() === _event?.owner?.toLowerCase())
    const tokenIn = verifiedTokens[_event?.inputToken?.symbol?.toLowerCase()] as any
    const tokenOut = verifiedTokens[_event?.outputToken?.symbol?.toLowerCase()] as any

    const getTokenInPrice = await triggerGetPrice({
      params: {
        cryptocurrencyId: tokenIn?.publicId ?? null,
        fiatCurrency: 'USD',
        date: new Date().toISOString()
      }
    })

    const getTokenOutPrice = await triggerGetPrice({
      params: {
        cryptocurrencyId: tokenOut?.publicId,
        fiatCurrency: 'USD',
        date: new Date().toISOString()
      }
    })

    triggerSendAnalysis({
      eventType: 'TOKEN_SWAP',
      metadata: {
        blockchainId: selectedChain?.id,
        walletId: walletResult?.id,
        walletAddress: _event.owner,
        tokenInId: tokenIn?.publicId ?? null,
        tokenInSymbol: _event?.inputToken?.tokenInSymbol,
        tokenInQuantity: ethers.utils.formatUnits(_event?.inputAmount, _event.inputToken?.decimals),
        tokenInFiatAmount: getTokenInPrice?.data ?? null,
        tokenOutId: tokenOut?.publicId ?? null,
        tokenOutSymbol: _event?.outputToken?.tokenOutSymbol,
        tokenOutQuantity: ethers.utils.formatUnits(_event?.outputAmount, _event.outputToken?.decimals),
        tokenOutFiatAmount: getTokenOutPrice?.data ?? null,
        transactionHash: _event?.orderCreationHash
      }
    })
  }
  return (
    <div className="Uniswap">
      <Header>
        <Header.Left.Title>Swap</Header.Left.Title>
      </Header>
      <View.Content>
        <section id="swap-widget" className="grid place-items-center" />
      </View.Content>
    </div>
  )
}

export default CowSwap
