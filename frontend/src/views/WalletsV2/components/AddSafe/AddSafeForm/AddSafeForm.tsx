import React, { useState, useMemo, useEffect } from 'react'
import { Alert } from '@/components/Alert'
import TextField from '@/components/TextField/TextField'
import { isAddress } from 'ethers/lib/utils'
import { toChecksumAddress } from 'ethereumjs-util'
import { log } from '@/utils-v2/logger'
import DropDown from '@/components-v2/atoms/Dropdown/index'
import Typography from '@/components-v2/atoms/Typography'
import { useWeb3React } from '@web3-react/core'
import ConnectWalletButton from '@/components-v2/molecules/ConnectWalletButton'
import DisconnectWalletChip from '@/components-v2/molecules/DisconnectWalletChip'
import ChainSelectorDropdown from '@/components-v2/molecules/ChainSelectorDropdownV2'
import ChainSelectorRadio from '@/components-v2/molecules/ChainSelectorRadio'
import CustomDropdownMenu from '../../CustomDropdownMenu'
import warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import RadioButtonCustom from '@/components-v2/atoms/RadioButtonCustom'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import LoadingImage from '@/public/svg/Loader.svg'
import Success from '@/public/svg/check-green.svg'

enum ImportSafeType {
  MANUAL = 'manual',
  LINKED = 'linked'
}
interface IAddSafeForm {
  control: any
  address: string
  errors: any
  safeError: string
  isSubmitting: boolean
  loadingSourceList: boolean
  availableSourceList: string[]
  onSelectAddress: (selectedAddress: string) => void
  onSelectGroup: (group: any) => void
  groupsData: any[]
  group: any
  safeService: any
  checking: boolean
  setChecking: (value: boolean) => void
  selectedChain?: any
  trigger?: any
  setShowCreateGroup: (value: boolean) => void
  manualChain: any
  supportedChains: any[]
  setValue: any
}

