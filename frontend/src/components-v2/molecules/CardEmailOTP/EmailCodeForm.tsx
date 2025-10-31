/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-expressions */
import Image from 'next/legacy/image'
import * as Yup from 'yup'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import ArrowLeft from '@/public/svg/icons/arrow-left.svg'
import { Card, FormField, Input, Button, TypographyV2 } from '@/components-v2'
import { yupResolver } from '@hookform/resolvers/yup'
import Loading from '@/public/svg/Loader.svg'
import Typography from '@/components-v2/atoms/Typography'

const validationSchema = Yup.object().shape({
  code: Yup.string().required('Verification code is required')
})

const CardEmailOTP = ({ onClickBack, onClickSendCode, error, onRequestCode, email, resetError, sending, disabled }) => {
  // const [counter, setCounter] = useState(10)

  // useEffect(() => {
  //   if (error) {
  //     counter > 0 && setTimeout(() => setCounter(counter - 1), 1000)
  //     resetError()
  //   }
  // }, [error, counter])
  const [disabledResend, setDisabledResend] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm({
    defaultValues: {
      code: ''
    },
    resolver: yupResolver(validationSchema)
  })

  useEffect(() => {
    setError('code', null)
    resetError()
  }, [watch('code')])

  const handleOnClickRequestCode = () => {
    setDisabledResend(true)
    setCountdown(60)
    reset()
    onRequestCode()
  }

  useEffect(() => {
    let interval = null
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      setDisabledResend(false)
    }
    return () => clearInterval(interval)
  }, [countdown])

  return (
    <Card size="md" shadow="sm" className="w-[560px] flex flex-col justify-center">
      {/* <div className="flex justify-center flex-col">
        <div className="flex justify-center flex-col">
          <div className="flex justify-center">
            <Typography className=" p-2" variant="subtitle2" onClick={onClickBack}>
              <Image src={ArrowLeft} alt="arrow-left" />{' '}
              <span className="pl-2 hover:underline cursor-pointer" onClick={onClickBack}>
                Back
              </span>
            </Typography>
          </div>
        </div>
      </div> */}
      <div className="flex justify-center">
        <img src="/svg/logos/ledgerx-logo.svg" alt="LedgerX" className="w-[154px] h-[40px]" />
      </div>
      {/* <TypographyV2 style={{ fontWeight: 700 }} className="text-center mt-4" variant="title2">
        Enter the code we just sent to
      </TypographyV2> */}
      <TypographyV2 style={{ fontWeight: 700 }} className="text-center my-6 truncate" variant="title2">
        {/* {email} */}
        Verify that it's you
      </TypographyV2>

      <form onSubmit={handleSubmit(onClickSendCode)}>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <FormField label="" error={error || errors?.code?.message}>
              <Input {...field} placeholder="Verification Code" />
            </FormField>
          )}
        />

        <Typography classNames="mt-2" variant="caption" color="secondary">
          Enter the verification code we've just sent to {email}
        </Typography>

        <Button
          size="md"
          fullWidth
          className="mt-6 !rounded-md !font-normal !bg-[#0079DA]"
          type="submit"
          loader={disabled}
          disabled={disabled}
        >
          Verify and Continue
        </Button>
      </form>
      <div className="mt-6 flex flex-row justify-center items-center">
        <TypographyV2 variant="subtitle2" className="text-center mr-4">
          Didn't receive anything?
        </TypographyV2>
        <Button
          size="sm"
          variant="solid"
          onClick={handleOnClickRequestCode}
          disabled={sending || disabledResend}
          className="disabled:opacity-20 !bg-[#EFEFEF] !rounded-md"
        >
          <div className="flex items-center !font-normal">
            <p>Resend Code {countdown > 0 && !sending && `(${countdown})`}</p>
            {sending && <Image src={Loading} className="animate-spin-slow" alt="loading" width={24} height={24} />}
          </div>
        </Button>
      </div>
      {/* <div className="mt-4 flex flex-col">
        {!error ? null : counter !== 0 ? (
          <TypographyV2 variant="subtitle2" className="text-center">
            Resend OTP Code in: {counter}
          </TypographyV2>
        ) : (
          <TypographyV2 variant="subtitle2" className="text-center">
            Request a new OTP
          </TypographyV2>
        )}
        {counter === 0 ? (
          <Button className="mt-2" onClick={handleOnClickRequestCode} fullWidth>
            Resend Verification Code
          </Button>
        ) : null}
      </div> */}
    </Card>
  )
}

export default CardEmailOTP
