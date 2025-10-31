import { useWeb3React } from '@web3-react/core'
import { FC } from 'react'

import { useAppSelector } from '@/state'
import useCreatePayment from '@/views/Transfer/hooks/useCreatePayment'

import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'

import useFiatPaymentLogicForm from '@/views/Transfer/hooks/useFiatPaymentForm/useFiatPaymentLogicForm'
import SelectOrConnectWallet from '../../../CreatePayment/components/SourceWalletSection/SelectOrConnectWallet'
import WalletConnectionStatus from '../../../CreatePayment/components/SourceWalletSection/WalletConnectionStatus'
import { CurrencyType } from '@/api-v2/payment-api'

interface ISectionSourceWalletProps {
  isInitialized: boolean
}

const SourceWalletSection: FC<ISectionSourceWalletProps> = () => {
  const { account } = useWeb3React()

  const { formState, handleOnChangeSourceWallet, watch } = useFiatPaymentLogicForm()
  const { selectedSource, sourcesTotalBasedOnChain, isSourcesLoading } = useCreatePayment({
    selectedSourceId: watch('sourceWalletId'),
    currencyType: CurrencyType.FIAT
  })

  const supportedChains = useAppSelector(supportedChainsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)

  const parsedChainData = (supportedChains || [])?.map((chain) => ({
    value: chain.chainId,
    label: chain.name,
    imageUrl: chain.imageUrl,
    rpcUrl: chain.rpcUrl,
    safeUrl: chain.safeUrl,
    symbol: chain.symbol
  }))

  const handleOnChange = async (_value) => {
    await handleOnChangeSourceWallet({ id: _value?.id })
  }

  const handleEmptySource = () =>
    isSourcesLoading ? (
      <div className="flex gap-6 my-6 items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
      </div>
    ) : (
      <div>No wallets found on this chain.</div>
    )

  return (
    <div className="w-full ">
      <WalletConnectionStatus account={account} parsedChainData={parsedChainData} />
      <SelectOrConnectWallet
        account={account}
        selectedChain={selectedChain}
        formState={formState}
        options={sourcesTotalBasedOnChain}
        handleEmptySource={handleEmptySource}
        handleOnChange={handleOnChange}
        selectedSourceWallet={selectedSource}
      />
    </div>
  )
}

export default SourceWalletSection
