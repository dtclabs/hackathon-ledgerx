import warning from '@/assets/svg/warning.svg'
import RadioButton from '@/components/RadioButton/RadioButton'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import TextField from '@/components/TextField/TextField'
import { styleContact } from '@/constants/styles'
import { EContactType, IContactProvider, IContacts } from '@/slice/contacts/contacts.types'
import { IChain } from '@/slice/platform/platform-slice'
import { IAddRecipient } from '@/views/Recipients/components/AddNewRecipientModal/AddNewRecipientModal'
import ContactPerson from '@/views/Recipients/components/AddNewRecipientModal/ContactPerson'
import Image from 'next/legacy/image'
import React, { useMemo } from 'react'
import {
  Control,
  DeepRequired,
  FieldArrayWithId,
  FieldErrorsImpl,
  UseFieldArrayAppend,
  UseFieldArrayReplace,
  UseFormGetValues,
  UseFormRegister,
  UseFormResetField
} from 'react-hook-form'
import { ActionMeta, MultiValue } from 'react-select'

interface IContactItem {
  recipientList: IContacts[]
  register: UseFormRegister<IAddRecipient>
  control: Control<IAddRecipient, any>
  getValues: UseFormGetValues<IAddRecipient>
  requiredField: boolean
  providerFieldsWatch?: {
    providerId?: string
    content?: string
  }[]
  getImageToken?: any
  walletFieldsWatch?: {
    blockchainId?: string
    cryptocurrencySymbol?: string
    walletAddress?: string
    disabled?: boolean
  }[]
  contactProviders: IContactProvider[]
  errors: FieldErrorsImpl<DeepRequired<IAddRecipient>>
  walletFields: FieldArrayWithId<IAddRecipient, 'wallets' | 'providers', 'id'>[]
  providerFields: FieldArrayWithId<IAddRecipient, 'providers' | 'wallets', 'id'>[]
  providerReplace: UseFieldArrayReplace<IAddRecipient, 'providers' | 'wallets'>
  providerAppend: UseFieldArrayAppend<IAddRecipient, 'providers' | 'wallets'>
  providerRemove: (index?: number | number[]) => void
  walletReplace: UseFieldArrayReplace<IAddRecipient, 'providers' | 'wallets'>
  walletAppend: UseFieldArrayAppend<IAddRecipient, 'providers' | 'wallets'>
  walletRemove: (index?: number | number[]) => void
  getSelectProvider: (providerId: string) => IContactProvider
  watch: any
  onChangeSelectContact: (
    newValue: IFormatOptionLabel | MultiValue<IFormatOptionLabel>,
    actionMeta: ActionMeta<IFormatOptionLabel>
  ) => void
  valueSelectContact: IFormatOptionLabel
  radioValue: string
  setRadioValue: React.Dispatch<React.SetStateAction<string>>
  setValueSelectContact: React.Dispatch<React.SetStateAction<IFormatOptionLabel>>
  activeTab?: string
  showErrorRadio: boolean
  setShowErrorRadio: React.Dispatch<React.SetStateAction<boolean>>
  chainItems: any
  tokenItems: any
  getSelectToken: (tokenId: string, chainId: string) => any
  getSelectChain: (chainId: string) => any
  selectedChain: IChain
}

