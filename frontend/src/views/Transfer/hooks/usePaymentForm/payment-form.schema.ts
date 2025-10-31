import { isAddress } from 'ethers/lib/utils'
import * as yup from 'yup'
import { store } from '@/state'

export const walletAddressSchema = yup
  .string()

  .nullable()
  .required('Recipient is required.')
  .test('check-is-address', 'Invalid recipient address', (value) => isAddress(value))
  .test(
    'check-is-same-as-source',
    'Wallet is being used to send funds in this transfer. You are not allowed to use the same wallet as a recipient.',
    (value: any, ctx: any) => {
      // CHARMANDER - CHECK IF SKETCHY when accesses source address (the from index should always be 2)
      const sourceWalletId = ctx?.from[1]?.value?.sourceWalletId
      const recipientAddress = value
      const sourceWallet = store.getState().wallets.wallets.find((wallet) => wallet.id === sourceWalletId)

      if (recipientAddress?.toLowerCase() === sourceWallet?.address?.toLowerCase()) {
        return false
      }
      return true
    }
  )

export const sourceWalletSchema = yup.string().nullable().required('Source wallet is required.')

export const schema = yup.object().shape({
  sourceWalletId: sourceWalletSchema,
  recipients: yup.array().of(
    yup.object().shape({
      walletAddress: walletAddressSchema,
      amount: yup
        .string()
        .nullable()
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
