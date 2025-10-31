/* eslint-disable no-else-return */
/* eslint-disable no-promise-executor-return */
import { FC, useEffect, useMemo, useState } from 'react'
import Image from 'next/legacy/image'
import ErrorTriangleIcon from '@/public/svg/icons/red-triangle-warning.svg'
import Typography from '@/components-v2/atoms/Typography'
import SelectDropdown from '@/components-v2/Select/Select'
import { FormField } from '@/components-v2'
import DTCPayLogo from '@/public/svg/logos/dtcpay-logo.svg'
import * as Yup from 'yup'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import LockIcon from '@/public/svg/icons/lock-icon-dark.svg'
import { customCategoryStyles } from '@/views/Transactions-v2/TxGridTable/TxGridTableRow'
import { useGetInvoicePublicQrMutation } from '@/api-v2/invoices-api'
import Loader from '@/public/svg/dot-loader.svg'
import PaidStep from './steps/PaidStep'
import PaymentStep from './steps/PaymentStep'
import ExpiredLinkStep from './steps/ExpiredStep'
import useCountdownTimer from '@/hooks-v2/useCountdownTimer'
import Button from '@/components-v2/atoms/Button'
import PaymentInfo from './components/PaymentInfo'
import VerifiedIcon from '@/public/svg/icons/verified-icon-black.svg'

export const resolvedMappingCustomStyles = {
  ...customCategoryStyles,
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    color: '#2D2D2C',
    borderColor: '#e2e2e0',
    minHeight: '48px',
    height: '48px',
    boxShadow: state.isFocused ? null : null
  }),
  singleValue: (provided) => ({
    ...provided,
    top: 0,
    color: '#2d2d2c',
    transform: 'none',
    paddingLeft: 4,
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    display: 'flex',
    gap: 6,
    width: 'max-content'
  })
}

const validationSchema = Yup.object().shape({
  channelId: Yup.string().required('Please select a token'),
  chainId: Yup.string().required('Please select a network')
})

const customOptionLabel = (option) => (
  <div className="flex flex-row gap-4">
    <Image src={option?.image} alt="token-img" height={20} width={20} className="rounded-full" />
    <Typography>{option?.label}</Typography>
  </div>
)

