import Link from 'next/link'

import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { selectChainByNameMap } from '@/slice/chains/chain-selectors'
import { useAppSelector } from '@/state'
import { FC } from 'react'
import { SafeExists } from '../ModalDeploySafe/sections'

interface IModalDeploySafeProps {
  provider: any
  isLoading: boolean
  targetNetwork: string
  address: string
  onClickClose: () => void
  onClickPrimary: (_chain?: string) => void
  safeExists: any
}

const ModalDeploySyncError: FC<IModalDeploySafeProps> = ({
  provider,
  onClickClose,
  onClickPrimary,
  isLoading,
  targetNetwork,
  address,
  safeExists
}) => {
  const targetChain = useAppSelector(selectChainByNameMap)[targetNetwork]

  const handleOnClose = () => {
    provider.methods.setIsOpen(false)
    onClickClose()
  }

  const handleClickPrimaryButton = () => onClickPrimary(targetNetwork)

  return (
    <BaseModal provider={provider} width="720" classNames="rounded-3xl w-[720px]">
      <BaseModal.Header>
        <BaseModal.Header.Title>Sync Error Occured</BaseModal.Header.Title>
      </BaseModal.Header>
      <BaseModal.Body>
        {safeExists ? (
          <SafeExists safeInfo={safeExists} targetNetwork={targetNetwork} />
        ) : (
          <>
            {' '}
            <Typography>
              Your new safe was successfully deployed, however there was an issue syncing the data
            </Typography>
            <br />
            <Typography>
              Sometimes it may take a few minutes for Safe to detect that a new safe has been created.
            </Typography>
            <Typography>
              You can view your smart contract wallet on chain{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href={`${targetChain?.blockExplorer}address/${address}`}
                className="text-[#404040] underline font-bold "
              >
                here
              </a>{' '}
              with a block explorer.
            </Typography>
            <br />
            <Typography>
              You can attempt to try again to sync the data again. If the problem persists, please try later.
            </Typography>
            <Typography variant="caption" color="secondary" classNames="mt-1">
              Note: You will not be required to process an on-chain transaction for this safe later.
            </Typography>
          </>
        )}
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA label="Cancel" onClick={handleOnClose} disabled={isLoading} />
        <BaseModal.Footer.PrimaryCTA
          onClick={handleClickPrimaryButton}
          disabled={isLoading}
          loadingWithLabel={isLoading}
          label={safeExists ? 'Import Safe' : `Sync safe data on ${targetChain?.name}`}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default ModalDeploySyncError
