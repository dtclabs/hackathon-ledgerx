/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { FormGroup, TextInput } from '@/components-v2/molecules/Forms'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import { useForm } from 'react-hook-form'

const RequestIntegrationModal = ({
  provider,
  onClickSubmitRequest,
  isLoading,
  selectedTransactions,
  totalTransactions
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues: { email: '' } })
  const [selectedOption, setSelectedOption] = useState('')
  useEffect(() => {
    reset()
  }, [provider.state.isOpen])

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value)
  }

  const handleOnClick = () => {
    // provider.methods.setIsOpen(false)
    onClickSubmitRequest(selectedOption)
  }

  return (
    <form onSubmit={handleSubmit(onClickSubmitRequest)}>
      <BaseModal provider={provider} width="650">
        <BaseModal.Header>
          <BaseModal.Header.HeaderIcon icon={XeroLogoIcon} />
          <BaseModal.Header.Title>Export to Xero</BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="secondary" variant="body2" classNames="pr-20">
            ledgerx.com will automatically create manual journals for you on Xero based on the exported transactions and
            their mapped accounts.
          </Typography>
          <div className="mt-4">
            <div className="flex flex-col space-y-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="export-all"
                  checked={selectedOption === 'export-all'}
                  onChange={handleOptionChange}
                  className="form-radio text-indigo-600 h-5 w-5 mr-4"
                />
                <Typography variant="body2" color="secondary">
                  <span style={{ color: '#2D2D2C' }}>Export all transactions ({totalTransactions} transactions)</span>
                  <br />
                  Note: May result in duplicated Xero Manual Journal entries.
                </Typography>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="export-remaining"
                  checked={selectedOption === 'export-remaining'}
                  onChange={handleOptionChange}
                  className="form-radio text-indigo-600 h-5 w-5 mr-4"
                />
                <Typography variant="body2" color="secondary">
                  Export all transactions that have not been exported (N/A transactions)
                </Typography>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="export-selected"
                  checked={selectedOption === 'export-selected'}
                  onChange={handleOptionChange}
                  className="form-radio text-indigo-600 h-5 w-5 mr-4"
                />
                <Typography variant="body2" color="secondary">
                  <span style={{ color: '#2D2D2C' }}>
                    {' '}
                    Only export selected transactions ({selectedTransactions} transactions)
                  </span>
                  <br />
                  Note: May result in duplicated Xero Manual Journal entries.
                </Typography>
              </label>
            </div>
          </div>
        </BaseModal.Body>
        <BaseModal.Footer>
          <BaseModal.Footer.PrimaryCTA onClick={handleOnClick} label="OK" />
        </BaseModal.Footer>
      </BaseModal>
    </form>
  )
}

export default RequestIntegrationModal
