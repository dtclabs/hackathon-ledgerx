import * as yup from 'yup'
import { useForm } from 'react-hook-form'
// Libraries
import { uniq } from 'lodash'
import { useWeb3React } from '@web3-react/core'
import { yupResolver } from '@hookform/resolvers/yup'

// Utilities
import { log } from '@/utils-v2/logger'
import { useAppSelector } from '@/state'
import EthersServiceV2 from '@/services/ether-service-v2'
import { schema, sourceWalletSchema, walletAddressSchema } from './payment-form.schema'

// Types
import { IMakePaymentForm } from '../../Transfer.types'
import { SourceType } from '@/slice/wallets/wallet-types'

// Selectors
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { selectWalletMapById, selectWalletMapByAddress } from '@/slice/wallets/wallet-selectors'
import {
  selectVerifiedCryptocurrencyIdMap,
  selectedChainNativeToken
} from '@/slice/cryptocurrencies/cryptocurrency-selector'

export const usePaymentForm = () => {
  const { account, library } = useWeb3React()

  const nativeToken = useAppSelector(selectedChainNativeToken)
  const selectedChain = useAppSelector(selectedChainSelector)
  const walletIdMap = useAppSelector(selectWalletMapById)
  const cryptoIdMap = useAppSelector(selectVerifiedCryptocurrencyIdMap)
  const walletMap = useAppSelector(selectWalletMapByAddress)

  const methods = useForm<IMakePaymentForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      recipients: [
        {
          walletAddress: null,
          files: [],
          amount: null,
          note: null, // TODO - Check current implementation on backend
          tokenId: nativeToken?.publicId ?? null, // TODO - Check how no network is handled
          chartOfAccountId: null,
          walletId: walletMap[account]?.id ?? null,
          isUnknown: true,
          annotations: []
        }
      ],
      sourceWalletId: null
    },
    resolver: yupResolver(
      schema.clone().shape({
        sourceWalletId: sourceWalletSchema
          .test(
            'check-multicurrency-for-eoa',
            'You have selected an EOA wallet. Multi-currency payment is currently not supported for EOA wallets. \nPlease add the payments with same currency below.',
            (value) => {
              const sourceWallet = walletIdMap[value]

              if (sourceWallet?.sourceType?.toLowerCase() === SourceType.ETH) {
                const recipients = methods?.getValues('recipients')
                const recipientCurrencies = uniq(recipients.map((recipient) => recipient.tokenId))
                if (recipientCurrencies.length > 1) {
                  return false
                }
              }
              return true
            }
          )
          .test('is-connect-wallet', 'Connect your wallet and select the wallet you want to pay from.', (value) => {
            if (account) return true
            return false
          }),
        recipients: schema.fields.recipients.clone().of(
          schema.fields.recipients.innerType.concat(
            yup.object().shape({
              walletAddress: walletAddressSchema.test(
                'check-eoa-send-to-safe',
                'Transfers to smart contract wallets via disperse is not yet supported. Please provide a different address.',
                async (value) => {
                  const sourceWalletId = methods.getValues('sourceWalletId')
                  const sourceWallet = walletIdMap[sourceWalletId]

                  if (sourceWallet?.sourceType?.toLowerCase() === SourceType.ETH) {
                    try {
                      const ethersService = new EthersServiceV2(library.provider)
                      const isEoa = await ethersService.isEoaWallet({ address: value })

                      return isEoa
                    } catch (err) {
                      log.debug(
                        'Exception when sending to a wallet address is a safe',
                        ['Exception when sending to a wallet address is a safe'],
                        { actualErrorObject: err },
                        `${window.location.pathname}`
                      )
                      return true
                    }
                  }
                  return true
                }
              ),
              tokenId: yup
                .string()
                .test(
                  'check-usdt-for-eoa',
                  'USDT transfers from an EOA wallet are restricted to single transactions only',
                  (value) => {
                    const sourceWalletId = methods.getValues('sourceWalletId')
                    const recipients = methods.getValues('recipients')
                    const sourceWallet = walletIdMap[sourceWalletId]
                    const selectedToken = cryptoIdMap[value]
                    if (
                      selectedToken.symbol === 'USDT' &&
                      sourceWallet?.sourceType?.toLowerCase() === SourceType.ETH &&
                      recipients.length > 1
                    ) {
                      return false
                    }
                    return true
                  }
                )
                .test('is-token-supported', 'This token is not supported on this network.', (value) => {
                  const selectedToken = cryptoIdMap[value]
                  const isNetworkSupported = selectedToken?.addresses.some(
                    (address) => address.blockchainId.toLowerCase() === selectedChain?.id.toLowerCase()
                  )
                  if (isNetworkSupported) return true
                  return false
                })
            })
          )
        )
      })
    )
  })

  return methods
}

export default usePaymentForm
