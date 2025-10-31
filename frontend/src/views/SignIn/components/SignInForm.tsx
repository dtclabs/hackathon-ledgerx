/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-unescaped-entities */
import React, { FC } from 'react'
import * as Yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { Card, TypographyV2, FormField, Input, Button } from '@/components-v2'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

interface ISignInFormProps {
  onClickWalletSignIn: any
  onClickPasswordlessEmailSignIn: any
  onClickGoogleSignIn: any
  onClickPhantomSignIn?: () => void
  loading: boolean
  onClickXeroSignIn: () => void
  authType: string
}

// const devEnv = ['localhost', 'development', 'staging']
// const env = process.env.NEXT_PUBLIC_ENVIRONMENT
// const isDevEnv = devEnv.includes(env)

// const validationSchema = isDevEnv
//   ? Yup.object().shape({
//       email: Yup.string()
//         .trim()
//         .required('E-mail is required')
//         .email('Please enter a valid email')
//         .test('required-email-HQ', "Please use an email address with the '@ledgerx.com' domain", (value) =>
//           value.endsWith('@ledgerx.com')
//         )
//     })
//   : Yup.object().shape({
//       email: Yup.string().trim().required('E-mail is required').email('Please enter a valid email')
//     })

const validationSchema = Yup.object().shape({
  email: Yup.string().trim().required('E-mail is required').email('Please enter a valid email')
})

const SignInForm: FC<ISignInFormProps> = ({
  onClickWalletSignIn,
  onClickPasswordlessEmailSignIn,
  onClickGoogleSignIn,
  onClickPhantomSignIn,
  onClickXeroSignIn,
  loading,
  authType
}) => {
  const isXeroCertificationEnabled = useAppSelector((state) => selectFeatureState(state, 'isXeroCertificationEnabled'))

  const {
    handleSubmit,
    control,
    trigger,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      email: ''
    },
    resolver: yupResolver(validationSchema)
  })

  return (
    <div className="flex flex-col items-center sm:w-[100vw]">
      <Card size="md" className="sm:w-full sm:px-4 w-[560px] py-0 rounded-r-2xl flex flex-col justify-center">
        <div className="flex justify-center mb-6">
          <img src="/svg/logos/ledgerx-logo.svg" alt="LedgerX" className="w-[154px] h-[40px]" />
        </div>
        <TypographyV2 style={{ fontWeight: 700, fontSize: 24 }} className="text-center" variant="title1">
          Sign in to your
        </TypographyV2>
        <TypographyV2 style={{ fontWeight: 700, fontSize: 24 }} className="text-center mb-6" variant="title1">
          LedgerX Account
        </TypographyV2>
        <form onSubmit={handleSubmit(onClickPasswordlessEmailSignIn)}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormField label="" error={errors?.email?.message}>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    trigger('email')
                  }}
                  placeholder="Your work email"
                />
              </FormField>
            )}
          />
          {/* <TypographyV2 className="mt-4" variant="subtitle2" color="secondary">
            We recommend using your work email to get set up with your team faster
          </TypographyV2> */}
          <Button
            disabled={loading || !watch('email')}
            size="md"
            fullWidth
            className={`mt-4 !text-white !rounded-md ${!watch('email') ? '!bg-[#C7C7C7]' : ' !bg-[#0079DA]'}`}
            type="submit"
          >
            Continue
          </Button>
        </form>
        <div
          className="mt-4 mb-4"
          style={{ width: '100%', height: 15, borderBottom: '1px solid #EAECF0', textAlign: 'center' }}
        >
          <span style={{ fontSize: 14, backgroundColor: 'white', padding: '0 5px', color: '#777675', fontWeight: 500 }}>
            OR
          </span>
        </div>
        <div className="flex gap-4 sm:flex-col">
          <Button
            disabled={loading}
            loader={authType === 'email' && loading}
            size="md"
            color="white"
            fullWidth
            className="mt-2 !rounded-md"
            onClick={onClickGoogleSignIn}
          >
            <span className="flex flex-row items-center gap-2 !font-normal">
              <img src="/svg/Google.svg" height="18" alt="Google" /> Continue with Google
            </span>
          </Button>
          <Button
            disabled={loading}
            loader={authType === 'wallet' && loading}
            size="md"
            color="white"
            fullWidth
            className="mt-2 !rounded-md"
            onClick={onClickPhantomSignIn}
          >
            <span className="flex flex-row items-center gap-2 !font-normal">
              <img src="/svg/wallet-icons/phantom-logo.svg" alt="Phantom" className="w-[24px] h-[24px]" /> Continue with
              Phantom
            </span>
          </Button>
        </div>
        {/* <Button
          disabled={loading}
          loader={authType === 'wallet' && loading}
          size="md"
          onClick={onClickWalletSignIn}
          color="tertiary"
          fullWidth
          className="mt-4"
        >
          <span className="flex flex-row items-center gap-2">
            <img src="/svg/icons/wallet-icon.svg" height="18" alt="Google" /> Continue with Wallet
          </span>
        </Button> */}

        {/* {isXeroCertificationEnabled && (
          <Button
            disabled={loading}
            loader={authType === 'xero' && loading}
            size="md"
            onClick={onClickXeroSignIn}
            color="tertiary"
            fullWidth
            className="mt-4"
          >
            <span className="flex flex-row items-center gap-2">
              <img src="/svg/icons/xero-logo-icon.svg" height="18" alt="Xero" /> Continue with Xero
            </span>
          </Button>
        )} */}
      </Card>
    </div>
  )
}

export default SignInForm
