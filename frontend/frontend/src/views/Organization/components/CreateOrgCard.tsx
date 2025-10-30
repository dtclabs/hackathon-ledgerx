/* eslint-disable no-useless-escape */
/* eslint-disable react/no-array-index-key */
import { EOrganizationType } from '@/slice/organization/organization.types'
import { FC, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, FormField, Input, Typography } from '@/components-v2'
import TypographyAtom from '@/components-v2/atoms/Typography'
// TODO: Create an atom
import { SearchableDropdown } from '@/views/OrgSettings/components/ReportingSetting'
import FormErrorLabel from '@/components/FormErrorLabel/FormErrorLabel'
import ContactDropdown from './ContactDropdown'
import Image from 'next/legacy/image'
import warning from '@/public/svg/light-warning-icon.svg'

interface ICreateOrgInfoCard {
  onClickSubmit: any
  onClickBack?: any
  height?: string
  width?: string
  className?: string
  title?: string
  nonSubtitle?: boolean
  onBack?: () => void
  renderBackBtn?: boolean
  btnClassName?: string
}

export interface ICreateOrgForm {
  name: string
  type: EOrganizationType
  role: { value: string; label: string }
  contacts: { provider: string; content: string }[]
}

export const validateEmail = (email) => {
  const emailRegex =
    /^[^<>()[\]\\,;:\%#^\s@\"$&!@]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}))$/gm
  if (!emailRegex.test(email)) {
    return false
  }
  return true
}

const validateWhatsapp = (value) => {
  const whatsApp =
    /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d*)\)?)[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?)+)(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i
  if (!whatsApp.test(value)) {
    return false
  }
  return true
}

const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Please enter a name for your organisation'),
  contacts: Yup.array()
    .of(
      Yup.object().shape({
        provider: Yup.string().required(),
        content: Yup.string().trim()
      })
    )
    .test(
      'checkContactRequired',
      'Please provide at least one point of contact for your personalised onboarding experience',
      (value) => value.some((contact) => contact.content.trim() !== '')
    )
    .test('validEmail', 'Please provide a valid email', (value) => {
      for (const item of value) {
        if (item.provider === 'Email' && item.content.trim() && !validateEmail(item.content.trim())) return false
      }
      return true
    })
    .test('validWhatsapp', 'Please provide a valid contact number', (value) => {
      for (const item of value) {
        if (item.provider === 'WhatsApp' && item.content.trim() && !validateWhatsapp(item.content.trim())) return false
      }
      return true
    })
})

