import { CurrencyType } from '@/api-v2/payment-api'
import { store } from '@/state'
import { isAddress } from 'ethers/lib/utils'
import * as yup from 'yup'

const walletAddressSchema = yup
  .object()
  .shape({
    value: yup.string().ensure().required('Recipient is required.')
  })
  .nullable()
  .required('Recipient is required.')
  .test('check-is-address', 'Invalid recipient address', (value, ctx) => {
    if (ctx?.parent?.destinationCurrencyType === CurrencyType.CRYPTO) {
      return isAddress(value?.address)
    }
    return true
  })
const amountRequiredCheck = (amount: string, ctx) => {
  const parent = ctx?.from?.pop()
  if (!parent?.value?.isSubmitForReview) {
    if (amount && amount !== '') {
      return Number.isNaN(Number(amount)) || Number(amount) > 0
    }
    return true
  }
  return Number.isNaN(Number(amount)) || Number(amount) > 0
}
const amountValidCheck = (amount: string) => {
  if (amount && amount !== '') {
    return /^\d+\.?\d*$/.test(amount)
  }
  return true
}

export const validationSchema = yup.object().shape({
  isSubmitForReview: yup.boolean(),
  recipients: yup.array().of(
    yup.object().shape({
      walletAddress: walletAddressSchema,
      amount: yup
        .string()
        .test('amount-required', 'Must be greater than 0', amountRequiredCheck)
        .test('valid-amount', 'Please enter a valid amount', amountValidCheck),
      token: yup.object().test('matching-token', 'Currency has to match bank account currency', (value: any, ctx) => {
        const recipientCurrency = ctx?.parent?.walletAddress?.currencyCode
        if (ctx?.parent?.destinationCurrencyType === CurrencyType.CRYPTO && !recipientCurrency) {
          return true
        }

        return recipientCurrency?.toLowerCase() === value?.value?.toLowerCase()
      }),
      files: yup
        .array()
        .nullable()
        .test('checkNumberOfFile', 'Maximum number of files: 10', (file) => file?.length <= Number(10)),
      purposeOfTransfer: yup
        .string()
        .test('metadata-required', 'Purpose Of Transfer is required', (value: string, ctx) => {
          if (ctx?.parent?.destinationCurrencyType === CurrencyType.CRYPTO) {
            return true
          }
          return !!value
        })
    })
  )
})
