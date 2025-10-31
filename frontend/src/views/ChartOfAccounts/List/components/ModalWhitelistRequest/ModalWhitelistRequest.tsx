import React, { useEffect } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { FormGroup, TextInput } from '@/components-v2/molecules/Forms'
import { useForm } from 'react-hook-form'
import { IntegrationName, integrationNameMap } from '@/api-v2/organization-integrations'

// This modal is the first step of onboarding a new user to Xero integration
// The user will submit their request to be whitelisted - upon approval they can continue to the next step

const ModalWhitelistRequest = ({
  provider,
  onClickSubmitRequest,
  isLoading,
  integrationType = 'xero'
}: {
  provider: any
  onClickSubmitRequest: (_requestData) => void
  isLoading: boolean
  integrationType?: string
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues: { email: '' } })

  useEffect(() => {
    if (!provider.state.isOpen) {
      reset()
    }
  }, [provider.state.isOpen])

  return (
    <form onSubmit={handleSubmit(onClickSubmitRequest)}>
      <BaseModal provider={provider} width="600">
        <BaseModal.Header>
          <BaseModal.Header.Title>
            Submit request for {integrationType ? integrationNameMap[integrationType] : null}
          </BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body>
          <div className="pr-24">
            <Typography color="secondary" variant="body2">
              The team will reach out to you on your registered email within 1-2 business days. Please confirm that you
              are contactable via the email address below.
            </Typography>
          </div>
          <FormGroup
            extendClass="mt-6"
            label="E-mail"
            required
            id="email"
            error={errors?.email ? String(errors?.email?.message) : ''}
          >
            <TextInput
              placeholder="Enter your email address"
              register={register('email', { required: { value: true, message: 'E-mail is required' } })}
              id="email"
            />
          </FormGroup>
        </BaseModal.Body>
        <BaseModal.Footer extendedClass="flex-col items-center">
          <BaseModal.Footer.PrimaryCTA
            disabled={isLoading}
            type="submit"
            onClick={handleSubmit(onClickSubmitRequest)}
            label="Submit Request"
          />
          {integrationType === IntegrationName.TRIPLE_A && (
            <Typography classNames="w-full flex justify-center">
              By submitting, you agree to TripleA&rsquo;s&nbsp;
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://triple-a.io/privacy-and-terms-policy/"
              >
                <Typography variant="body2">Terms of Use</Typography>
              </a>
              &nbsp;and&nbsp;
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://triple-a.io/privacy-and-terms-policy/"
              >
                <Typography variant="body2">Privacy Policy</Typography>
              </a>
              .
            </Typography>
          )}
        </BaseModal.Footer>
      </BaseModal>
    </form>
  )
}

export default ModalWhitelistRequest
