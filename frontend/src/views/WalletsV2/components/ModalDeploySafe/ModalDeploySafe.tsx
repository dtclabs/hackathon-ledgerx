import { LoaderLX } from '@/components-v2/LoaderLX'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { selectChainByNameMap } from '@/slice/chains/chain-selectors'
import { useAppSelector } from '@/state'
import { useWeb3React } from '@web3-react/core'
import { FC, useState } from 'react'
import { DeploySafe, SafeExists } from './sections'
import ConnectWallet from './sections/ConnectWallet'
import SelectDeployChain from './sections/SelectDeployChain'
import { ISafeDeployStage } from '../../EditWallet/EditSafeWallet/hooks/useSafeDuplicateHook'

interface IModalDeploySafeProps {
  provider: any
  isCheckingTargetNetwork: boolean
  isApiLoading: boolean
  availableChainsToDeploy: any[]
  safeExists: boolean
  targetNetwork: string
  onClickClose: () => void
  onClickPrimary: (_chain?: string) => void
  onClickSelectChain: (_chain: string) => void
  isConnectedAccountCreator: string
  step: ISafeDeployStage
}

const ModalDeploySafe: FC<IModalDeploySafeProps> = ({
  provider,
  step,
  onClickClose,
  onClickSelectChain,
  onClickPrimary,
  isCheckingTargetNetwork,
  isApiLoading,
  targetNetwork,
  safeExists,
  isConnectedAccountCreator,
  availableChainsToDeploy
}) => {
  const { account } = useWeb3React()

  const targetChain = useAppSelector(selectChainByNameMap)[targetNetwork]

  const handleOnClose = () => {
    provider.methods.setIsOpen(false)
    onClickClose()
  }

  const handleSelectChain = (_chain) => () => onClickSelectChain(_chain)

  const handleClickPrimaryButton = () => onClickPrimary(targetNetwork)

  const renderButtonLabel = () => {
    if (!account || !targetNetwork) return 'Next'
    if (safeExists) return 'Import Safe'
    if (step === 'network-selection' || step === 'deploying-safe') return `Add Safe on ${targetChain?.name}`
    return 'Next'
  }

  return (
    <BaseModal provider={provider} width="720" classNames="rounded-3xl w-[720px]">
      <BaseModal.Header>
        {/* <BaseModal.Header.HeaderIcon className="animate-spin" /> */}
        <BaseModal.Header.Title>Add a Chain</BaseModal.Header.Title>
      </BaseModal.Header>
      <BaseModal.Body>
        {!account ? (
          <ConnectWallet ownerAddress={isConnectedAccountCreator} />
        ) : step === 'network-selection' ? (
          <SelectDeployChain
            availableChainsToDeploy={availableChainsToDeploy}
            targetChain={targetChain?.id}
            handleOnClickChain={handleSelectChain}
          />
        ) : isCheckingTargetNetwork ? (
          <div className=" h-[175px] flex justify-center">
            <LoaderLX size="sm" displayLogo={false} title="Fetching safe info..." />
          </div>
        ) : safeExists ? (
          <SafeExists targetNetwork={targetNetwork} safeInfo={safeExists} />
        ) : (
          <DeploySafe targetChainName={targetChain?.name} connectedAccountOriginalOwner={isConnectedAccountCreator} />
        )}
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA label="Cancel" onClick={handleOnClose} disabled={isApiLoading} />
        <BaseModal.Footer.PrimaryCTA
          onClick={handleClickPrimaryButton}
          disabled={isApiLoading || isCheckingTargetNetwork || !targetChain}
          loadingWithLabel={isApiLoading}
          label={renderButtonLabel()}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default ModalDeploySafe