const CreateOrgCard: FC<ICreateOrgInfoCard> = ({
  onClickSubmit,
  height = 'w-full',
  width = 'w-full',
  className,
  title,
  nonSubtitle,
  onBack,
  renderBackBtn,
  btnClassName
}) => {
  // const user = useAppSelector(userInfoSelector)

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<ICreateOrgForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type: EOrganizationType.DAO,
      name: '',
      role: { value: '', label: '' },
      contacts: [{ content: '', provider: 'Telegram' }]
    }
  })

  const [isClickSubmit, setIsClickSubmit] = useState(false)

  const role = useWatch({ control, name: 'role' })
  const {
    fields: contactFields,
    append: contactAppend,
    remove: contactRemove
  } = useFieldArray<ICreateOrgForm>({ control, name: 'contacts', keyName: 'id' })

  // useEffect(() => {
  //   if (user.email) {
  //     reset({
  //       type: EOrganizationType.DAO,
  //       name: '',
  //       role: { value: '', label: '' },
  //       contacts: [{ content: user.email, provider: 'Email' }]
  //     })
  //   }
  // }, [user.email])

  const handleSelectRole = (selectedRole) => {
    setValue('role', selectedRole)
  }

  // const handleOnClickBack = () => {
  //   reset()
  //   onClickBack()
  // }

  const handleAddAnotherContact = () => {
    contactAppend({
      provider: 'Telegram',
      content: ''
    })
  }

  const handleOnClickRemoveContact = (_index) => {
    const contacts = getValues('contacts')
    if (contacts.length > 1) {
      contactRemove(_index)
    } else {
      setValue('contacts.0.provider', 'Telegram')
      setValue('contacts.0.content', '')
    }
  }

  const rolesOptions = [
    { value: 'Chief Financial Officer', label: 'Chief Financial Officer (CFO)' },
    { value: 'Chief Executive Officer', label: 'Chief Executive Officer (CEO)' },
    { value: 'Operations Manager', label: 'Operations Manager' },
    { value: 'Finance Manager', label: 'Finance Manager' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Financial Analyst', label: 'Financial Analyst' },
    { value: 'Other', label: 'Other' }
  ]

  return (
    <div
      className={`${width} ${height} m-8 flex items-center justify-center bg-white font-inter rounded-3xl p-8 ${className}`}
    >
      <form onSubmit={handleSubmit(onClickSubmit)} className="w-[650px] h-full ">
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <Typography className="text-[32px] leading-10 mb-2 font-bold" variant="title1">
              {title || '👋 Welcome to LedgerX!'}
            </Typography>
          </div>
          {!nonSubtitle && (
            <Typography className="text-base leading-6 mb-10 font-normal text-center !text-[#858585] " variant="title1">
              Let&apos;s set up your organization and get started.
            </Typography>
          )}
        </div>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormField
              label="Organisation Name"
              error={errors?.name?.message}
              labelClassName="mb-1 text-neutral-900 text-sm font-semibold"
              isRequired
            >
              <Input {...field} placeholder="Enter organisation name" classNames="h-[48px] placeholder:not-italic" />
            </FormField>
          )}
        />

        <TypographyAtom classNames="mb-1 mt-6 !font-semibold" variant="body2" color="primary">
          Your Role <span className="text-sm !font-semibold text-error-500">*</span>
        </TypographyAtom>

        {/* <TypographyAtom classNames="mb-2" variant="caption" color="dark">
          This will help us provide a tailored experience based on your role.
        </TypographyAtom> */}
        <SearchableDropdown
          value={role?.value ? role : null}
          options={rolesOptions}
          handleOnChange={handleSelectRole}
          placeholder="Select your role in the organisation"
          name="role"
          width="100%"
          height="48px"
        />
        {errors?.role?.value?.message && (
          <div className="text-xs font-normal flex items-center text-error-500 mt-1 mx-1">
            <div className="mr-2 flex items-center">
              <Image src={warning} alt="warning" width={11} height={11} />
            </div>
            {errors?.role?.value?.message}
          </div>
        )}

        <TypographyAtom classNames="mb-1 mt-6 !font-semibold" variant="body2" color="primary">
          Get a free and personalised onboarding experience <span className="text-error-500">*</span>
        </TypographyAtom>
        {/* <TypographyAtom classNames="mb-2" variant="caption" color="dark">
          We would like to onboard you and your team properly. Please provide at least one point of contact for our team
          to reach out.
        </TypographyAtom> */}
        <div className="flex flex-col gap-3">
          {contactFields.map((_, index) => (
            <div key={index}>
              <ContactDropdown
                onClickRemoveContact={handleOnClickRemoveContact}
                watch={watch}
                setValue={setValue}
                trigger={trigger}
                index={index}
                key={index}
                removeable={index >= 1}
                clearErrors={clearErrors}
                setError={setError}
              />
              <FormErrorLabel
                error={errors?.contacts?.[index]?.provider?.message || errors?.contacts?.[index]?.content?.message}
              />
            </div>
          ))}
          {errors?.contacts?.message && isClickSubmit && (
            <div className="text-xs font-normal flex items-center text-error-500 mt-1 mx-1">
              <div className="mr-2 flex items-center">
                <Image src={warning} alt="warning" width={11} height={11} />
              </div>
              {errors?.contacts?.message}
            </div>
          )}
        </div>
        {/* <Button onClick={handleAddAnotherContact} className="mt-3" variant="contained" size="sm" color="white">
          + Add Another Contact
        </Button> */}
        <div className={`mt-6 flex gap-4 ${btnClassName}`}>
          {renderBackBtn && (
            <Button
              color="secondary"
              size="lg"
              onClick={() => {
                if (onBack) onBack()
              }}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            fullWidth
            color="primary"
            className="!rounded-md !font-normal !bg-[#0079DA]"
            size="lg"
            onClick={() => {
              setIsClickSubmit(true)
            }}
          >
            Create Organisation
          </Button>
        </div>
      </form>
    </div>
  )
}
export default CreateOrgCard
