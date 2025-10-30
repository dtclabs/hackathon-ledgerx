import { useWeb3React } from '@web3-react/core'
import { FC, useRef } from 'react'

import { useAppSelector } from '@/state'
import useCreatePayment from '@/views/Transfer/hooks/useCreatePayment'
import { usePaymentFormLogic } from '@/views/Transfer/hooks/usePaymentForm'

import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'

import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'

import { ModalChangeSource } from '@/views/Transfer/components'
import WalletConnectionStatus from './WalletConnectionStatus'
import SelectOrConnectWallet from './SelectOrConnectWallet'

interface ISectionSourceWalletProps {
  isInitialized: boolean
}

const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT

const SourceWalletSection: FC<ISectionSourceWalletProps> = ({ isInitialized }) => {
  const { account } = useWeb3React()
  const tempSourceWallet = useRef(null)

  const { setValue, formState, handleOnChangeSourceWallet, watch } = usePaymentFormLogic()
  const { selectedSource, sourcesTotalBasedOnChain, isSourcesLoading } = useCreatePayment({
    selectedSourceId: watch('sourceWalletId')
  })

  const supportedChains = useAppSelector(supportedChainsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const walletSwitchModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const handleOnClickConfirmSwitch = () => {
    // On confirmation - Change the source to the temp source
    setValue('sourceWalletId', tempSourceWallet.current)
    walletSwitchModalProvider.methods.setIsOpen(false)
    tempSourceWallet.current = null
  }

  // TODO - Why does this all need to be passed? It can be derived later
  const parsedChainData = (supportedChains || [])?.map((chain) => ({
    value: chain.chainId,
    label: chain.name,
    imageUrl: chain.imageUrl,
    rpcUrl: chain.rpcUrl,
    safeUrl: chain.safeUrl,
    symbol: chain.symbol
  }))

  const handleOnChange = async (_value) => {
    const result = await handleOnChangeSourceWallet({ id: _value?.id })
    if (result.isSuccess === false) {
      if (result.error.type === 'MixedTokensNotAllowed') {
        tempSourceWallet.current = _value?.id
        walletSwitchModalProvider.methods.setIsOpen(true)
      }
      // TODO - Handle unexpected error
    }
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
      <ModalChangeSource provider={walletSwitchModalProvider} onClickPrimary={handleOnClickConfirmSwitch} />
    </div>
  )
}

export default SourceWalletSection