const ContactItem: React.FC<Partial<IContactItem>> = ({
  recipientList,
  register,
  control,
  getValues,
  chainItems,
  contactProviders,
  errors,
  getImageToken,
  getSelectChain,
  getSelectProvider,
  getSelectToken,
  providerAppend,
  providerFields,
  providerFieldsWatch,
  providerRemove,
  providerReplace,
  requiredField,
  tokenItems,
  walletAppend,
  walletFields,
  walletFieldsWatch,
  walletRemove,
  walletReplace,
  watch,
  onChangeSelectContact,
  valueSelectContact,
  radioValue,
  setRadioValue,
  setValueSelectContact,
  activeTab,
  showErrorRadio,
  setShowErrorRadio,
  selectedChain
}) => {
  const optionContacts = useMemo(
    () =>
      recipientList?.map((item) => ({
        value: item.id,
        label: item.type === EContactType.individual ? item.contactName : item.organizationName
      })),
    [recipientList]
  )
  const handleChangeRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowErrorRadio(false)
    setRadioValue(e.target.value)
    if (e.target.value !== '1') {
      setValueSelectContact({
        label: '',
        value: ''
      })
    }
  }

  return (
    <>
      <div className="border border-dashboard-border-200 rounded-2xl p-4 mb-4">
        <RadioButton
          name="radioValue"
          label="Save to an existing contact"
          classNameLabel="text-grey-900 w-full"
          className="flex gap-3 items-center"
          value="1"
          onChange={handleChangeRadio}
        />
        {radioValue === '1' && (
          <div className="pt-4">
            <SelectItem
              onChange={onChangeSelectContact}
              name="selectContact"
              options={optionContacts}
              placeholder="Select contact"
              customStyles={styleContact}
              noOptionsMessage={() => 'No contact profiles found.'}
              isSearchable
            />
            {!valueSelectContact?.value && showErrorRadio && (
              <div className="text-sm font-inter flex items-center text-[#E83F6D] mt-2">
                <div className="mr-2 flex items-center">
                  <Image src={warning} alt="warning" />
                </div>
                Please select a contact existed to insert your address
              </div>
            )}
          </div>
        )}
        {valueSelectContact?.value && (
          <div className="border-t border-dashboard-border-200 mt-4">
            <div className="text-sm text-dashboard-main pt-4">Contact information</div>
            {activeTab === EContactType.organization && (
              <div className="pt-4">
                <TextField
                  control={control}
                  errors={errors}
                  errorClass="mt-1"
                  name="organizationName"
                  placeholder="Organisation Name*"
                  disabled={getValues('disabled')}
                  rules={{
                    maxLength: {
                      value: 70,
                      message: 'Organisation Name allows maximum of 70 characters.'
                    },
                    required: {
                      value: activeTab === EContactType.organization,
                      message: 'This field is required.'
                    },
                    validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                  }}
                  extendInputClassName="disabled:opacity-70 disabled:cursor-not-allowed"
                />

                <TextField
                  extendInputClassName="mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  errorClass="mt-1"
                  control={control}
                  errors={errors}
                  name="organizationAddress"
                  placeholder="Organisation Mailing Address*"
                  disabled={getValues('disabled')}
                  rules={{
                    required: {
                      value: activeTab === EContactType.organization,
                      message: 'This field is required.'
                    },
                    maxLength: {
                      value: 70,
                      message: 'Organisation Mailing Address allows maximum of 70 characters.'
                    },
                    validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                  }}
                />
                <div className="text-sm text-dashboard-main pt-4">Organisation’s Contact Person</div>
              </div>
            )}
            <ContactPerson
              className="pt-4"
              apiError=""
              requiredField={requiredField}
              watch={watch}
              errors={errors}
              control={control}
              chainItems={chainItems}
              tokenItems={tokenItems}
              providerFieldsWatch={providerFieldsWatch}
              walletFields={walletFields}
              providerFields={providerFields}
              walletFieldsWatch={walletFieldsWatch}
              contactProviders={contactProviders}
              register={register}
              walletAppend={walletAppend}
              walletRemove={walletRemove}
              walletReplace={walletReplace}
              getSelectChain={getSelectChain}
              getSelectToken={getSelectToken}
              providerAppend={providerAppend}
              providerRemove={providerRemove}
              providerReplace={providerReplace}
              getSelectProvider={getSelectProvider}
              getImageToken={getImageToken}
              disabled={getValues('disabled')}
              selectedChain={selectedChain}
            />
          </div>
        )}
      </div>
      <div className="border border-dashboard-border-200 rounded-2xl p-4">
        <RadioButton
          name="radioValue"
          label="Or create new contact"
          classNameLabel="text-grey-900 w-full"
          className="flex gap-3 items-center"
          value="2"
          onChange={handleChangeRadio}
        />
        {radioValue === '2' && (
          <>
            <div className="text-sm text-dashboard-main pt-4">Contact information</div>
            {activeTab === EContactType.organization && (
              <div className="pt-4">
                <TextField
                  control={control}
                  errors={errors}
                  errorClass="mt-1"
                  name="organizationName"
                  placeholder="Organisation Name*"
                  rules={{
                    maxLength: {
                      value: 70,
                      message: 'Organisation Name allows maximum of 70 characters.'
                    },
                    required: {
                      value: activeTab === EContactType.organization,
                      message: 'This field is required.'
                    },
                    validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                  }}
                />

                <TextField
                  extendInputClassName="mt-2"
                  errorClass="mt-1"
                  control={control}
                  errors={errors}
                  name="organizationAddress"
                  placeholder="Organisation Mailing Address*"
                  rules={{
                    required: {
                      value: activeTab === EContactType.organization,
                      message: 'This field is required.'
                    },
                    maxLength: {
                      value: 70,
                      message: 'Organisation Mailing Address allows maximum of 70 characters.'
                    },
                    validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                  }}
                />
                <div className="text-sm text-dashboard-main pt-4">Organisation’s Contact Person</div>
              </div>
            )}
            <ContactPerson
              className="pt-4"
              apiError=""
              requiredField={requiredField}
              watch={watch}
              errors={errors}
              control={control}
              chainItems={chainItems}
              tokenItems={tokenItems}
              providerFieldsWatch={providerFieldsWatch}
              walletFields={walletFields}
              providerFields={providerFields}
              walletFieldsWatch={walletFieldsWatch}
              contactProviders={contactProviders}
              register={register}
              walletAppend={walletAppend}
              walletRemove={walletRemove}
              walletReplace={walletReplace}
              getSelectChain={getSelectChain}
              getSelectToken={getSelectToken}
              providerAppend={providerAppend}
              providerRemove={providerRemove}
              providerReplace={providerReplace}
              getSelectProvider={getSelectProvider}
              getImageToken={getImageToken}
              disabled={getValues('disabled')}
              selectedChain={selectedChain}
            />
          </>
        )}
      </div>
      {!radioValue && showErrorRadio && (
        <div className="text-sm font-inter flex items-center text-[#E83F6D] mt-2">
          <div className="mr-2 flex items-center">
            <Image src={warning} alt="warning" />
          </div>
          Please select an option to save contact
        </div>
      )}
    </>
  )
}

export default ContactItem
