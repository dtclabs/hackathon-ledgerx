/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-unescaped-entities */
import React, { FC, useEffect } from 'react'
import { Card, Typography, FormField, Input, Button } from '@/components-v2'
import * as Yup from 'yup'
import { accountSelectorV2 } from '@/slice/account/account-slice'
import { useAppSelector } from '@/state'
import TypographyV2 from '@/components-v2/atoms/Typography'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { CredentialBadge } from '@/components-v2/CredentialBadge'
import { userInfoSelector } from '@/slice/authentication/auththentication.slice'

interface ISignupForm {
  onClickSubmit: any
  email: string
  isLoading?: boolean
}
const nameRegex = /^[aA-zZ][aA-zZ. /]*$/

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .max(30, 'First name allows maximum of 30 characters')
    .matches(nameRegex, 'Please enter a valid name'),
  lastName: Yup.string()
    .required('Last name is required')
    .trim()
    .max(30, 'Last name allows maximum of 30 characters')
    .matches(nameRegex, 'Please enter a valid name')
})

const SignUpStep2: FC<ISignupForm> = ({ onClickSubmit, email, isLoading }) => {
  const accountSelector = useAppSelector(accountSelectorV2)
  const user = useAppSelector(userInfoSelector)

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      isAccepted: true
    },
    resolver: yupResolver(validationSchema)
  })
  const firstName = watch('firstName')
  const lastName = watch('lastName')

  useEffect(() => {
    if (user.firstName && user.lastName) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName
      })
    }
  }, [user.firstName, user.lastName])

  useEffect(() => {
    const googleData: any = window.sessionStorage.getItem('PASSWORDLESS_EMAIL_CREDS')
    if (googleData) {
      const parsedData = JSON.parse(googleData)
      reset({
        firstName: parsedData?.firstName ?? '',
        lastName: parsedData?.lastName ?? ''
      })
    }
  }, [])

  const handleOnClickSubmit = () => {
    const values = getValues()
    onClickSubmit({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      agreementSignedAt: new Date().toISOString()
    })
  }

  return (
    <div className="flex flex-col items-center sm:w-[100vw]">
      <form onSubmit={handleSubmit(handleOnClickSubmit)}>
        <Card size="md" shadow="sm" className="w-[560px] sm:w-full sm:px-4 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <img src="/svg/logos/ledgerx-logo.svg" alt="LedgerX" className="w-[154px] h-[40px]" />
          </div>
          <div className="text-center mb-6">
            <Typography variant="title1" className="font-bold text-2xl">
              Tell us a bit more about yourself.
            </Typography>
          </div>

          {/* <div className="mb-4 flex justify-center">
            <CredentialBadge isLoading={isLoading} credential={email ?? accountSelector?.name} />
          </div> */}

          <div className="flex gap-4 flex-col">
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormField
                  className="flex-1"
                  label="First Name"
                  error={errors?.firstName?.message}
                  labelClassName="mb-1 text-neutral-900 text-sm font-semibold"
                  isRequired
                >
                  <Input
                    {...field}
                    placeholder="Enter your First Name"
                    reset={firstName?.length > 0}
                    disabled={isLoading}
                    handleReset={() => {
                      reset({
                        firstName: '',
                        lastName
                      })
                    }}
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormField
                  className="flex-1"
                  label="Last Name"
                  error={errors?.lastName?.message}
                  labelClassName="mb-1 text-neutral-900 text-sm font-semibold"
                  isRequired
                >
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="Enter your Last Name"
                    reset={lastName?.length > 0}
                    handleReset={() => {
                      reset({
                        firstName,
                        lastName: ''
                      })
                    }}
                  />
                </FormField>
              )}
            />
          </div>
          <div className="w-full flex mt-6 justify-between text-center">
            <label htmlFor="accept-t&c" className="w-[calc(100%-28px)]">
              <TypographyV2 variant="body2" color="secondary">
                By continuing, you agree to our{' '}
                <a
                  href="https://www.ledgerx.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline !text-[#0079DA] font-semibold"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="https://www.ledgerx.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline !text-[#0079DA] font-semibold"
                >
                  Privacy Policy
                </a>
                .
              </TypographyV2>
            </label>
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            fullWidth
            size="md"
            className="mt-6 !rounded-md !font-normal !bg-[#0079DA]"
          >
            Continue
          </Button>
        </Card>
      </form>
    </div>
  )
}

export default SignUpStep2
