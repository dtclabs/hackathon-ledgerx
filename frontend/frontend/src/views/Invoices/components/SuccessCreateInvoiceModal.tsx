import React from 'react'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import SuccessIcon from '@/public/svg/icons/success-icon.svg'
import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import Button from '@/components-v2/atoms/Button'
import { toast } from 'react-toastify'

interface ISuccessCreateModalProps {
  provider: any
  handleOnClose: () => void
  invoiceNumber: string
  invoiceUrl: string
}

const SuccessCreateInvoiceModal: React.FC<ISuccessCreateModalProps> = ({
  provider,
  handleOnClose,
  invoiceUrl,
  invoiceNumber
}) => (
  <BaseModal provider={provider} width="650">
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={SuccessIcon} />
      <BaseModal.Header.Title>Successfully created an invoice</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton onClose={handleOnClose} />
    </BaseModal.Header>
    <BaseModal.Body>
      <div>
        <Typography color="secondary">You have created Invoice #{invoiceNumber}.</Typography>
      </div>
      <div className="mt-5 flex flex-row gap-2 pb-4">
        <TextField name="invoice-url" disabled value={invoiceUrl} />
        <Button
          variant="black"
          width="w-[100px]"
          height={48}
          label="Copy"
          onClick={() => {
            toast.success('Copied URL successfully', {
              position: 'top-right',
              pauseOnHover: false
            })
            navigator.clipboard.writeText(`${invoiceUrl}`)
          }}
        />
      </div>
    </BaseModal.Body>
    {/* <BaseModal.Footer>
      <input />
      <BaseModal.Footer.PrimaryCTA onClick={() => console.log('copy')} label="Copy" />
    </BaseModal.Footer> */}
  </BaseModal>
)

export default SuccessCreateInvoiceModal
