import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { validationSchema } from './draft-form.schema'
import { ICreateDraftForm } from './draft-form.type'
import { CurrencyType } from '@/api-v2/payment-api'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'

export const getCurrencyImage = (code: string) =>
  `https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/fiat-currency-images/${code}.svg`

const useDraftForm = (currencyType: CurrencyType) => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const orgSettings = useAppSelector(orgSettingsSelector)

  const methods = useForm<ICreateDraftForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      isSubmitForReview: false,
      reviewer: null,
      recipients: [
        {
          walletAddress: null,
          files: [],
          s3Files: [], // TODO-PENDING- Better naming
          amount: '',
          annotations: [],
          token:
            currencyType === CurrencyType.CRYPTO
              ? {
                  value: '',
                  label: 'ETH',
                  src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_71573a87-6766-433a-9c5e-b96526a78138_small.png',
                  address: {
                    blockchainId: selectedChain?.id,
                    type: 'Coin',
                    decimal: 18,
                    address: null
                  }
                }
              : {
                  value: orgSettings?.fiatCurrency?.code,
                  label: orgSettings?.fiatCurrency?.code,
                  src: getCurrencyImage(orgSettings?.fiatCurrency?.code)
                },
          chartOfAccounts: null,
          purposeOfTransfer: '',
          destinationCurrencyType: currencyType
        }
      ]
    },
    resolver: yupResolver(validationSchema)
  })

  return methods
}

export default useDraftForm
