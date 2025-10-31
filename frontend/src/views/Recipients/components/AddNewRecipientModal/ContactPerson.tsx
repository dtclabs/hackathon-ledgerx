import React from 'react'
import Image from 'next/legacy/image'
import { FieldArrayWithId } from 'react-hook-form'
import { isAddress } from 'ethers/lib/utils'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import TextField from '@/components/TextField/TextField'
import Typography from '@/components-v2/atoms/Typography'
import warning from '@/assets/svg/warning.svg'
import { isRecipientExistInForm } from '@/utils/validate'
import { IContactPerson } from '../../interfaces'
import { IAddRecipient } from './AddNewRecipientModal'
import useSelectedNativeChainToken from '@/hooks-v2/cryptocurrency/useSelectNativeChainToken'

const ContactPerson: React.FC<IContactPerson> = ({
  watch,
  errors,
  control,
  disabled,
  apiError,
  className,
  tokenItems,
  requiredField,
  chainItems,
  walletFields,
  getImageToken,
  providerFields,
  contactProviders,
  walletFieldsWatch,
  providerFieldsWatch,
  currentChainId,
  register,
  walletRemove,
  walletAppend,
  walletReplace,
  providerRemove,
  getSelectChain,
  getSelectToken,
  providerReplace,
  getSelectProvider,
  providerAppend,
  selectedChain
}) => {
  const { findNativeCoins } = useSelectedNativeChainToken()

  const parseApi = (_apiError) => {
    switch (true) {
      case _apiError && _apiError.includes('wallets'):
        return 'This wallet address has already been imported.'
      case _apiError && _apiError.includes('contacts'):
        return 'This address already exists in your contacts.'
      default:
        return _apiError
    }
  }

  return (
    <div className={`${className || 'px-8 pb-8'}`}>
      <TextField
        control={control}
        errors={errors}
        name="contactName"
        placeholder="Full Name*"
        required
        disabled={disabled}
        rules={{
          required: { value: requiredField, message: 'This field is required.' },
          maxLength: {
            value: 70,
            message: 'Full name allows maximum of 70 characters.'
          },
          validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
        }}
        errorClass="pt-2"
        extendInputClassName="disabled:opacity-70 disabled:cursor-not-allowed"
      />
      {providerFields.map((field, index) => (
        <div key={field.id}>
          <div className="flex items-stretch gap-2 my-2">
            <div className="flex items-center gap-2 border border-[#EAECF0] rounded-lg p-0.5 w-full ">
              <NewFilterDropDown
                triggerButton={
                  <div className="w-[128px] bg-[#F2F4F7] rounded capitalize text-left p-3 flex justify-between items-center text-black-0 text-sm font-medium">
                    {getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                      getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId).name}
                    <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                  </div>
                }
                disabled={(field as any).disabled}
              >
                {contactProviders.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      providerReplace(
                        providerFieldsWatch.map((fieldItem, fieldIndex) =>
                          fieldIndex === index ? { ...fieldItem, providerId: item.id } : fieldItem
                        )
                      )
                    }}
                    className="text-gray-700 flex justify-between items-center bg-white w-full   py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter"
                  >
                    {getSelectProvider(item.id) && getSelectProvider(item.id).name}
                    <div>
                      {(getSelectProvider(item.id) && getSelectProvider(item.id).name) ===
                        (getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                          getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId)
                            .name) && <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />}
                    </div>
                  </button>
                ))}
              </NewFilterDropDown>
              <input
                {...register(`providers.${index}.content`, {
                  validate: {
                    validateMail: () =>
                      !(
                        getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId)
                          .name === 'Email'
                      ) ||
                      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(watch(`providers.${index}.content`)) ||
                      watch(`providers.${index}.content`).length === 0 ||
                      'Please enter a valid email address.'
                  },
                  maxLength: {
                    value: 70,
                    message: `${
                      getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                      getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId).name
                    } allows maximum of 70 characters.`
                  }
                })}
                type="text"
                className=" focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5  w-full h-12 font-inter rounded-lg flex gap-4 items-center px-2 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={(field as any).disabled}
                placeholder={`Enter contact ${
                  getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                  getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId).name
                } ${
                  getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                  getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId).id === '4'
                    ? 'handle'
                    : 'address'
                }`}
              />
            </div>
            {providerFields.length > 1 && (
              <button
                type="button"
                disabled={(field as any).disabled}
                className="border border-[#EAECF0] rounded-lg p-4 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={() => providerRemove(index)}
              >
                <img src="/svg/delete.svg" alt="delete" />
              </button>
            )}
          </div>
          {errors && errors?.providers && errors?.providers[index]?.content && (
            <div className="text-sm font-inter  flex items-center text-[#E83F6D]">
              <div className="mr-2 flex items-center">
                <Image src={warning} alt="warning" />
              </div>
              {errors?.providers[index].content?.message.toString()}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => providerAppend({ providerId: '4', content: '' })}
        className="font-inter rounded-md text-[#344054] px-4 py-2 border border-[#EAECF0] font-medium text-sm mt-2"
      >
        + Add another contact method
      </button>
      <Typography classNames="tracking-wide mb-2 mt-8" variant="body1" styleVariant="medium">
        Wallet*
      </Typography>
      <Typography variant="body2" color="dark" classNames="tracking-wide">
        Enter wallets that you’ll like your contact to receive in. For example, if they only have an ETH wallet. They
        can only receive ETH.
      </Typography>
      {errors?.wallets?.type === 'unique-walletAddress' && (
        <div className="text-sm font-inter  flex items-center text-[#E83F6D] mt-1">
          <div className="mr-2 flex items-center">
            <Image src={warning} alt="warning" />
          </div>
          Wallet addresses should be unique for each network
        </div>
      )}
      {apiError && (
        <div className="text-sm font-inter  flex items-center text-[#E83F6D] mt-1">
          <div className="mr-2 flex items-center">
            <Image src={warning} alt="warning" />
          </div>
          {parseApi(apiError)}
        </div>
      )}
      {walletFields.map((field, index) => (
        <div key={field.id}>
          <div className="flex items-stretch gap-2 my-2">
            <div className="flex items-center gap-2 border border-[#EAECF0] rounded-lg p-0.5 w-full ">
              <NewFilterDropDown
                position="top"
                disabled={(field as any).disabled}
                triggerButton={
                  <div className="w-[128px] bg-neutral-100 rounded capitalize text-left p-3 flex justify-between items-center text-black-0 text-sm font-medium">
                    {getSelectChain((field as any).blockchainId) &&
                      getSelectChain((field as any).blockchainId).label.split(' ')[0]}
                    <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                  </div>
                }
              >
                <div className="max-h-[200px] overflow-auto scrollbar">
                  {chainItems &&
                    chainItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          const nativeCoin = findNativeCoins(item.id)

                          walletReplace(
                            walletFieldsWatch.map((fieldItem, fieldIndex) =>
                              fieldIndex === index
                                ? {
                                    ...fieldItem,
                                    blockchainId: item.id,
                                    cryptocurrencySymbol: nativeCoin?.symbol || 'ETH'
                                  }
                                : fieldItem
                            )
                          )
                        }}
                        className="text-gray-700 flex justify-between items-center bg-white w-full   py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter"
                      >
                        {item.label.split(' ')[0] as string}
                        <div>
                          {(item.id as string) ===
                            (getSelectChain((field as any).blockchainId) &&
                              getSelectChain((field as any).blockchainId).id) && (
                            <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </NewFilterDropDown>
              {/* 
              <NewFilterDropDown
                position="top"
                disabled={(field as any).disabled}
                triggerButton={
                  <div className="w-[128px] bg-neutral-100 rounded capitalize text-left p-3 flex justify-between items-center text-black-0 text-sm font-medium">
                    <div className="flex items-center gap-3 truncate">
                      {getSelectToken((field as any).cryptocurrencySymbol, (field as any).blockchainId) &&
                        getSelectToken((field as any).cryptocurrencySymbol, (field as any).blockchainId).symbol && (
                          <img
                            src={
                              getSelectToken((field as any).cryptocurrencySymbol, (field as any).blockchainId)?.image
                                ?.small
                            }
                            alt="logo"
                            className="h-4 w-4"
                          />
                        )}

                      {getSelectToken((field as any).cryptocurrencySymbol, (field as any).blockchainId) &&
                        getSelectToken((field as any).cryptocurrencySymbol, (field as any).blockchainId).symbol}
                    </div>
                    <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                  </div>
                }
              >
                <div className="max-h-[240px] overflow-auto scrollbar">
                  {tokenItems &&
                    tokenItems[(field as any).blockchainId]?.map((item) => (
                      <button
                        type="button"
                        key={item.publicId}
                        onClick={() => {
                          walletReplace(
                            walletFieldsWatch.map((fieldItem, fieldIndex) =>
                              fieldIndex === index ? { ...fieldItem, cryptocurrencySymbol: item.symbol } : fieldItem
                            )
                          )
                        }}
                        className="text-grey-800 bg-white w-full  py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter "
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <img src={item?.image?.small} alt="logo" className="h-4 w-4" />
                            {item.symbol as string}
                          </div>
                          <div>
                            {(item.publicId as string) ===
                              getSelectToken((field as any).cryptocurrencySymbol, (field as any).blockchainId)
                                ?.publicId && (
                              <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </NewFilterDropDown> */}

              <input
                {...register(`wallets.${index}.walletAddress`, {
                  required: 'This field is required.',
                  validate: {
                    isAddress: (value) => isAddress(value) || 'This address is invalid.',
                    isRecipientExistInForm: (value) =>
                      isRecipientExistInForm({
                        value,
                        list: walletFieldsWatch.map((item) => ({
                          address: item.walletAddress,
                          chainId: item.blockchainId
                        }))
                      }) || 'This contact already exists.'
                  }
                })}
                className="truncate focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5  w-full h-12 font-inter rounded-lg flex gap-4 items-center px-2 disabled:opacity-70 disabled:cursor-not-allowed"
                type="text"
                placeholder="Contact Address*"
                disabled={(field as any).disabled}
              />
            </div>
            {walletFields.length > 1 && (
              <button
                type="button"
                className="border border-[#EAECF0] rounded-lg p-4 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={(field as any).disabled}
                onClick={() => walletRemove(index)}
              >
                <img src="/svg/delete.svg" alt="delete" />
              </button>
            )}
          </div>
          {errors && errors?.wallets && errors?.wallets[index]?.walletAddress && (
            <div className="text-sm font-inter my-1 flex items-center text-[#E83F6D]">
              <div className="mr-2 flex items-center">
                <Image src={warning} alt="warning" />
              </div>
              {parseApi(errors?.wallets?.[index].walletAddress?.message.toString())}
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => walletAppend({ walletAddress: '', blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' })} // todo: Remove hard code for multichain write
        className="rounded-md text-dashboard-main bg-white px-4 py-2 border border-dashboard-border-200 font-medium text-sm"
      >
        + Add another address
      </button>
    </div>
  )
}

export default ContactPerson
