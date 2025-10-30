import * as Yup from 'yup'
import React, { FC, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { FormGroup, TextInput } from '@/components-v2/molecules/Forms'
import Dropdown from '@/components-v2/atoms/Dropdown'
import { useForm } from 'react-hook-form'
import { ACCOUNT_TYPE } from '../CreateAccountModal/CreateAccountModal'

interface IEditAccountForm {
  code: string
  name: string
  type: string
  description: string
}

interface IEditAccountModal {
  provider: any
  onClickPrimary: (data: IEditAccountForm) => void
  isLoading: boolean
  account: { id: any; code: string; name: string; type: string; description: string }
}

const validationSchema = Yup.object().shape({
  code: Yup.string().required('Code is required').typeError('Code is required').trim(),
  name: Yup.string().required('Name is required').trim(),
  type: Yup.string().required('Type is required').trim(),
  description: Yup.string().trim().nullable()
})

const EditAccountModal: FC<IEditAccountModal> = ({ provider, onClickPrimary, isLoading, account }) => {
  const { register, handleSubmit, formState, setValue, reset, watch } = useForm<IEditAccountForm>({
    defaultValues: {
      code: account?.code,
      name: account?.name,
      type: account?.type,
      description: account?.description
    },
    reValidateMode: 'onBlur',
    resolver: yupResolver(validationSchema)
  })

  useEffect(() => {
    reset({
      code: account?.code,
      name: account?.name,
      type: account?.type.toUpperCase(),
      description: account?.description
    })
  }, [account])

  const onSubmit = (_data: IEditAccountForm) => onClickPrimary(_data)

  const onClickCancel = () => {
    reset()
    provider.methods.setIsOpen(false)
  }

  const handleOnSelect = ({ value }) => {
    setValue('type', value, { shouldValidate: true })
  }
  const handleOnChange = (e) => {
    setValue(e.target.id, e.target.value, { shouldValidate: true })
  }

  return (
    <BaseModal provider={provider} width="600">
      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseModal.Header>
          <BaseModal.Header.Title>Edit Account</BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="secondary" variant="body2">
            Edit account to tag your transactions accordingly.
          </Typography>
          <div className="mt-6 flex flex-col gap-6">
            <FormGroup error={formState?.errors?.code?.message} required label="Code">
              <TextInput id="code" onChange={handleOnChange} value={watch('code')} />
            </FormGroup>
            <FormGroup error={formState?.errors?.name?.message} required label="Name">
              <TextInput id="name" onChange={handleOnChange} value={watch('name')} />
            </FormGroup>
            <FormGroup error={formState?.errors?.type?.message} required label="Type">
              <Dropdown
                onChange={handleOnSelect}
                width="100%"
                options={ACCOUNT_TYPE}
                value={
                  watch('type') && ACCOUNT_TYPE.find((type) => type.label.toLowerCase() === watch('type').toLowerCase())
                }
              />
            </FormGroup>
            <FormGroup error={formState?.errors?.description?.message} label="Description">
              <TextInput id="description" onChange={handleOnChange} value={watch('description')} />
            </FormGroup>
          </div>
        </BaseModal.Body>
        <BaseModal.Footer>
          <BaseModal.Footer.SecondaryCTA disabled={isLoading} onClick={onClickCancel} label="Cancel" />
          <BaseModal.Footer.PrimaryCTA disabled={isLoading} type="submit" label="Save" />
        </BaseModal.Footer>
      </form>
    </BaseModal>
  )
}

export default EditAccountModal
