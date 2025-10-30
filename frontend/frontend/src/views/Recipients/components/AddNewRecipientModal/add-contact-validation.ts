import _ from 'lodash'
import * as yup from 'yup'

// Validation schema for the form
export const addRecipientSchema = yup.object().shape({
  contactName: yup.string().required('Contact name is required'),
  providers: yup.array().of(
    yup.object().shape({
      content: yup.string(),
      providerId: yup.string()
    })
  ),
  wallets: yup
    .array()
    .of(
      yup.object().shape({
        walletAddress: yup.string().required('Wallet address is required'),
        blockchainId: yup.string().required('Blockchain ID is required'),
        cryptocurrencySymbol: yup.string().required('Cryptocurrency symbol is required')
      })
    )
    .test('unique-walletAddress', 'Wallet addresses should be unique for each network', (wallets = []) => {
      const uniqueWallet = _.uniqBy(wallets, (obj) => `${obj.walletAddress}-${obj.blockchainId}`)
      return uniqueWallet.length === wallets.length
    })
})
