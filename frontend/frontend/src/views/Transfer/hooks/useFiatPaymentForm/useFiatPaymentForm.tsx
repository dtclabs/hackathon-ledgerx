import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { IMakePaymentForm } from '../../Transfer.types'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { validationSchema } from './fiat-payment-form.schema'

export const getCurrencyImage = (code: string) =>
  `https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/fiat-currency-images/${code}.svg`

const useFiatPaymentForm = () => {
  const orgSettings = useAppSelector(orgSettingsSelector)

  const methods = useForm<IMakePaymentForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      sourceWalletId: null,
      recipients: [
        {
          bankAccount: null,
          files: [],
          amount: '',
          annotations: [],
          tokenId: orgSettings?.fiatCurrency?.code || 'USD',
          chartOfAccountId: null,
          purposeOfTransfer: ''
        }
      ]
    },
    resolver: yupResolver(validationSchema)
  })

  return methods
}

export default useFiatPaymentForm
