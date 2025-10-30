import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { bankAccountSchema } from '@/hooks-v2/contact/add-contact-validation'
import { IBankAccountField } from '@/hooks-v2/contact/type'
import { useLazyGetTripleARequiredFieldsQuery } from '@/slice/contacts/contacts-api'
import { EContactType } from '@/slice/contacts/contacts.types'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { ChangeAction } from '@/views/Recipients/interfaces'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import BankAccountSection from './BankAccountSection'
import CompanySection from './CompanySection'
import IndividualSection from './IndividualSection'
import { OPTIONS_MAP } from './constant'
import { useAppSelector } from '@/state'
import { bankCurrenciesMapSelector } from '@/slice/contacts/contacts.selectors'

interface IAddBankAccountModal {
  provider: any
  action: ChangeAction
  type: EContactType
  bankOptions: { value: string; label: string; country: string; fiatCurrency: string }[]
  defaultBankAccount: IBankAccountField
  currencyOptions: { value: string; label: string }[]
  countryOptions: { value: string; label: string }[]
  onSubmit: (value: IBankAccountField) => void
}

const AddBankAccountModal: React.FC<IAddBankAccountModal> = ({
  type,
  action,
  provider,
  bankOptions,
  countryOptions,
  currencyOptions,
  defaultBankAccount,
  onSubmit
}) => {
  const organizationId = useOrganizationId()
  const bankCurrencyMap = useAppSelector(bankCurrenciesMapSelector)
  const [getRequiredFields] = useLazyGetTripleARequiredFieldsQuery()
  const [bankAccountRequiredFields, setBankAccountRequiredFields] = useState({})
  const [countryCodes, setCountryCodes] = useState({
    individual: '',
    company: '',
    destinationAccount: ''
  })

  const optionMap = useMemo(() => OPTIONS_MAP(countryOptions, currencyOptions), [countryOptions, currencyOptions])

  const {
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
    handleSubmit
  } = useForm<IBankAccountField>({
    defaultValues: defaultBankAccount,
    resolver: yupResolver(
      bankAccountSchema(
        {
          destinationAccount: bankAccountRequiredFields?.[countryCodes?.destinationAccount]?.destinationAccount,
          company: bankAccountRequiredFields?.[countryCodes?.company]?.company,
          individual: bankAccountRequiredFields?.[countryCodes?.individual]?.individual
        },
        bankCurrencyMap,
        type
      )
    )
  })

  useEffect(() => {
    if (!provider?.state?.isOpen) {
      reset({
        individual: {},
        company: {},
        destinationAccount: {}
      })
    } else if (provider?.state?.isOpen && defaultBankAccount) {
      setCountryCodes({
        destinationAccount: defaultBankAccount?.destinationAccount?.countryCode || '',
        company: defaultBankAccount?.company?.countryCode || '',
        individual: defaultBankAccount?.individual?.countryCode || ''
      })
      reset(defaultBankAccount)
    }
  }, [provider?.state?.isOpen, defaultBankAccount])

  const getListRequiredFields = useCallback(async () => {
    if (countryCodes.company && !bankAccountRequiredFields[countryCodes.company]) {
      const res = await getRequiredFields({
        countryCode: countryCodes.company,
        orgId: organizationId
      }).unwrap()

      setBankAccountRequiredFields((prev) => ({ ...prev, [countryCodes.company]: res }))
    }
    if (
      countryCodes.individual &&
      !bankAccountRequiredFields[countryCodes.individual] &&
      countryCodes.individual !== countryCodes.company
    ) {
      const res = await getRequiredFields({
        countryCode: countryCodes.individual,
        orgId: organizationId
      }).unwrap()

      setBankAccountRequiredFields((prev) => ({ ...prev, [countryCodes.individual]: res }))
    }
    if (
      countryCodes.destinationAccount &&
      !bankAccountRequiredFields[countryCodes.destinationAccount] &&
      countryCodes.destinationAccount !== countryCodes.individual &&
      countryCodes.destinationAccount !== countryCodes.company
    ) {
      const res = await getRequiredFields({
        countryCode: countryCodes.destinationAccount,
        orgId: organizationId
      }).unwrap()

      setBankAccountRequiredFields((prev) => ({ ...prev, [countryCodes.destinationAccount]: res }))
    }
  }, [countryCodes])

  useEffect(() => {
    getListRequiredFields()
  }, [countryCodes])

  const onSubmitForm = (data: IBankAccountField) => {
    onSubmit(data)
    provider.methods.setIsOpen(false)
  }

  const handleChangeField = (field, value) => {
    setValue(field, value)
  }

  return (
    <BaseModal provider={provider} classNames="w-[780px]">
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <BaseModal.Header extendedClass="!p-6 !pb-4 border-b">
          <BaseModal.Header.Title>
            {action === ChangeAction.EDIT ? 'Edit Bank Account' : 'Add a Bank Account'}
          </BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body extendedClass="!p-6 !mt-0 max-h-[62vh] overflow-auto">
          <div className="flex flex-col gap-8">
            {type === EContactType.individual ? (
              <IndividualSection
                control={control}
                countryOptions={countryOptions}
                individualInfo={watch('individual')}
                onChangeField={handleChangeField}
                errors={errors?.individual}
                optionMap={optionMap}
                onChangeCountry={(value) => setCountryCodes(value)}
                accountNameErrors={errors?.destinationAccount?.accountName}
                requiredFields={bankAccountRequiredFields?.[countryCodes.individual]?.individual}
              />
            ) : (
              <CompanySection
                control={control}
                companyInfo={watch('company')}
                onChangeField={handleChangeField}
                errors={errors?.company}
                optionMap={optionMap}
                onChangeCountry={(value) => setCountryCodes(value)}
                accountNameErrors={errors?.destinationAccount?.accountName}
                requiredFields={bankAccountRequiredFields?.[countryCodes.company]?.company}
              />
            )}
            <BankAccountSection
              control={control}
              bankOptions={bankOptions}
              countryOptions={countryOptions}
              optionMap={optionMap}
              currencyOptions={currencyOptions}
              bankAccount={watch('destinationAccount')}
              onChangeField={handleChangeField}
              onChangeCountry={(value) => setCountryCodes(value)}
              errors={errors?.destinationAccount}
              requiredFields={bankAccountRequiredFields?.[countryCodes.destinationAccount]?.destinationAccount}
            />
          </div>
        </BaseModal.Body>
        <BaseModal.Footer extendedClass="!p-6 !mt-0">
          <BaseModal.Footer.SecondaryCTA
            label="Cancel"
            onClick={() => {
              provider.methods.setIsOpen(false)
            }}
          />
          <BaseModal.Footer.PrimaryCTA
            label={action === ChangeAction.EDIT ? 'Done' : 'Add Bank Account'}
            type="submit"
          />
        </BaseModal.Footer>
      </form>
    </BaseModal>
  )
}

export default AddBankAccountModal