const AddSafeForm: React.FC<IAddSafeForm> = ({
  control,
  group,
  errors,
  trigger,
  address,
  safeError,
  groupsData,
  checking,
  setChecking,
  safeService,
  isSubmitting,
  onSelectGroup,
  onSelectAddress,
  loadingSourceList,
  availableSourceList,
  selectedChain,
  setShowCreateGroup,
  manualChain,
  setValue,
  supportedChains
}) => {
  const { account } = useWeb3React()
  const [radioValue, setRadioValue] = useState<ImportSafeType>(ImportSafeType.LINKED)

  const parsedChainData = supportedChains?.map((chain) => ({
    value: chain.chainId,
    label: chain.name,
    imageUrl: chain.imageUrl,
    rpcUrl: chain.rpcUrl,
    safeUrl: chain.safeUrl,
    symbol: chain.symbol
  }))

  const handleChangeChainManual = (option) => {
    setValue(
      'supportedBlockchains',
      supportedChains.find((chain) => chain.id === option.id)
    )
  }

  const chainOptions = useMemo(
    () =>
      supportedChains?.map((chain) => ({
        id: chain.id,
        value: chain.chainId,
        label: chain.name,
        imageUrl: chain.imageUrl
      })),
    [supportedChains]
  )

  useEffect(() => {
    if (safeService && address) {
      trigger('address')
    }
  }, [safeService])

  return (
    <>
      <Typography variant="subtitle2" color="primary" classNames="flex">
        <Typography>Safe Address</Typography>
        <span className="text-error-500 ml-0.5">*</span>
      </Typography>
      <div className="mb-4 border solid rounded-lg border-grey-200 mt-3">
        <div
          className={`flex justify-between pr-6 pl-[14px] py-5 ${
            radioValue === ImportSafeType.LINKED && 'border-b solid border-grey-200'
          }`}
        >
          <RadioButtonCustom
            id="linked-safe"
            radioGroupName="import-safe"
            label="I want to select a Safe address linked to my wallet"
            checked={radioValue === ImportSafeType.LINKED}
            onChange={() => {
              setRadioValue(ImportSafeType.LINKED)
              setValue('supportedBlockchains', selectedChain)
              setValue('address', '')
              trigger()
            }}
            labelClassNames="text-neutral-700 font-semibold"
            wrapperClassNames="!bg-white"
          />
          {account && radioValue === ImportSafeType.LINKED && (
            <div className="flex gap-x-3">
              <ChainSelectorDropdown supportedChainsFormatted={parsedChainData} />
              <DisconnectWalletChip />
            </div>
          )}
        </div>
        {radioValue === ImportSafeType.LINKED && (
          <div className="p-6">
            {account ? (
              <div className="flex flex-col justify-between gap-2">
                {loadingSourceList ? (
                  <div className="h-full w-full flex justify-center items-center flex-col bg-white ">
                    <div className="flex gap-6 mt-6">
                      <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
                      <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
                      <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
                    </div>
                  </div>
                ) : safeError ? (
                  <Alert variant="danger" className="mt-5 leading-6 font-medium py-3" fontSize="text-base">
                    {safeError}
                  </Alert>
                ) : availableSourceList && availableSourceList.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {availableSourceList.map((safeAddress) => (
                        <div
                          className="flex items-center p-4 bg-gray-50 rounded-lg w-full justify-between"
                          key={safeAddress}
                        >
                          <div className="flex items-center">
                            <input
                              id={`${safeAddress}`}
                              type="radio"
                              name="safeAddress"
                              checked={address === safeAddress}
                              onChange={() => onSelectAddress(safeAddress)}
                              className="appearance-none bg-white border rounded-full w-5 h-5 checked:border-neutral-900 checked:border-[6px] mr-4"
                            />
                            {/* eslint-disable jsx-a11y/label-has-associated-control */}
                            <label htmlFor={`${safeAddress}`} className="flex">
                              <WalletAddress split={0} address={safeAddress} variant="body2" color="primary">
                                <WalletAddress.Link
                                  address={safeAddress}
                                  options={supportedChains.filter((chain) => chain.id === selectedChain?.id)}
                                />
                                <WalletAddress.Copy address={safeAddress} />
                              </WalletAddress>
                            </label>
                          </div>
                          <img
                            src={selectedChain.imageUrl}
                            width={16}
                            height={16}
                            className="rounded"
                            alt={selectedChain.id}
                          />
                        </div>
                      ))}
                    </div>
                    {errors?.address?.message && (
                      <div className="text-sm font-inter pt-1 flex items-center text-[#E83F6D]">
                        <div className="mr-2 flex items-center">
                          <Image src={warning} alt="warning" />
                        </div>
                        {errors?.address?.message}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Typography
                      variant="body2"
                      color="primary"
                    >{`You don't have any Safe address linked to ${account}`}</Typography>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Typography variant="body2" color="primary">
                  Connect your wallet to view suggested addresses
                </Typography>
                <ConnectWalletButton />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mb-8 border solid rounded-lg border-grey-200">
        <div
          className={`flex justify-between pr-6 pl-[14px] py-5 ${
            radioValue === ImportSafeType.MANUAL && 'border-b solid border-grey-200'
          }`}
        >
          <RadioButtonCustom
            id="manual-safe"
            radioGroupName="import-safe"
            label="I want to enter Safe address manually"
            checked={radioValue === ImportSafeType.MANUAL}
            onChange={() => {
              setRadioValue(ImportSafeType.MANUAL)
              setValue('address', '')
              setValue('supportedBlockchains', supportedChains[0])
            }}
            labelClassNames="text-neutral-700 font-semibold"
            wrapperClassNames="!bg-white"
          />
        </div>
        {radioValue === ImportSafeType.MANUAL && (
          <div className="p-6">
            <TextField
              errorClass="pt-2"
              disabled={isSubmitting}
              required
              placeholder="Enter Safe address here..."
              name="address"
              control={control}
              rules={{
                required: { value: true, message: 'Address is required.' },
                validate: {
                  isAddress: (value: string) => {
                    try {
                      const convertedToChecksum = toChecksumAddress(value)
                      return isAddress(convertedToChecksum) || 'Invalid wallet address.'
                    } catch {
                      return 'Invalid wallet address'
                    }
                  },
                  isSafe: async (value: string) => {
                    try {
                      setChecking(true)
                      const res = await safeService.getSafeInfo(toChecksumAddress(value))
                      setChecking(false)
                      return res && true
                    } catch (error) {
                      setChecking(false)
                      log.debug(
                        'Safe validation error',
                        ['Safe validation error'],
                        {
                          actualErrorObject: error
                        },
                        `${window.location.pathname}`
                      )
                      return `Safe does not exist on ${manualChain.name}`
                    }
                  }
                }
              }}
            />
            {!checking ? (
              errors?.address?.message ? (
                <div className="text-sm font-inter pt-1 flex items-center text-[#E83F6D]">
                  <div className="mr-2 flex items-center">
                    <Image src={warning} alt="warning" />
                  </div>
                  {errors?.address?.message}
                </div>
              ) : (
                address && (
                  <div className="text-sm font-inter pt-1 flex items-center gap-1 text-green-400">
                    <Image src={Success} alt="loading" width={14} height={14} />
                    Safe successfully verified.
                  </div>
                )
              )
            ) : (
              <div className="text-sm font-inter pt-1 flex items-center gap-1 text-dashboard-main">
                <Image src={LoadingImage} alt="loading" width={20} height={20} className="animate-spin" />
                Verifying safe information.
              </div>
            )}
            <Typography variant="subtitle2" color="primary" classNames="pt-4 pb-3 flex">
              <Typography>Chain</Typography>
              <span className="text-error-500 ml-0.5">*</span>
            </Typography>
            <ChainSelectorRadio
              onChange={handleChangeChainManual}
              selectedOption={manualChain}
              options={chainOptions}
              disabled={checking}
            />
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col">
          <Typography variant="subtitle2" color="primary" classNames="mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="name">Safe Name</label>
            <span className="text-error-500 ml-0.5">*</span>
          </Typography>
          <TextField
            errorClass="pt-2"
            placeholder="Enter a nickname for your safe"
            name="name"
            control={control}
            errors={errors}
            disabled={isSubmitting}
            rules={{
              required: { value: true, message: 'Safe Name is required.' },
              maxLength: {
                value: 70,
                message: 'Wallet name allows maximum of 70 characters.'
              },
              validate: (value: string) => value.trim().length !== 0 || 'Wallet Name is required.'
            }}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <Typography variant="subtitle2" color="primary" classNames="mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="walletGroup">Wallet Group</label>
            <span className="text-error-500 ml-0.5">*</span>
          </Typography>
          <DropDown
            value={group}
            options={groupsData}
            handleOnChange={onSelectGroup}
            placeholder="Select a Wallet Group"
            name="walletGroup"
            width="100%"
            customComponents={{
              // eslint-disable-next-line react/no-unstable-nested-components
              MenuList: (props) => <CustomDropdownMenu {...props} onCreateGroup={() => setShowCreateGroup(true)} />
            }}
          />
        </div>
      </div>
    </>
  )
}

export default AddSafeForm
