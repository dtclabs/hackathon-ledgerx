import { FC, useEffect, useMemo, useRef } from 'react'
import { formatNumber } from '@/utils/formatNumber'
import { useAppSelector } from '@/state'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { customStyles } from '@/constants/styles'
import CustomMenuList from '@/components/SelectItem/MenuList'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import ChainSelectorDropdown from '@/components-v2/molecules/ChainSelectorDropdownV2'
import DisconnectWalletChip from '@/components-v2/molecules/DisconnectWalletChip'
import FormatOptionLabel, { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import { Alert } from '@/components-v2/molecules/Alert'
import Typography from '@/components-v2/atoms/Typography'
import { useFormContext } from 'react-hook-form'
import ConnectWalletButton from '@/components-v2/molecules/ConnectWalletButton'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { SwitchGnosisToEoaWarningModal } from '../SwitchGnosisToEoaWarning'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import ErrorMessage from '../ErrorMessage'

interface ISourceWallet {
  connectedAccount: any
  availableSource?: any
  isChangedAccount: boolean
  getSafeThreshold?: (address: string) => void
  ethTokenImage?: string
  isSourcesLoading: boolean
}

const SourceWallet: FC<ISourceWallet> = ({
  connectedAccount,
  availableSource,
  isChangedAccount,
  getSafeThreshold,
  ethTokenImage,
  isSourcesLoading
}) => {
  const formContext = useFormContext()
  const tempSourceData = useRef(null)
  const { formState, setValue, watch, getValues } = formContext
  const supportedChains = useAppSelector(supportedChainsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const walletSwitchModalProvider = useModalHook({ defaultState: { isOpen: false } })

  useEffect(() => {
    // If chain is changed - check source wallet supports the chain
    // Todo - this page needs a clean
    if (connectedAccount && isChangedAccount) {
      const connectWallet = options?.find((option) => option.address?.toLowerCase() === connectedAccount?.toLowerCase())

      if (connectWallet) {
        setValue('sourceWallet', {
          address: connectWallet.address,
          value: connectWallet.address,
          label: connectWallet.label,
          totalPrice: connectWallet.totalPrice,
          type: connectWallet.typeAddress,
          id: connectWallet.sourceId,
          supportedBlockchains: connectWallet?.supportedBlockchains
        })
      } else {
        setValue('sourceWallet', {
          address: '',
          label: '',
          id: '',
          totalPrice: '',
          type: '',
          value: '',
          supportedBlockchains: []
        })
      }
    }
  }, [selectedChain?.id])

  const handleOnChange = (_value) => {
    const currentSourceWallet = getValues('sourceWallet')
    const _recipients = getValues('recipients')
    const tokenValues = _recipients.map((obj) => obj.token?.value)
    // When changing a source
    // Check we are going from gnosis to eth wallet
    // Check if there are multiple tokens in the recipients
    // If so - Open the modal and temp store the selected source in memory

    if (currentSourceWallet?.type === 'gnosis' && _value?.typeAddress === 'eth' && new Set(tokenValues).size !== 1) {
      tempSourceData.current = _value
      walletSwitchModalProvider.methods.setIsOpen(true)
    } else {
      setValue('sourceWallet', {
        address: _value.address,
        value: _value.address,
        label: _value.label,
        totalPrice: _value.totalPrice,
        type: _value.typeAddress,
        id: _value.sourceId,
        supportedBlockchains: _value.supportedBlockchains
      })
    }
    if (_value?.typeAddress === 'gnosis') {
      getSafeThreshold(_value.address)
    }
  }

  const handleOnClickConfirmSwitch = () => {
    const _recipients = getValues('recipients')
    // On confirmation - Change the source to the temp source
    setValue('sourceWallet', {
      address: tempSourceData.current.address,
      value: tempSourceData.current.address,
      label: tempSourceData.current.label,
      totalPrice: tempSourceData.current.totalPrice,
      type: tempSourceData.current.typeAddress,
      id: tempSourceData.current.sourceId,
      supportedBlockchains: tempSourceData.current.supportedBlockchains
    })
    // Reset recipient tokens
    _recipients.forEach((recipient, index) => {
      setValue(`recipients[${index}].token`, {
        value: '',
        label: 'ETH',
        src: ethTokenImage ?? '/svg/ETH.svg',
        address: '',
        id: ''
      })
    })

    walletSwitchModalProvider.methods.setIsOpen(false)
    tempSourceData.current = null
  }

  const customOptionLabel = (props) => <FormatOptionLabel selectedChain={selectedChain} {...props} />

  const parsedChainData = supportedChains?.map((chain) => ({
    value: chain.chainId,
    label: chain.name,
    imageUrl: chain.imageUrl,
    rpcUrl: chain.rpcUrl,
    safeUrl: chain.safeUrl,
    symbol: chain.symbol
  }))

  const options: IFormatOptionLabel[] = useMemo(() => {
    const list: IFormatOptionLabel[] = []
    // Still using the old selector for the source list logic (Which address is  disabled etc)
    if (availableSource?.length > 0) {
      availableSource?.forEach((item) => {
        list.push({
          value: item.address,
          label: item.name,
          address: item.address,
          totalPrice: formatNumber(item.chainBalance, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }),
          typeAddress: item.sourceType,
          sourceId: item.id,
          isDisabled: !item.isAvailable,
          type: item.sourceType,
          supportedBlockchains: item?.supportedBlockchains,
          ...item
        })
      })
    }
    return list
  }, [availableSource])

  useEffect(() => {
    if (connectedAccount && isChangedAccount) {
      const connectWallet = options?.find((option) => option.address?.toLowerCase() === connectedAccount?.toLowerCase())

      if (connectWallet) {
        setValue('sourceWallet', {
          address: connectWallet.address,
          value: connectWallet.address,
          label: connectWallet.label,
          totalPrice: connectWallet.totalPrice,
          type: connectWallet.typeAddress,
          id: connectWallet.sourceId,
          supportedBlockchains: connectWallet?.supportedBlockchains,
          ...connectWallet
        })
      } else {
        setValue('sourceWallet', {
          address: '',
          label: '',
          id: '',
          totalPrice: '',
          type: '',
          value: '',
          supportedBlockchains: []
        })
      }
    }
  }, [connectedAccount, options, isChangedAccount])

  const handleEmptySource = () =>
    isSourcesLoading ? (
      <div className="flex gap-6 my-6 items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
      </div>
    ) : (
      <div>No wallets found on this chain.</div>
    )

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 h-[40px]">
        <Typography variant="subtitle1">Select the wallet you want to pay from</Typography>
        {connectedAccount && (
          <div className="flex gap-3 items-center">
            <ChainSelectorDropdown supportedChainsFormatted={parsedChainData} />
            <DisconnectWalletChip />
          </div>
        )}
      </div>
      <div className="py-4 w-full">
        {connectedAccount && (
          <>
            <div
              className={`${
                formState?.errors?.sourceWallet?.message &&
                formState?.errors?.sourceWallet?.type !== 'check-multicurrency-for-eoa'
                  ? 'border border-[#C61616] border-separate rounded'
                  : ''
              }`}
            >
              <SelectItem
                name="source-wallet"
                options={options}
                placeholder="Select a wallet"
                customStyles={customStyles}
                formatOptionLabel={customOptionLabel}
                components={{
                  MenuList: (prop) => CustomMenuList(prop, true)
                  // IndicatorsContainer: (props) => CustomIndicatorsContainer(props, handleClose, watch('sourceWallet'))
                }}
                noOptionsMessage={handleEmptySource}
                onChange={handleOnChange}
                value={watch('sourceWallet') || null}
              />
            </div>
            {formState?.errors?.sourceWallet?.message &&
              formState?.errors?.sourceWallet?.type !== 'check-multicurrency-for-eoa' && (
                <ErrorMessage img={ErrorCircleIcon} errorMessage={formState.errors.sourceWallet?.message as string} />
              )}
            {formState?.errors?.sourceWallet?.type === 'check-multicurrency-for-eoa' && (
              <Alert isVisible removeBg variant="warning">
                <Alert.Icon />
                <Alert.Text>
                  You have selected an EOA wallet. Multi-currency payment is currently not supported for EOA wallets.
                  Please add the payments with same currency below.
                </Alert.Text>
              </Alert>
            )}
          </>
        )}
        {!connectedAccount && (
          <>
            <div
              className={`border rounded-lg p-4 ${
                formState?.errors?.sourceWallet?.message ? 'border-[#C61616]' : 'border-[#F1F1EF]'
              }`}
            >
              <Typography variant="body2" color="primary" classNames="mb-4">
                To proceed with your selection, please connect your wallet first.
              </Typography>
              <ConnectWalletButton />
            </div>
            {formState?.errors?.sourceWallet?.message && (
              <ErrorMessage errorMessage={formState.errors.sourceWallet?.message as string} />
            )}
          </>
        )}
      </div>
      <SwitchGnosisToEoaWarningModal provider={walletSwitchModalProvider} onClickPrimary={handleOnClickConfirmSwitch} />
    </div>
  )
}

export default SourceWallet
