import { isAddress } from 'ethers/lib/utils'
import * as yup from 'yup'

export const walletAddressSchema = yup
  .object()
  .shape({
    value: yup.string().ensure().required('Recipient is required.')
  })
  .nullable()
  .required('Recipient is required.')
  .test('check-is-address', 'Invalid recipient address', (value) => isAddress(value?.address))
  .test('check-is-same-as-source', 'Wallet is being used to send funds in this transfer. You are not allowed to use the same wallet as a recipient.', (value: any, ctx: any) => {
    // CHARMANDER - CHECK IF SKETCHY when accesses source address (the from index should always be 2)
    const sourceAddress = ctx?.from[2]?.value?.sourceWallet?.address
    const recipientAddress = value?.address

    if (recipientAddress?.toLowerCase() === sourceAddress?.toLowerCase()) {
      return false
    }
    return true
  })
//   .test(
//     'checkDuplicateWallet',
//     'This is your connected wallet',
//     (value: IFormatOptionLabel) => sourceValue?.address !== value?.address
//   )
//   .test('checkIsWallet', 'Please enter valid wallet address', (value: IFormatOptionLabel) =>
//     isAddress(value?.address)
//   ),

export const sourceWalletSchema = yup
  .object()
  .nullable()
  .required('Source wallet is required.')
  .test(
    'required-fields',
    'Source wallet address and label are required.',
    (value) => value && value.address && value.label
  )

export const schema = yup.object().shape({
  sourceWallet: sourceWalletSchema,
  recipients: yup.array().of(
    yup.object().shape({
      walletAddress: walletAddressSchema,
      amount: yup
        .string()
        .required('Amount is required.')
        .test(
          'checkMinimumAmount',
          'Must be greater than 0',
          (value) => Number.isNaN(Number(value)) || Number(value) > 0
        )
        .matches(/^\d+\.?\d*$/, 'Please enter a valid amount'),
      files: yup
        .array()
        .nullable()
        .test('checkNumberOfFile', 'Maximum number of files: 10', (file) => !file || file?.length <= Number(10)) //
    })
  )
})
