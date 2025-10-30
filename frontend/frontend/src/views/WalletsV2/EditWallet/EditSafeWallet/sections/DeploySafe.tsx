import { FC, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toast } from 'react-toastify'
import { useUpdateWalletWithoutInvalidationMutation } from '@/slice/wallets/wallet-api'
import useSafeDuplicateHook from '../hooks/useSafeDuplicateHook'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { ModalDeploySafe } from '@/views/WalletsV2/components/ModalDeploySafe'
import { ModalDeploySyncError } from '@/views/WalletsV2/components/ModalDeploySyncError'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import ReactTooltip from 'react-tooltip'


const BLACKLISTED_CHAINS = ['gnosis_chain', 'sepolia']
interface IDuplicateSafeSectionProps {
  wallet: any
  isAuthorized: boolean
  deployedChains: string[]
}

function isChainBlacklisted(chain) {
  return BLACKLISTED_CHAINS.includes(chain.toLowerCase())
}

function isDeployedChainBlacklisted(deployedChains) {
  if (deployedChains.length === 1) {
    const chain = deployedChains[0]
    return isChainBlacklisted(chain.toLowerCase())
  }
  return false
}

const DuplicateSafeSection: FC<IDuplicateSafeSectionProps> = ({ wallet, isAuthorized, deployedChains }) => {
  const router = useRouter()

  const organizationId = useOrganizationId()
  const { isSyncing } = useWalletSync({ organisationId: organizationId })
  const [updateWallet, updateWalletResponse] = useUpdateWalletWithoutInvalidationMutation()
  const duplicateSafeModalProvider = useModalHook({})
  const modalSyncErrorModalProvider = useModalHook({})

  const isBaseChainBlacklisted = isDeployedChainBlacklisted(deployedChains)
 
  const {
    resyncChainData,
    checkTargetNetworkIsAvailable,
    isCheckingTargetNetwork,
    safeExists,
    checkSafeDeployedSuccessfully,
    isPendingTransaction,
    switchNetworkToTargetChain,
    triggerSafeDeployTransaction,
    setIsPendingTransaction,
    availableChains,
    targetChain,
    setTargetChain,
    isConnectedAccountCreator,
    resetState,
    step
  } = useSafeDuplicateHook({
    wallet: { address: wallet?.address, blockchainId: wallet?.metadata.map((item) => item.blockchainId) }
  })

  useEffect(() => {
    if (updateWalletResponse.isSuccess) {
      setIsPendingTransaction(false)
      resetState()
      duplicateSafeModalProvider.methods.setIsOpen(false)
      modalSyncErrorModalProvider.methods.setIsOpen(false)
      router.push(`/${organizationId}/wallets/${wallet?.id}`)
      toast.success('Wallet updated successfully')
    } else if (updateWalletResponse.isError) {
      setIsPendingTransaction(false)
      toast.error(
        updateWalletResponse.error?.data?.message ?? updateWalletResponse.error?.message ?? 'Sorry, an error occurred'
      )
    }
  }, [updateWalletResponse.isSuccess, updateWalletResponse.isError])

  const handleOpenDeployModal = () => {
    duplicateSafeModalProvider.methods.setIsOpen(true)
  }

  const handleCloseModal = () => {
    setTargetChain('')
    resetState()
  }

  const handleSelectChain = (chain) => setTargetChain(chain.id)

  const handleOnClickPrimaryButton = async (_chain) => {
    try {
      if (step === 'network-selection') {
        setTargetChain(_chain)
        const isNetworkChanged = await switchNetworkToTargetChain({ targetNetworkId: _chain })
        if (isNetworkChanged) {
          await checkTargetNetworkIsAvailable(_chain)
        }
      } else if (step === 'deploying-safe') {
        setIsPendingTransaction(true)
        if (safeExists) {
          updateWallet({
            orgId: organizationId,
            payload: {
              name: wallet?.name,
              flagged: wallet?.flagged,
              supportedBlockchains: [...wallet.supportedBlockchains, targetChain],
              walletGroupId: wallet?.group?.id
            },
            id: wallet?.id
          })
        } else {
          const _creationByteCode = wallet?.metadata[0]?.creationTransactionInput
          // await checkTargetNetworkIsAvailable(_chain)
          await triggerSafeDeployTransaction({ transaction: _creationByteCode })
          const result = await checkSafeDeployedSuccessfully({ targetNetworkId: targetChain, address: wallet?.address })
          if (result) {
            // Adding this for now as BE doesnt get updated wallet immediately
            updateWallet({
              orgId: organizationId,
              payload: {
                name: wallet?.name,
                flagged: wallet?.flagged,
                supportedBlockchains: [...wallet.supportedBlockchains, targetChain],
                walletGroupId: wallet?.group?.id
              },
              id: wallet?.id
            })
          } else {
            duplicateSafeModalProvider.methods.setIsOpen(false)
            modalSyncErrorModalProvider.methods.setIsOpen(true)
            toast.error('Safe was succesfully deployed but could not be verified. Please try to sync the data.')
            setIsPendingTransaction(false)
          }
        }
      }
    } catch (e: any) {
      setIsPendingTransaction(false)
      toast.error(e.message)
    }
  }

  const resyncSafeDeployment = async () => {
    if (safeExists) {
      updateWallet({
        orgId: organizationId,
        payload: {
          name: wallet?.name,
          flagged: wallet?.flagged,
          supportedBlockchains: [...wallet.supportedBlockchains, targetChain],
          walletGroupId: wallet?.group?.id
        },
        id: wallet?.id
      })
    } else {
      const isSafeFound = await resyncChainData(targetChain)
      if (!isSafeFound) {
        toast.error('Safe data not found on target network. Please try again.')
      }
    }
  }

  
  return (
    <div data-for="disabled-add-chain-safe" data-tip="disabled-add-chain-safe">
      <Button
        height={32}
        variant="grey"
        disabled={isPendingTransaction || !isAuthorized || isSyncing || isBaseChainBlacklisted}
        label="Add another chain"
        classNames="gap-3"
        onClick={handleOpenDeployModal}
        leadingIcon={<Image src={AddIcon} width={10} height={10} alt="add" />}
      />
      {(!isAuthorized || isBaseChainBlacklisted) && (
        <ReactTooltip
          id="disabled-add-chain-safe"
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg"
          place="top"
        >
          {isBaseChainBlacklisted
            ? 'Safe created on this network is not compatible to deploy on other networks'
            : isSyncing
            ? 'Wallet is currently syncing'
            : 'You are not authorized to add another chain'}
        </ReactTooltip>
      )}
      <ModalDeploySafe
        provider={duplicateSafeModalProvider}
        step={step}
        onClickPrimary={handleOnClickPrimaryButton}
        isCheckingTargetNetwork={isCheckingTargetNetwork}
        onClickSelectChain={handleSelectChain}
        availableChainsToDeploy={availableChains()}
        isApiLoading={updateWalletResponse.isLoading || isPendingTransaction || isCheckingTargetNetwork}
        targetNetwork={targetChain}
        safeExists={safeExists}
        isConnectedAccountCreator={isConnectedAccountCreator}
        onClickClose={handleCloseModal}
      />
      <ModalDeploySyncError
        provider={modalSyncErrorModalProvider}
        isLoading={isCheckingTargetNetwork || updateWalletResponse.isLoading}
        address={wallet.address}
        onClickClose={handleCloseModal}
        onClickPrimary={resyncSafeDeployment}
        targetNetwork={targetChain}
        safeExists={safeExists}
      />
    </div>
  )
}

export default DuplicateSafeSection
