import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '../Modals/BaseModal'
import { useEffect } from 'react'
import { useUpdateAuthenticatedAccountMutation } from '@/api-v2/account-api'
import { useForm } from 'react-hook-form'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'

const PromptModal = ({ provider }) => {
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [updateAccountApi, updateAccountRes] = useUpdateAuthenticatedAccountMutation()

  const { handleSubmit } = useForm({
    defaultValues: {
      isAccepted: true
    }
  })

  useEffect(() => {
    if (updateAccountRes.isSuccess) {
      provider.methods.setIsOpen(false)
      triggerSendAnalysis({
        eventType: 'CLICK',
        metadata: {
          action: 'tos_accepted'
        }
      })
    }
  }, [updateAccountRes.isSuccess])

  const handleOnSubmit = () => {
    updateAccountApi({
      agreementSignedAt: new Date().toISOString()
    })
  }

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <BaseModal provider={provider} width="600" classNames="rounded-3xl">
        <BaseModal.Header extendedClass="mt-8">
          <BaseModal.Header.Title className="whitespace-pre text-center" wraperClassName="w-full">
            {'We have updated our\nTerms of Service and Privacy Policy'}
          </BaseModal.Header.Title>
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="primary" variant="body2" classNames="text-center mt-4 -mb-4">
            By continuing, you agree to our{' '}
            <a
              href="https://www.ledgerx.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://www.ledgerx.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Privacy Policy
            </a>
            .
          </Typography>
        </BaseModal.Body>
        <BaseModal.Footer extendedClass="justify-center border-none pt-1">
          <BaseModal.Footer.PrimaryCTA type="submit" label="Continue" classNames="w-fit" />
        </BaseModal.Footer>
      </BaseModal>
    </form>
  )
}

export default PromptModal
