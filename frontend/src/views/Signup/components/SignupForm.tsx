/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-unescaped-entities */
import React, { FC, useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Card, TypographyV2, FormField, Input, Button } from '@/components-v2'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import useAuth from '@/hooks/useAuth'
import Typography from '@/components-v2/atoms/Typography'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
// import { useWeb3Auth } from '@/providers/web3auth'

interface ISignInFormProps {
  onClickConnectWallet: any
  onClickSubmitEmail: any
  onClickGoogle: any
  onClickXeroSignIn: () => void
  onClickPhantom?: () => void
  initialEmail?: string
  loading: boolean
}

const WHITELIST_DOMAIN = ['gmail.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com', 'outlook.com']
// const WHITELIST_DOMAIN = ['ledgerx.com']

const validateEmailDomain = (email: string) => {
  for (const domain of WHITELIST_DOMAIN) {
    if (email.endsWith(domain)) return true
  }
  return false
}

// const devEnv = ['localhost', 'develop', 'staging']
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
  email: Yup.string().trim().email('Please enter a valid email').required('E-mail is required')
})

const SignInForm: FC<ISignInFormProps> = ({
  onClickConnectWallet,
  onClickSubmitEmail,
  onClickXeroSignIn,
  onClickGoogle,
  onClickPhantom,
  initialEmail,
  loading
}) => {
  const isXeroCertificationEnabled = useAppSelector((state) => selectFeatureState(state, 'isXeroCertificationEnabled'))
  const router = useRouter()

  // const { logout } = useWeb3Auth()
  const {
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
    setValue
  } = useForm({
    reValidateMode: 'onChange',
    defaultValues: {
      email: initialEmail || ''
    },
    resolver: yupResolver(validationSchema)
  })
  const [isWarningEmail, setIsWarningEmail] = useState(false)
  const handleSignIn = () => {
    window.localStorage.setItem('EMAIL_LOGIN_REDIRECT', '')

    // logout({ notRedirect: false })
  }

  const handleOnChange = (e: any) => {
    setValue('email', e.target.value)
    trigger('email')
  }

  useEffect(() => {
    const emailRegex = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9-])+\.([a-zA-Z0-9]{1,})$/
    if (watch('email') && emailRegex.test(watch('email'))) {
      if (!validateEmailDomain(watch('email'))) {
        setIsWarningEmail(true)
      } else {
        setIsWarningEmail(false)
      }
    } else {
      setIsWarningEmail(false)
    }
  }, [watch('email')])

  return (
    <div className="flex flex-col items-center sm:w-[100vw] sm:px-4">
      <Card size="md" shadow="sm" className="w-full sm:w-full lg:w-[560px] py-0 flex flex-col justify-center">
        <div className="flex justify-center mb-6">
          <img src="/svg/logos/ledgerx-logo.svg" alt="LedgerX" className="w-[154px] h-[40px]" />
        </div>
        <TypographyV2 style={{ fontWeight: 700, fontSize: 24 }} className="text-center" variant="title1">
          Get started with
        </TypographyV2>
        <TypographyV2 style={{ fontWeight: 700, fontSize: 24 }} className="text-center mb-8" variant="title1">
          LedgerX
        </TypographyV2>
        <FormField label="" error={errors?.email?.message}>
          <Input onChange={handleOnChange} value={watch('email')} placeholder="Your work email" />
        </FormField>
        <Typography classNames="mt-4 !text-base sm:!text-sm" variant="caption" color="secondary">
          We recommend using your work email to get set up with your team faster
        </Typography>
        <Button
          disabled={loading}
          size="md"
          className={`mt-4 !text-white !rounded-md ${!watch('email') ? '!bg-[#C7C7C7]' : ' !bg-[#0079DA]'}`}
          fullWidth
          onClick={handleSubmit(onClickSubmitEmail)}
          type="submit"
        >
          Continue
        </Button>
        <div
          className="mt-4 mb-4"
          style={{ width: '100%', height: 15, borderBottom: '1px solid #EAECF0', textAlign: 'center' }}
        >
          <span style={{ fontSize: 14, backgroundColor: 'white', padding: '0 5px', color: '#777675', fontWeight: 500 }}>
            OR
          </span>
        </div>
        <div className="flex gap-4 w-full sm:flex-col">
          <Button
            disabled={loading}
            loader={loading}
            size="md"
            color="white"
            fullWidth
            className="mt-2 !rounded-md w-full"
            onClick={onClickGoogle}
          >
            <span className="flex flex-row items-center gap-2 !font-normal">
              <img src="/svg/Google.svg" height="18" alt="Google" /> Continue with Google
            </span>
          </Button>
          <Button
            disabled={loading}
            size="md"
            color="white"
            fullWidth
            className="mt-2 !rounded-md w-full "
            onClick={onClickPhantom}
          >
            <span className="flex flex-row items-center gap-2 !font-normal">
              <img src="/svg/wallet-icons/phantom-logo.svg" className="w-[24px] h-[24px]" alt="Phantom" /> Continue with
              Phantom
            </span>
          </Button>
        </div>
        {/* <Button
          disabled={loading}
          loader={loading}
          size="md"
          onClick={onClickConnectWallet}
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
            loader={loading}
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
        {/* {!isDevEnv && (
          <Button
            disabled={loading}
            size="md"
            onClick={onClickConnectWallet}
            color="tertiary"
            fullWidth
            className="mt-4"
          >
            <span className="flex flex-row items-center gap-2">
              <img src="/svg/icons/wallet-icon.svg" height="18" alt="Google" /> Continue with Wallet
            </span>
          </Button>
        )} */}
      </Card>
    </div>
  )
}

export default SignInForm
