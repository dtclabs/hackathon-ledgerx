import * as yup from 'yup'

const bankAccountSchema = yup
  .object()
  .shape({
    value: yup.string().ensure().required('Recipient is required.')
  })
  .nullable()
  .required('Recipient is required.')

export const sourceWalletSchema = yup.string().nullable().required('Source wallet is required.')

const amountRequiredCheck = (amount: string) => Number.isNaN(Number(amount)) || Number(amount) > 0

const amountValidCheck = (amount: string) => {
  if (amount && amount !== '') {
    return /^\d+\.?\d*$/.test(amount)
  }
  return true
}

export const validationSchema = yup.object().shape({
  sourceWalletId: sourceWalletSchema,
  recipients: yup.array().of(
    yup.object().shape({
      bankAccount: bankAccountSchema,
      amount: yup
        .string()
        .test('amount-required', 'Must be greater than 0', amountRequiredCheck)
        .test('valid-amount', 'Please enter a valid amount', amountValidCheck),
      tokenId: yup
        .string()
        .required('Currency is required.')
        .test('matching-currency', 'Currency has to match bank account currency', (value: string, ctx) => {
          const recipientCurrency = ctx?.parent?.bankAccount?.currencyCode
          if (!recipientCurrency) {
            return true
          }

          return recipientCurrency?.toLowerCase() === value?.toLowerCase()
        }),
      files: yup
        .array()
        .nullable()
        .test('checkNumberOfFile', 'Maximum number of files: 10', (file) => file?.length <= Number(10)),
      purposeOfTransfer: yup.string().required('Purpose Of Transfer is required.')
    })
  )
})