interface IDTCPaymentFormProps {
  id: any
  chains: any
  cryptoCurrencies: any
  payingTo: string
  amount: string
  organizationId: string
  status: string
  paymentInfo?: {
    currency: string
    amountInToken: string
    network: string
    cryptoCurrency: string
    expiry: string
    qrCode: string
    transactionHash?: string
    paidOn?: string
  }
}
interface IFormState {
  channelId: string
  chainId: string
}
const DTCPaymentForm: FC<IDTCPaymentFormProps> = ({
  chains,
  cryptoCurrencies,
  organizationId,
  payingTo,
  amount,
  id,
  paymentInfo,
  status
}) => {
  const [resetPayment, setResetPayment] = useState(false)
  const [triggerGenerateQr, generateQrApi] = useGetInvoicePublicQrMutation()
  const remainingTime = useCountdownTimer(paymentInfo?.expiry)
  const {
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
    setValue
  } = useForm<IFormState>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      channelId: '',
      chainId: ''
    }
  })

  useEffect(() => {
    if (generateQrApi.isSuccess) {
      setResetPayment(false)
    }
  }, [generateQrApi.isSuccess])

  const handleOnChangeNetwork = (option) => {
    setValue('chainId', option.value, { shouldValidate: true })
    setValue('channelId', null)
  }

  const handleOnChangeToken = (option) => {
    setValue('channelId', option.channelId, { shouldValidate: true })
  }

  const onSubmit = async (values) => {
    triggerGenerateQr({
      invoiceId: id,
      organizationId,
      body: {
        channelId: parseInt(values.channelId)
      }
    })
  }

  const networkToPay = chains?.find((option) => option.value === paymentInfo.network)
  const tokenPayment = cryptoCurrencies[paymentInfo.network]?.find(
    (option) => option.value === paymentInfo.cryptoCurrency
  )

  const handlleOnClickRefresh = () => {
    const channelId = cryptoCurrencies[paymentInfo.network]?.find(
      (option) => option.value === paymentInfo.cryptoCurrency
    )?.channelId
    triggerGenerateQr({
      invoiceId: id,
      organizationId,
      body: {
        channelId: parseInt(channelId)
      }
    })
  }

  const handlePanelTitle = () => {
    if (status === 'paid') {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <Typography color="secondary">
              To: <span className="text-[#111111] font-[500]">{payingTo}</span>
            </Typography>
          </div>
          <div className="mt-2 flex items-center flex-row gap-2">
            <Image src={tokenPayment?.image} alt="token-img" height={25} width={25} />
            <Typography variant="heading3">
              {paymentInfo.amountInToken
                ? formatNumberWithCommasBasedOnLocale(String(paymentInfo.amountInToken), 'SG')
                : '-'}
              <span className="pl-1"> {tokenPayment?.value}</span>
            </Typography>
            <div className="flex flex-row pt-1 gap-2 items-center">
              <Typography>{formatNumberWithCommasBasedOnLocale(String(amount), 'SG')}</Typography>
              <Typography>{paymentInfo.currency}</Typography>
            </div>
          </div>
          <div className="flex -mt-2 items-center flex-row gap-2 pl-1">
            <Image src={networkToPay?.image} alt="token-img" height={18} width={18} />
            <Typography color="secondary">{networkToPay.label}</Typography>
          </div>
          <div className="flex mt-2 flex-row gap-2">
            <Image src={VerifiedIcon} alt="verified-icon" height={20} width={20} />
            <Typography variant="subtitle1">Payment completed</Typography>
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-row gap-4">
        <div className="flex items-center pr-2">
          <Image src={LockIcon} alt="lock-icon" height={20} width={20} />
        </div>
        <div>
          <Typography variant="heading2">Secure Payment</Typography>
          <div className="flex flex-row gap-2">
            <Typography variant="subtitle1">Powered by</Typography>
            <Image src={DTCPayLogo} alt="dtc-logo" width={90} height={20} />
          </div>
        </div>
      </div>
    )
  }

  const handleGenerateQrError = () => {
    let errorMessage = ''

    if (generateQrApi.error?.data?.message.includes('Failed to generate QR')) {
      errorMessage = 'There was an error generating the QR code. Please try again.'
    } else {
      errorMessage = 'Sorry an error occured'
    }
    return errorMessage
  }

  const handleOnClickResetQRPayment = () => {
    setResetPayment(true)
  }

  const handleTokenValue = () => {
    if (cryptoCurrencies[watch('chainId')] && watch('channelId')) {
      const token = cryptoCurrencies[watch('chainId')].find((currency) => currency.channelId === watch('channelId'))
      return token
    }
    return null
  }

  const renderFormState = () => {
    // If generating QR Code
    if (generateQrApi.isLoading) {
      return (
        <div className="flex items-center flex-col justify-center w-full h-full ">
          <Image src={Loader} className="animate-spin" alt="loader" height={120} width={120} />
          <Typography variant="body2" color="secondary">
            Generating QR Code...
          </Typography>
        </div>
      )
    } else if (status === 'paid' && !resetPayment) {
      return (
        <PaidStep
          currency={paymentInfo?.currency ?? ''}
          network={networkToPay}
          token={tokenPayment}
          cryptocurrencyAmount={paymentInfo.amountInToken}
          fiatAmount={amount}
          paidDate={paymentInfo?.paidOn ?? ''}
          transactionHash={paymentInfo.transactionHash ?? ''}
        />
      )
    } else if (remainingTime.hours <= 0 && remainingTime.minutes <= 0 && !resetPayment) {
      return (
        <ExpiredLinkStep
          currency={paymentInfo.currency}
          onClickRefresh={handlleOnClickRefresh}
          fiatAmount={amount}
          token={tokenPayment}
          payingTo={payingTo}
          onClickResetQRPayment={handleOnClickResetQRPayment}
          amount={paymentInfo.amountInToken}
          network={networkToPay}
        />
      )
    } else if (paymentInfo?.qrCode && !resetPayment) {
      // QR Code has been generated display QR Code + Info
      return (
        <PaymentStep
          network={networkToPay}
          token={tokenPayment}
          fiatAmount={amount}
          amount={paymentInfo.amountInToken}
          address={paymentInfo.qrCode}
          payingTo={payingTo}
          onClickResetQRPayment={handleOnClickResetQRPayment}
          remainingTime={remainingTime}
          currency={paymentInfo.currency}
        />
      )
    }

    // Display Network + Token Selection
    return (
      <div className="w-full mt-8 flex flex-col justify-between">
        <div>
          <FormField label="Select Network" isRequired error={errors?.chainId?.message}>
            <SelectDropdown
              disableIndicator
              isSearchable
              formatOptionLabel={customOptionLabel}
              styles={resolvedMappingCustomStyles}
              className="w-full"
              onChange={handleOnChangeNetwork}
              name="network"
              value={chains.find((option) => option.value === getValues('chainId'))}
              options={chains}
            />
          </FormField>
          <FormField label="Select Token" isRequired className="mt-12" error={errors?.channelId?.message}>
            <SelectDropdown
              disableIndicator
              isSearchable
              value={handleTokenValue()}
              formatOptionLabel={customOptionLabel}
              styles={resolvedMappingCustomStyles}
              className="w-full"
              onChange={handleOnChangeToken}
              name="network"
              options={cryptoCurrencies[getValues('chainId')]}
            />
          </FormField>
        </div>
        <div className="w-full ">
          <PaymentInfo
            currency={paymentInfo?.currency ?? ''}
            amount={amount}
            payingTo={payingTo}
            wrapperClassName="mb-6"
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            width="w-full"
            label="Generate QR Code"
            variant="black"
            height={48}
          />
          {generateQrApi.error && (
            <div className="flex flex-row gap-2 mt-2 pl-4 items-center">
              <Image src={ErrorTriangleIcon} alt="error-icon" height={12} width={12} />
              <Typography color="error" variant="caption">
                {handleGenerateQrError()}
              </Typography>
            </div>
          )}
        </div>
      </div>
    )
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col ">
      {handlePanelTitle()}
      <div className="flex flex-grow">{renderFormState()}</div>
    </form>
  )
}

export default DTCPaymentForm
