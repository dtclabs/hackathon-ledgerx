/* eslint-disable react/no-unescaped-entities */
import { FC } from 'react'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'

interface IProps {
  provider: any
  token: string
  sourceWalletName: string
  handleTokenApprovalForSourceWallet: () => void
  handleOnClickCancelForApproval: () => void
  tokenApprovalLoading: boolean
}

const TokenApprovalModal: FC<IProps> = ({
  provider,
  token,
  sourceWalletName,
  handleTokenApprovalForSourceWallet,
  handleOnClickCancelForApproval,
  tokenApprovalLoading
}) => (
  <BaseModal provider={provider} classNames="w-[600px] flex flex-col">
    <BaseModal.Header extendedClass="border-b pb-4 !items-start">
      <BaseModal.Header.Title wraperClassName="max-w-[500px]">
        You&apos;re making the payment in {token}. Please enable {token} support for {sourceWalletName} to proceed.
      </BaseModal.Header.Title>
      <BaseModal.Header.CloseButton onClose={handleOnClickCancelForApproval} disabled={tokenApprovalLoading} />
    </BaseModal.Header>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        label="Cancel"
        onClick={handleOnClickCancelForApproval}
        disabled={tokenApprovalLoading}
      />
      <BaseModal.Footer.PrimaryCTA
        label={`Enable ${token} support`}
        onClick={handleTokenApprovalForSourceWallet}
        disabled={tokenApprovalLoading}
        // @ts-ignore
        loadingWithLabel={tokenApprovalLoading}
      />
    </BaseModal.Footer>
  </BaseModal>
)

export default TokenApprovalModal
