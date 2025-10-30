/* eslint-disable react/no-unescaped-entities */
import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import WarningIcon from '@/public/svg/icons/round-warning.svg'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'

import { useWatch } from 'react-hook-form'

import { useAppSelector } from '@/state'

import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { selectVerifiedCryptocurrencyIdMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'

interface IProps {
  provider: any
  handleTokenApproval: () => void
  handleCancelApproval: () => void
  isLoading: boolean
}

const TokenApprovalModal: FC<IProps> = ({ provider, handleTokenApproval, handleCancelApproval, isLoading }) => {
  const walletMap = useAppSelector(selectWalletMapById)
  const verifiedCryptocurrencyMap = useAppSelector(selectVerifiedCryptocurrencyIdMap)
  const sourceWalletId = useWatch({ name: 'sourceWalletId' })
  const recipient = useWatch({ name: 'recipients.0' })
  const walletName = walletMap[sourceWalletId]?.name
  const tokenName = verifiedCryptocurrencyMap[recipient?.tokenId]?.symbol || 'USDC' //

  return (
    <BaseModal provider={provider} classNames="w-[600px] flex flex-col">
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon icon={WarningIcon} />
        <BaseModal.Header.Title>Complete {tokenName} Approval</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton onClose={handleCancelApproval} disabled={isLoading} />
      </BaseModal.Header>
      <BaseModal.Body>
        <Typography variant="body1">
          To enable bulk payments from <span className="font-bold">{walletName}</span> in {tokenName} through Disperse,
          please approve the ERC20 contract below. Your approval will ensure efficient processing of your payments.
        </Typography>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA label="Cancel" onClick={handleCancelApproval} disabled={isLoading} />
        <BaseModal.Footer.PrimaryCTA
          label={`Enable ${tokenName} support`}
          onClick={handleTokenApproval}
          disabled={isLoading}
          loadingWithLabel={isLoading}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default TokenApprovalModal
