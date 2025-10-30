import { usePostPaymentLinkMutation } from '@/api-v2/payment-link-api'
import { Alert } from '@/components/Alert'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import HelperText from '@/components/ValidationRequired/HelperText'
import { useSelectWalletsWithBalanceBasedOnChain } from '@/hooks-v2/wallets/useSelectWalletsWithBalanceBasedOnChain'
import Warning from '@/public/svg/light-warning-icon.svg'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { yupResolver } from '@hookform/resolvers/yup'
import { isAddress } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { ILink } from '../ReceivePayment'
import SelectAddress from './SelectAddress'
import SelectChain from './SelectChain'
import SelectToken from './SelectToken'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import Button from '@/components-v2/atoms/Button'

interface IReceivePaymentField {
  address: any
  token: any
  blockchainId: any
}

interface IReceivePaymentForm {
  paymentLinks: ILink[]
  setFormShow: React.Dispatch<React.SetStateAction<boolean>>
  tokens: any
  chains: any
}

const ReceivePaymentForm: React.FC<IReceivePaymentForm> = ({ paymentLinks, setFormShow, tokens, chains }) => {
  const selectedChain = useAppSelector(selectedChainSelector)?.id
  const schema = yup.object().shape({
    address: yup
      .string()
      .required('Please enter the receiving wallet address')
      .test('checkIsWallet', 'Please enter valid wallet address', (value) => isAddress(value)),
    token: yup.string().required('Please select the receiving token')
  })

  const {
    formState: { errors },
    handleSubmit,
    resetField,
    setValue
  } = useForm<IReceivePaymentField>({
    defaultValues: {
      address: '',
      token: '',
      blockchainId: 'ethereum'
    },
    resolver: yupResolver(schema)
  })

  const [postPayment, postPaymentResult] = usePostPaymentLinkMutation()

  const organizationId = useOrganizationId()
  const availableSource = useSelectWalletsWithBalanceBasedOnChain('ethereum')

  const [activeToken, setActiveToken] = useState<IFormatOptionLabel>(null)
  const [sourceValue, setSourceValue] = useState<IFormatOptionLabel>({
    label: '',
    value: '',
    address: '',
    totalPrice: ''
  })
  const [activeChain, setActiveChain] = useState<any>({
    value: 'ethereum',
    label: 'Ethereum'
  })
  const [error, setError] = useState(false)

  const optionToken = useMemo(
    () =>
      tokens?.map((token) => ({
        value: token.symbol,
        label: token.symbol,
        src: token.image.small
      })),
    [selectedChain, tokens]
  )

  const optionChains = useMemo(
    () =>
      chains?.map((item) => ({
        value: item.value,
        label: item.label
      })),
    [chains]
  )

  const handleChangeAddress = (value: any) => {
    setSourceValue(value as IFormatOptionLabel)
    setValue('address', value.value)
  }

  const handleChangeToken = (tokenValue: IFormatOptionLabel) => {
    setActiveToken(tokenValue)
  }

  const handleChangeChain = (chainValue: IFormatOptionLabel) => {
    setActiveChain(chainValue)
  }

  const handleCancel = () => {
    setFormShow(false)
    setError(false)
  }

  const handleCreateLink = (formData: IReceivePaymentField) => {
    postPayment({
      payload: {
        cryptocurrency: formData.token,
        blockchainId: formData.blockchainId,
        address: formData.address
      },
      orgId: organizationId
    })
  }

  useEffect(() => {
    if (postPaymentResult.isSuccess) {
      setFormShow(true)
      setError(false)
      toast.success('Payment link successfully created!')
    }
    if (postPaymentResult.isError) {
      setError(true)
    }
  }, [postPaymentResult.isError, postPaymentResult.isSuccess])

  return (
    <div className="flex-1 p-8 font-inter text-sm leading-5">
      <form onSubmit={handleSubmit(handleCreateLink)}>
        <div className="text-dashboard-main mb-2">Receiving Wallet Address*</div>
        <SelectAddress
          name="address"
          isSearchable={false}
          onChange={handleChangeAddress}
          availableSource={availableSource}
          sourceValue={sourceValue}
          setValue={setValue}
          resetField={resetField}
          setSourceValue={setSourceValue}
        />
        {errors && errors.address && (
          <HelperText
            className="flex gap-2 items-center text-sm pt-2 text-error-500"
            helperText={errors.address.message as string}
            img={Warning}
          />
        )}
        <div className="text-dashboard-main mt-8 mb-2">Receiving Asset*</div>
        <SelectToken
          name="token"
          placeholder="Search"
          noOptionsMessage={() => 'No assets found.'}
          optionList={optionToken}
          onChangeToken={handleChangeToken}
          setValue={setValue}
          token={activeToken}
        />
        {errors && errors.token && (
          <HelperText
            className="flex gap-2 items-center text-sm pt-2 text-error-500"
            helperText={errors.token.message as string}
            img={Warning}
          />
        )}
        <div className="text-dashboard-main mt-8 mb-2">Receiving Wallet Chain*</div>
        <SelectChain
          name="blockchainId"
          optionList={optionChains}
          onChangeChain={handleChangeChain}
          setValue={setValue}
          chain={activeChain}
        />
        {error && (
          <Alert variant="danger" className="mt-8 text-base leading-6 font-medium py-3">
            A payment link with the entered receiving wallet address and token already exists.
          </Alert>
        )}

        <div className="flex gap-3 mt-8">
          {paymentLinks?.length > 0 && <Button variant="grey" height={40} onClick={handleCancel} label="Cancel" />}
          <Button variant="black" type="submit" label="Create Payment Link" height={40} />
          {/* <Button size="md" type="submit">
            Create Payment Link
          </Button> */}
        </div>
      </form>
    </div>
  )
}

export default ReceivePaymentForm
