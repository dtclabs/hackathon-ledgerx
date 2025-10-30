import React from 'react'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Typography from '@/components-v2/atoms/Typography'
import { useForm } from 'react-hook-form'
import { FormField, Input } from '@/components-v2'
import * as Yup from 'yup'
import Image from 'next/legacy/image'
import { yupResolver } from '@hookform/resolvers/yup'
import DtcpayLogo from '@/public/svg/logos/dtcpay-circle-logo.svg'

interface IDtcpayIntegrationModalProps {
  provider: any
  onClickSubmitRequest: (_data: any) => void
  isLoading: boolean
}

const validationSchema = Yup.object().shape({
  signKey: Yup.string().required('Please enter a sign key'),
  terminalId: Yup.string().required('Please enter a terminal ID'),
  merchantId: Yup.string().required('Please enter a merchant ID')
})

export const fakeApiCall = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('')
    }, 2000)
  })
const DTCPayIntegrationModal: React.FC<IDtcpayIntegrationModalProps> = ({
  provider,
  onClickSubmitRequest,
  isLoading
}) => {
  const {
    handleSubmit,
    watch,
    trigger,
    reset,
    getValues,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<any>({
    resolver: yupResolver(validationSchema),
    defaultValues: { signKey: '', terminalId: '', merchantId: '' }
  })

  const onSubmit = () => onClickSubmitRequest(getValues())

  const handleOnChange = (e: any) => {
    setValue(e.target.id, e.target.value)
    trigger(e.target.id)
  }

  const handleOnClose = () => {
    provider.methods.setIsOpen(false)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BaseModal provider={provider} width="600">
        <BaseModal.Header>
          <BaseModal.Header.HeaderIcon className="rounded-full" icon={DtcpayLogo} />
          <BaseModal.Header.Title>dtcpay Integration</BaseModal.Header.Title>
          <BaseModal.Header.CloseButton onClose={handleOnClose} />
        </BaseModal.Header>
        <BaseModal.Body>
          <div className="pr-4 mt-4">
            <div className="max-w-[90%]">
              <Typography color="secondary">
                Generate invoices that offer both fiat and crypto payment methods to your customers.
              </Typography>
            </div>

            <div className="mt-6">
              <FormField label="Merchant ID" isRequired error={errors?.merchantId?.message}>
                <Input
                  id="merchantId"
                  onChange={handleOnChange}
                  value={watch('merchantId')}
                  placeholder="Please enter your merchant ID..."
                />
              </FormField>
              <FormField className="mt-6 mb-6" label="Terminal ID" isRequired error={errors?.terminalId?.message}>
                <Input
                  id="terminalId"
                  onChange={handleOnChange}
                  value={watch('terminalId')}
                  placeholder="Please enter your terminal ID..."
                />
              </FormField>
              <FormField className=" mb-4" label="Sign Key" isRequired error={errors?.signKey?.message}>
                <Input
                  id="signKey"
                  onChange={handleOnChange}
                  value={watch('signKey')}
                  placeholder="Please enter your sign key..."
                />
              </FormField>
            </div>
          </div>
        </BaseModal.Body>
        <BaseModal.Footer>
          <BaseModal.Footer.SecondaryCTA
            disabled={isLoading}
            onClick={() => {
              reset()
              provider.methods.setIsOpen(false)
            }}
            label="Cancel"
          />

          <BaseModal.Footer.PrimaryCTA
            disabled={isLoading}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            label="Confirm"
          />
        </BaseModal.Footer>
      </BaseModal>
    </form>
  )
}

export default DTCPayIntegrationModal
