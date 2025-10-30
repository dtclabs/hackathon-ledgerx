import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Loader from '@/public/svg/dot-loader.svg'

interface ILoadingPopUp {
  provider: any
  title: string
  decription?: any
}

const LoadingPopUp: React.FC<ILoadingPopUp> = ({ provider, title, decription }) => (
  <BaseModal provider={provider} width="550">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={Loader} className="animate-spin" />
      <BaseModal.Header.Title>{title}</BaseModal.Header.Title>
    </BaseModal.Header>
    <BaseModal.Body>
      {decription && (
        <div className="pl-14">
          <Typography color="secondary" variant="body2">
            {decription}
          </Typography>
        </div>
      )}
    </BaseModal.Body>
  </BaseModal>
)

export default LoadingPopUp
