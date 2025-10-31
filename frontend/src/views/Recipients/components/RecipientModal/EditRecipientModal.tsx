import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import TextField from '@/components/TextField/TextField'
import React from 'react'
import {
  Control,
  DeepRequired,
  FieldArrayWithId,
  FieldErrorsImpl,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayReplace,
  UseFormRegister,
  UseFormResetField
} from 'react-hook-form'
import { IAddRecipient } from '../AddNewRecipientModal/AddNewRecipientModal'
import warning from '@/assets/svg/warning.svg'
import Close from '@/public/svg/CloseGray.svg'
import Image from 'next/legacy/image'
import { isAddress } from 'ethers/lib/utils'
import { isRecipientExistInForm } from '@/utils/validate'
import { IChain } from '@/slice/platform/platform-slice'
import Typography from '@/components-v2/atoms/Typography'
import useSelectedNativeChainToken from '@/hooks-v2/cryptocurrency/useSelectNativeChainToken'
import { selectChainByName } from '@/slice/chains/chain-selectors'
import { useAppSelector } from '@/state'
import { EContactType, IContactProvider } from '@/slice/contacts/contacts.types'

interface IEditRecipientModal {
  control: Control<IAddRecipient, any>
  recipient: any
  errors: FieldErrorsImpl<DeepRequired<IAddRecipient>>
  providerFields: FieldArrayWithId<IAddRecipient, 'wallets' | 'providers', 'id'>[]
  providerReplace: UseFieldArrayReplace<IAddRecipient, 'wallets' | 'providers'>
  providerRemove: UseFieldArrayRemove
  providerAppend: UseFieldArrayAppend<IAddRecipient, 'wallets' | 'providers'>
  walletFields: FieldArrayWithId<IAddRecipient, 'wallets' | 'providers', 'id'>[]
  walletReplace: UseFieldArrayReplace<IAddRecipient, 'wallets' | 'providers'>
  walletRemove: UseFieldArrayRemove
  walletAppend: UseFieldArrayAppend<IAddRecipient, 'wallets' | 'providers'>
  register: UseFormRegister<IAddRecipient>
  providerFieldsWatch: { providerId?: string; content?: string }[]
  walletFieldsWatch?: {
    blockchainId?: string
    cryptocurrencySymbol?: string
    walletAddress?: string
    disabled?: boolean
  }[]
  getImageToken: (tokenName: string) => {
    name: string
    logoUrl: string
    decimal: number
  }
  getSelectProvider: (providerId: string) => IContactProvider
  contactProvidersSelector: any
  chainItems: any
  tokenItems: any
  getSelectToken: (tokenId: string, chaindId: string) => any
  getSelectChain: (chainId: string) => any
  resetField: UseFormResetField<IAddRecipient>
  contactName: string
  organisationAddress: string
  organisationName: string
  watch: any
  currentChainId?: number
  selectedChain?: IChain
}

