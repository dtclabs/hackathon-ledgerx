import React, { useEffect, useState } from 'react'
import { Divider } from '@/components-v2/Divider'
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
import WalletAddressActionButtons from '@/components-v2/molecules/WalletAddressActionButtons'
import ChainSelectorDropdown, { IChainData } from '@/components-v2/molecules/ChainSelectorDropdown'

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
  setChecking: (value: boolean) => void
  selectedChain?: any
  supportedChains: any[]
}

const AddSafeForm: React.FC<IAddSafeForm> = ({
  control,
  group,
  errors,
  address,
  safeError,
  groupsData,
  setChecking,
  safeService,
  isSubmitting,
  onSelectGroup,
  onSelectAddress,
  loadingSourceList,
  availableSourceList,
  selectedChain,
  supportedChains
}) => {
  const { account } = useWeb3React()

  const [chainDataFormatted, setChainDataFormatted] = useState<IChainData[]>()

  useEffect(() => {
    const formattedData = supportedChains?.map((chain) => ({
      value: chain.chainId,
      label: chain.name,
      imageUrl: chain.imageUrl
    }))
    setChainDataFormatted(formattedData)
  }, [supportedChains])

  return (
    <>
      <Typography variant="subtitle2" color="primary">
        <span>Safe Address</span>
        <span className="text-error-500 ml-0.5">*</span>
      </Typography>
      <div className="mb-8 border solid rounded-2xl border-grey-200 p-6 mt-3">
        {!account && (
          <div>
            <Typography variant="body2" color="primary">
              Connect your wallet to view suggested addresses
            </Typography>
            <ConnectWalletButton />
          </div>
        )}
        {account && (
          <div className="flex flex-col justify-between gap-2">
            <div className="flex justify-between">
              <Typography variant="subtitle2" color="primary">
                Select from safe addresses that are suggested based on your connected wallet
              </Typography>
              <div className="flex gap-x-3">
                <ChainSelectorDropdown supportedChainsFormatted={chainDataFormatted} />
                <DisconnectWalletChip />
              </div>
            </div>
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
              <div className="grid grid-cols-2 gap-3">
                {availableSourceList.map((safeAddress) => (
                  <div
                    className="flex items-center mb-4 p-4 bg-gray-50 rounded-lg w-full justify-between"
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
                      <label htmlFor={`${safeAddress}`} className="flex">
                        <Typography variant="body2">{safeAddress}</Typography>
                        <WalletAddressActionButtons address={safeAddress} />
                      </label>
                    </div>
                    <img
                      src={selectedChain?.imageUrl || ''}
                      width={16}
                      height={16}
                      className="rounded"
                      alt={selectedChain.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Typography
                  variant="body2"
                  color="primary"
                >{`You don't have any Safe address linked to ${account}`}</Typography>
              </div>
            )}
          </div>
        )}
        <Divider label="OR" />
        <TextField
          errorClass="pt-2"
          disabled={isSubmitting}
          errors={errors}
          required
          placeholder="e.g. 0x83D..."
          label="Enter Safe Address Manually"
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
                  return 'Invalid safe address.'
                }
              }
            }
          }}
        />
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
          />
        </div>
      </div>
    </>
  )
}

export default AddSafeForm
