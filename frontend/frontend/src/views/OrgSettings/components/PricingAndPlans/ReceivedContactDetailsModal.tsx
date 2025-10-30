import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useRouter } from 'next/router'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useEffect, useMemo, useState } from 'react'
import checkGreenCircle from '@/public/svg/check-green-circle.svg'

const ReceivedContactDetailsModal = ({ provider, isCancel }) => (
  <BaseModal provider={provider} classNames="rounded-3xl" width="600">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={checkGreenCircle} />
      <BaseModal.Header.Title>{isCancel ? 'Request Received' : 'Contact details received'}</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography variant="body2" classNames="mt-2 max-w-[372px]" color="secondary">
        {isCancel
          ? 'Your request to cancel your plan has been received by our team. We will contact you within 3 business days.'
          : 'Your contact details has been received by our team. We will contact you within 3 business days to help with the plan activation.'}
      </Typography>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.PrimaryCTA label="OK" onClick={() => provider.methods.setIsOpen(false)} />
    </BaseModal.Footer>
  </BaseModal>
)

export default ReceivedContactDetailsModal