const EditRecipientModal: React.FC<IEditRecipientModal> = ({
  watch,
  control,
  errors,
  providerFields,
  recipient,
  providerAppend,
  providerRemove,
  providerReplace,
  walletAppend,
  walletFields,
  register,
  walletRemove,
  walletReplace,
  providerFieldsWatch,
  walletFieldsWatch,
  getSelectToken,
  getImageToken,
  getSelectChain,
  getSelectProvider,
  contactProvidersSelector,
  chainItems,
  tokenItems,
  resetField,
  contactName,
  organisationAddress,
  organisationName
}) => {
  const { findNativeCoins } = useSelectedNativeChainToken()
  const defaultChain = useAppSelector((state) => selectChainByName(state, 'ethereum'))

  return (
    <div className="border-t border-dashboard-border-200 text-dashboard-sub">
      <div className="px-6">
        {recipient.type === EContactType.organization && (
          <>
            <div className="flex items-center pt-6 pb-2">
              <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
                Organisation Name
              </Typography>
              <TextField
                textSearch={organisationName}
                handleReset={() => resetField('organizationName', { defaultValue: '' })}
                classNameContainer="flex flex-col items-end flex-1"
                name="organizationName"
                control={control}
                errors={errors}
                placeholder="Organisation Name"
                classNameInput=" focus:outline-none text-sm text-grey-800 placeholder:text-[#98A2B3] placeholder:leading-5 h-12 font-inter rounded-lg flex gap-4 flex-end items-center px-4 w-full"
                rules={{
                  required: { value: true, message: 'This field is required.' },
                  maxLength: {
                    value: 70,
                    message: 'Organisation Name allows maximum of 70 characters.'
                  },
                  validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                }}
                errorClass="self-baseline mt-2"
              />
            </div>
            <div className="flex items-center pb-6 border-b border-dashboard-border-200">
              <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
                Organisation Mailing Address
              </Typography>
              <TextField
                textSearch={organisationAddress}
                handleReset={() => resetField('organizationAddress', { defaultValue: '' })}
                classNameContainer="flex flex-col items-end flex-1"
                name="organizationAddress"
                control={control}
                errors={errors}
                placeholder="Organisation Mailing Address"
                classNameInput="focus:outline-none  text-sm text-grey-800 placeholder:text-[#98A2B3] placeholder:leading-5  w-full h-12 font-inter  rounded-lg flex gap-4 items-center px-4 "
                rules={{
                  required: { value: true, message: 'This field is required.' },
                  maxLength: {
                    value: 70,
                    message: 'Organisation Mailing Address allows maximum of 70 characters.'
                  },
                  validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                }}
                errorClass="self-baseline mt-2 "
              />
            </div>
          </>
        )}
        <div
          className={`flex items-center ${
            recipient.type === EContactType.organization ? 'pt-6' : 'py-6 border-b border-dashboard-border-200'
          }`}
        >
          <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
            {recipient.type === EContactType.organization ? 'Organisation’s Contact Person' : 'Full Name'}
          </Typography>
          <div className="flex gap-1 flex-col flex-1">
            <TextField
              textSearch={contactName}
              handleReset={() => resetField('contactName', { defaultValue: '' })}
              classNameContainer="flex flex-col items-end"
              name="contactName"
              control={control}
              errors={errors}
              classNameInput="focus:outline-none text-sm text-grey-800 placeholder:text-[#98A2B3] placeholder:leading-5 h-12 font-inter rounded-lg flex gap-4 items-center px-4 flex-1"
              required
              rules={{
                required: {
                  value: recipient.type === EContactType.individual,
                  message: 'This field is required.'
                },
                maxLength: {
                  value: 70,
                  message: `${
                    recipient.type === EContactType.organization
                      ? 'Organisation’s Contact Person allows maximum of 70 characters.'
                      : 'Full name allows maximum of 70 characters.'
                  }`
                },
                validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
              }}
              placeholder="Enter Contact Person"
              errorClass="self-baseline mt-2 "
            />
          </div>
        </div>
        <div
          className={`flex border-b border-dashboard-border-200 ${
            recipient.type === EContactType.organization ? 'py-4' : 'py-6'
          }`}
        >
          <Typography variant="body1" styleVariant="medium" classNames="py-3 w-1/3 max-w-[300px]">
            Contact&apos;s Details
          </Typography>
          <div className="flex flex-col flex-1">
            {providerFields.map((field, index) => (
              <React.Fragment key={field.id}>
                <div key={field.id} className="flex items-stretch gap-2 mb-2">
                  <div className="flex items-center gap-2 border border-[#EAECF0] rounded-lg flex-1">
                    <NewFilterDropDown
                      triggerButton={
                        <div className="w-[128px] bg-[#F2F4F7] rounded capitalize text-left ml-1 my-1 p-3 flex justify-between items-center text-grey-800 text-sm font-medium">
                          {getSelectProvider(
                            (field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId
                          ) &&
                            getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId)
                              .name}
                          <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                        </div>
                      }
                    >
                      {contactProvidersSelector.map((item) => (
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
                          className="text-grey-800 bg-white w-full   py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter flex items-center justify-between"
                        >
                          {getSelectProvider(item.id) && getSelectProvider(item.id).name}
                          <div>
                            {(getSelectProvider(item.id) && getSelectProvider(item.id).name) ===
                              (getSelectProvider(
                                (field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId
                              ) &&
                                getSelectProvider(
                                  (field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId
                                ).name) && (
                              <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </NewFilterDropDown>
                    <input
                      {...register(`providers.${index}.content`, {
                        validate: {
                          validateMail: () =>
                            !(
                              getSelectProvider(
                                (field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId
                              ).name === 'Email'
                            ) ||
                            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(watch(`providers.${index}.content`)) ||
                            watch(`providers.${index}.content`).length === 0 ||
                            'Please enter a valid email address.'
                        },
                        maxLength: {
                          value: 70,
                          message: `${
                            getSelectProvider(
                              (field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId
                            ) &&
                            getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId)
                              .name
                          } allows maximum of 70 characters.`
                        }
                      })}
                      type="text"
                      className=" focus:outline-none text-sm text-grey-800 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-12 font-inter rounded-lg flex gap-4 items-center px-2"
                      placeholder={`Enter contacts's ${
                        getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                        getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId).name
                      } ${
                        getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId) &&
                        getSelectProvider((field as FieldArrayWithId<IAddRecipient, 'providers', 'id'>).providerId)
                          .id === '4'
                          ? 'handle'
                          : 'address'
                      } `}
                    />
                    {providerFieldsWatch && providerFieldsWatch[index] && providerFieldsWatch[index].content && (
                      <div className="pr-4">
                        <button
                          type="button"
                          onClick={() => resetField(`providers.${index}.content`, { defaultValue: '' })}
                          className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
                        >
                          <Image src={Close} alt="close" height={10} width={10} />
                        </button>
                      </div>
                    )}
                  </div>
                  {providerFields.length > 1 && (
                    <button
                      type="button"
                      className="border border-[#EAECF0] rounded-lg p-4"
                      onClick={() => providerRemove(index)}
                    >
                      <img src="/svg/delete.svg" alt="delete" />
                    </button>
                  )}
                </div>
                {errors && errors?.providers && errors?.providers[index]?.content && (
                  <div className="text-sm font-inter flex items-center text-[#E83F6D] pb-2">
                    <div className="mr-2 flex items-center">
                      <Image src={warning} alt="warning" />
                    </div>
                    {errors?.providers[index].content?.message.toString()}
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="text-left">
              <button
                type="button"
                onClick={() => providerAppend({ providerId: '4', content: '' })}
                className="font-inter rounded-md text-[#344054] px-4 py-2 border border-[#EAECF0] font-normal text-xs pt-3 text-right mt-2"
              >
                + Add another contact method
              </button>
            </div>
          </div>
        </div>
        <div className="flex py-6">
          <Typography variant="body1" styleVariant="medium" classNames="py-3 w-1/3 max-w-[300px]">
            Wallets
          </Typography>
          <div className="flex flex-col flex-1">
            {walletFields.map((field, index) => (
              <React.Fragment key={field.id}>
                <div key={field.id} className="flex gap-2 mb-2">
                  <div className="flex items-center gap-1 border border-[#EAECF0] rounded-lg p-0.5 w-full ">
                    <NewFilterDropDown
                      position="top"
                      triggerButton={
                        <div className="w-[140px] bg-[#F2F4F7] rounded capitalize text-left p-3 flex justify-between items-center text-grey-800 text-sm font-medium">
                          {getSelectChain((field as any).blockchainId) &&
                            getSelectChain((field as any).blockchainId).label.split(' ')[0]}
                          <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                        </div>
                      }
                    >
                      <div className="max-h-[200px] overflow-auto">
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
                              className="text-grey-800 bg-white w-full  block py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter"
                            >
                              <div className="flex justify-between items-center">
                                {item.label.split(' ')[0] as string}
                                <div>
                                  {(item.id as string) ===
                                    (getSelectChain((field as any).blockchainId) &&
                                      getSelectChain((field as any).blockchainId).id) && (
                                    <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </NewFilterDropDown>
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
                            }) || 'This contact is exist.'
                        }
                      })}
                      className=" focus:outline-none text-sm text-grey-800 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-12 font-inter rounded-lg flex gap-4 items-center px-2"
                      type="text"
                      placeholder="Enter Contacts Address"
                    />
                    {walletFieldsWatch && walletFieldsWatch[index] && walletFieldsWatch[index].walletAddress && (
                      <div className="pr-4">
                        <button
                          type="button"
                          onClick={() => resetField(`wallets.${index}.walletAddress`, { defaultValue: '' })}
                          className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
                        >
                          <Image src={Close} alt="close" height={10} width={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  {walletFields.length > 1 && (
                    <button
                      type="button"
                      className="border border-[#EAECF0] rounded-lg p-4"
                      onClick={() => walletRemove(index)}
                    >
                      <img src="/svg/delete.svg" alt="delete" />
                    </button>
                  )}
                </div>
                {errors && errors?.wallets && errors?.wallets[index]?.walletAddress && (
                  <div className="text-sm font-inter flex items-center my-1 text-[#E83F6D]">
                    <div className="mr-2 flex items-center">
                      <Image src={warning} alt="warning" />
                    </div>
                    {errors?.wallets[index].walletAddress?.message.toString()}
                  </div>
                )}
              </React.Fragment>
            ))}
            {errors?.wallets?.type === 'unique-walletAddress' && (
              <div className="text-sm font-inter  flex items-center text-[#E83F6D] mt-1">
                <div className="mr-2 flex items-center">
                  <Image src={warning} alt="warning" />
                </div>
                Wallet addresses should be unique for each network
              </div>
            )}
            <div className="text-left">
              <button
                type="button"
                onClick={() =>
                  walletAppend({ walletAddress: '', blockchainId: defaultChain?.id, cryptocurrencySymbol: 'ETH' })
                }
                className="font-inter rounded-md text-[#344054] px-4 py-2 border border-[#EAECF0] font-normal text-xs pt-3 text-right mt-2"
              >
                + Add another wallet address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditRecipientModal
