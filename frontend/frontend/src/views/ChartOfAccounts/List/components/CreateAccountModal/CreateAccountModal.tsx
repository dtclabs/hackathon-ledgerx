import * as Yup from 'yup'
import React, { FC, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { FormGroup, TextInput } from '@/components-v2/molecules/Forms'
import Dropdown from '@/components-v2/atoms/Dropdown'
import { useForm } from 'react-hook-form'

interface ICreateAccountForm {
  code: string
  name: string
  type: string
  description: string
}

interface IProps {
  provider: any
  onClickPrimary: (data: ICreateAccountForm) => void
  isLoading: boolean
}

export const ACCOUNT_TYPE = [
  { label: 'Asset', value: 'ASSET' },
  { label: 'Liability', value: 'LIABILITY' },
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Equity', value: 'EQUITY' },
  { label: 'Revenue', value: 'REVENUE' }
]

const validationSchema = Yup.object().shape({
  code: Yup.string().required('Code is required').trim(),
  name: Yup.string().required('Name is required').trim(),
  type: Yup.string().required('Type is required').trim(),
  description: Yup.string().trim()
})

const CreateAccountModal: FC<IProps> = ({ provider, onClickPrimary, isLoading }) => {
  const { register, handleSubmit, formState, setValue, reset, watch } = useForm<ICreateAccountForm>({
    resolver: yupResolver(validationSchema),
    reValidateMode: 'onBlur'
  })

  useEffect(() => {
    if (!provider.state.isOpen) {
      reset()
    }
  }, [provider.state.isOpen])

  const onSubmit = (_data: ICreateAccountForm) => onClickPrimary(_data)

  const onClickCancel = () => {
    reset()
    provider.methods.setIsOpen(false)
  }

  const handleOnChange = ({ value }) => {
    setValue('type', value, { shouldValidate: true })
  }
  const handleOnType = (e) => {
    setValue(e.target.id, e.target.value, { shouldValidate: true })
  }
  return (
    <BaseModal provider={provider} width="600">
      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseModal.Header>
          <BaseModal.Header.Title>Create New Account</BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="secondary" variant="body2">
            Create a new account to tag your transactions accordingly.
          </Typography>
          <div className="mt-6 flex flex-col gap-6">
            <FormGroup error={formState?.errors?.code?.message} required label="Code">
              <TextInput id="code" onChange={handleOnType} />
            </FormGroup>
            <FormGroup error={formState?.errors?.name?.message} required label="Name">
              <TextInput id="name" onChange={handleOnType} />
            </FormGroup>
            <FormGroup error={formState?.errors?.type?.message} required label="Type">
              <Dropdown
                onChange={handleOnChange}
                width="100%"
                options={ACCOUNT_TYPE}
                value={ACCOUNT_TYPE.find((type) => type.label.toLowerCase() === watch('type')?.toLowerCase()) ?? null}
              />
              {/* <Dropdown  colorVariant="light" options={[{ value: 'LIABILITY', label: 'Liability' }]} /> */}
            </FormGroup>
            <FormGroup error={formState?.errors?.description?.message} label="Description">
              <TextInput register={register('description')} />
            </FormGroup>
          </div>
        </BaseModal.Body>
        <BaseModal.Footer>
          <BaseModal.Footer.SecondaryCTA disabled={isLoading} onClick={onClickCancel} label="Cancel" />
          <BaseModal.Footer.PrimaryCTA disabled={isLoading || !formState.isValid} type="submit" label="Create" />
        </BaseModal.Footer>
      </form>
    </BaseModal>
  )
}

export default CreateAccountModal
