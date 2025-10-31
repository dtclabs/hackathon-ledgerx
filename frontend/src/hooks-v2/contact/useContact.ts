import { useGetCountriesQuery, useGetFiatCurrenciesQuery } from '@/api-v2/org-settings-api'
import {
  useDeleteRecipientBankAccountMutation,
  useLazyGetRecipientBankAccountQuery,
  useLazyGetRecipientBankAccountsQuery,
  usePostRecipientBankAccountMutation,
  useUpdateRecipientBankAccountMutation
} from '@/slice/contact-bank-accounts/contact-bank-accounts-api'
import { IContactBankAccount } from '@/slice/contact-bank-accounts/contact-bank-accounts-types'
import { useDeleteContactMutation, useEditContactMutation, usePostContactMutation } from '@/slice/contacts/contacts-api'
import { bankListSelector, setContactBankAccounts } from '@/slice/contacts/contacts-slice'
import { EContactType, IContacts } from '@/slice/contacts/contacts.types'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppDispatch, useAppSelector } from '@/state'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { addRecipientSchema } from './add-contact-validation'
import { WHITELIST_COUNTRY_CODE } from './constant'
import { IAddContact, IBankAccountField, IUseCreateContact, TripleARecipientType } from './type'
import _ from 'lodash'

const DEFAULT_WALLET_FIELD = { walletAddress: '', blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }
const DEFAULT_PROVIDER_FIELD = { content: '', providerId: '4' }

const parseApi = (_apiError) => {
  switch (true) {
    case _apiError && _apiError.includes('wallets must contain at least 1 elements'):
      return 'At least one wallet is required.'
    case _apiError && _apiError.includes('wallets'):
      return 'This wallet address has already been imported.'
    case _apiError && _apiError.includes('contacts'):
      return 'This address already exists in your contacts.'
    default:
      return _apiError
  }
}

const useContact = ({
  type,
  organizationId,
  contact,
  bankAccounts
}: {
  type: EContactType
  organizationId: string
  contact?: IContacts
  bankAccounts?: IContactBankAccount[]
}): IUseCreateContact => {
  const initBankAccounts = useRef(false)
  const hasChange = useRef({})
  const router = useRouter()
  const listTab = window.sessionStorage.getItem('contact-tab')
  const backURL = `/${organizationId}/contacts${listTab ? `?tab=${listTab}` : ''}`

  const dispatch = useAppDispatch()
  const orgSettings = useAppSelector(orgSettingsSelector)
  const bankList = useAppSelector(bankListSelector)

  const { data: countries } = useGetCountriesQuery({})
  const { data: fiatCurrencies } = useGetFiatCurrenciesQuery({})

  const [postContact, postContactResult] = usePostContactMutation()
  const [postContactBackAccounts, postContactBackAccountsRes] = usePostRecipientBankAccountMutation()
  const [updateContactBackAccounts, updateContactBackAccountsRes] = useUpdateRecipientBankAccountMutation()
  const [deleteContactBackAccounts, deleteContactBackAccountsRes] = useDeleteRecipientBankAccountMutation()
  const [editContact, editContactResult] = useEditContactMutation()
  const [deleteContact, deleteContactResult] = useDeleteContactMutation()
  const [getBankAccount] = useLazyGetRecipientBankAccountQuery()
  const [getBankAccounts] = useLazyGetRecipientBankAccountsQuery()

  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBankAccountsLoading, setIsBankAccountsLoading] = useState(false)

  const getAllContactBankAccounts = useCallback(async () => {
    const list: IContactBankAccount[] = []
    try {
      if (contact?.id) {
        setIsBankAccountsLoading(true)

        const contactBankAccounts = await getBankAccounts({
          orgId: organizationId,
          contactId: contact?.publicId,
          params: { size: 999 }
        }).unwrap()

        if (contactBankAccounts?.items?.length > 0) {
          await Promise.all(
            contactBankAccounts.items.map(async (_bank) => {
              const _bankAccount = await getBankAccount({
                orgId: organizationId,
                contactId: contact?.publicId,
                id: _bank.id
              }).unwrap()

              list.push(_bankAccount)

              return null
            })
          )
          initBankAccounts.current = true
          dispatch(setContactBankAccounts(list))
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsBankAccountsLoading(false)
    }
    setIsBankAccountsLoading(false)
    reset({
      ...watch(),
      bankAccounts: list.map((_bank) => ({
        destinationAccount: {
          routingCode: '',
          ..._bank.destinationAccount,
          bankName: _bank.bankName,
          currency: _bank.fiatCurrency.code
        },
        company: _bank.recipientType === TripleARecipientType.COMPANY ? { ..._bank.recipient } : {},
        individual: _bank.recipientType === TripleARecipientType.INDIVIDUAL ? { ..._bank.recipient } : {},
        publicId: _bank.id
      }))
    })
  }, [contact?.id])

  useEffect(() => {
    // if (!initBankAccounts.current) {
    if (contact?.id && !bankAccounts?.length) {
      getAllContactBankAccounts()
    } else if (contact?.id && bankAccounts?.length) {
      reset({
        ...watch(),
        bankAccounts: bankAccounts.map((_bank) => ({
          destinationAccount: {
            routingCode: '',
            ..._bank.destinationAccount,
            bankName: _bank.bankName,
            currency: _bank.fiatCurrency.code
          },
          company: _bank.recipientType === TripleARecipientType.COMPANY ? { ..._bank.recipient } : {},
          individual: _bank.recipientType === TripleARecipientType.INDIVIDUAL ? { ..._bank.recipient } : {},
          publicId: _bank.id
        }))
      })
      initBankAccounts.current = true
    }
    // }
  }, [contact?.id, bankAccounts])

  const parseContact: IAddContact = useMemo(
    () =>
      contact
        ? {
            contactName: contact.contactName,
            organizationAddress: contact.organizationAddress,
            organizationName: contact.organizationName,
            providers: contact.recipientContacts?.length
              ? contact.recipientContacts.map((_provider) => ({
                  content: _provider.content || '',
                  providerId: _provider.contactProvider?.id.toString() || '4'
                }))
              : [{ content: '', providerId: '4' }],
            wallets: contact.recipientAddresses?.map((_address) => ({
              walletAddress: _address.address,
              blockchainId: _address.blockchainId,
              cryptocurrencySymbol: _address.cryptocurrency.symbol
            })),
            type
          }
        : null,
    [contact]
  )

  const {
    control,
    formState: { errors },
    reset,
    watch,
    trigger,
    handleSubmit
  } = useForm<IAddContact>({
    resolver: yupResolver(addRecipientSchema),
    defaultValues: parseContact || {
      contactName: '',
      organizationAddress: '',
      organizationName: '',
      type,
      providers: [DEFAULT_PROVIDER_FIELD]
    }
  })

  const {
    fields: providerFields,
    append: providerAppend,
    remove: providerRemove,
    update: providerUpdate
  } = useFieldArray<IAddContact>({ control, name: 'providers', keyName: 'id' })

  const {
    fields: walletFields,
    append: walletAppend,
    remove: walletRemove,
    update: walletUpdate
  } = useFieldArray<IAddContact>({ control, name: 'wallets', keyName: 'id' })

  const {
    fields: bankAccountFields,
    append: bankAccountAppend,
    remove: bankAccountRemove,
    update: bankAccountUpdate
  } = useFieldArray<IAddContact>({ control, name: 'bankAccounts', keyName: 'id' })

  const DEFAULT_BANK_ACCOUNT_FIELD: IBankAccountField = useMemo(
    () => ({
      destinationAccount: {
        countryCode: '',
        currency: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        bankId: '',
        routingCode: ''
      },
      company: {
        countryCode: '',
        registeredName: ''
      },
      individual: {
        countryCode: '',
        firstName: '',
        lastName: ''
      }
    }),
    [orgSettings]
  )

  useEffect(() => {
    if (parseContact) {
      reset({ ...watch(), ...parseContact })
    }
  }, [parseContact])

  const currencyOptions = useMemo(
    () =>
      fiatCurrencies?.data
        ?.map((_currency) => ({
          value: _currency.code,
          label: _currency.code
        }))
        ?.sort((a, b) => (a.label < b.label ? -1 : 1)) || [],
    [fiatCurrencies]
  )
  const countryOptions = useMemo(
    () =>
      countries?.data
        ?.filter((_country) => WHITELIST_COUNTRY_CODE.includes(_country?.iso3))
        ?.map((_country) => ({ value: _country.iso3, label: _country.name }))
        ?.sort((a, b) => (a.label < b.label ? -1 : 1)) || [],
    [countries]
  )
  const bankOptions = useMemo(
    () =>
      bankList
        ?.map((_bank) => ({
          value: _bank.id,
          label: _bank.name,
          country: _bank.countryCode,
          fiatCurrency: _bank.currency
        }))
        ?.sort((a, b) => (a.label < b.label ? -1 : 1)) || [],
    [bankList]
  )

  useEffect(() => {
    if (postContactResult.isError) {
      setApiError(parseApi(postContactResult.error.data.message))
    }
  }, [postContactResult.isError])

  useEffect(() => {
    if (editContactResult.isError) {
      setApiError(parseApi(editContactResult.error.data.message))
    }
  }, [editContactResult.isError, editContactResult.isSuccess])

  useEffect(() => {
    if (postContactBackAccountsRes.isError) {
      toast.error('An error has occurred while adding bank account')
    }
  }, [postContactBackAccountsRes.isError])
  useEffect(() => {
    if (updateContactBackAccountsRes.isError) {
      toast.error('An error has occurred while updating bank account')
    }
  }, [updateContactBackAccountsRes.isError])
  useEffect(() => {
    if (deleteContactBackAccountsRes.isError) {
      toast.error('An error has occurred while deleting bank account')
    }
  }, [deleteContactBackAccountsRes.isError])

  useEffect(() => {
    if (deleteContactResult.isError) {
      toast.error(deleteContactResult.error.data.message)
    } else if (deleteContactResult.isSuccess) {
      toast.success('Successfully deleted contact')
      router.push(backURL)
    }
  }, [deleteContactResult.isError, deleteContactResult.isSuccess])

  // function
  const onRemoveWallet = (_index: number) => {
    walletRemove(_index)
  }
  const onAppendWallet = () => {
    walletAppend(DEFAULT_WALLET_FIELD)
    if (errors?.wallets?.message) trigger('wallets')
  }
  const onUpdateWallet = (_index: number, value) => {
    walletUpdate(_index, value)
  }
  const onRemoveProvider = (_index: number) => {
    providerRemove(_index)
  }
  const onAppendProvider = () => {
    providerAppend(DEFAULT_PROVIDER_FIELD)
  }
  const onUpdateProvider = (_index: number, value) => {
    providerUpdate(_index, value)
  }
  const onRemoveBankAccount = (_index: number) => {
    bankAccountRemove(_index)
  }
  const onAppendBankAccount: (value?: IBankAccountField) => void = (value) => {
    bankAccountAppend(value ?? DEFAULT_BANK_ACCOUNT_FIELD)
  }
  const onUpdateBankAccount = (_index: number, value) => {
    if (value?.publicId) hasChange.current[value.publicId] = true

    bankAccountUpdate(_index, value)
  }

  const onCreateContact = async (data: IAddContact) => {
    try {
      setLoading(true)
      const res = await postContact({
        orgId: organizationId,
        payload: {
          organizationName: data.organizationName.trim(),
          type: data.type,
          contactName: data.contactName.trim(),
          contacts: data.providers
            .map((provider) => ({ providerId: provider.providerId, content: provider.content }))
            .filter((item) => item.content !== ''),
          organizationAddress: data.organizationAddress,
          wallets: data.wallets
            .map((wallet) => ({
              blockchainId: wallet.blockchainId,
              address: wallet.walletAddress,
              cryptocurrencySymbol: String(wallet.cryptocurrencySymbol)
            }))
            .filter((item) => item.address !== '')
        }
      }).unwrap()

      if (data?.bankAccounts?.length > 0) {
        await Promise.all(
          data.bankAccounts.map(async (bankAccount) => {
            const firstName = bankAccount.destinationAccount.accountName.split(' ')[0]
            const lastName = bankAccount.destinationAccount.accountName.split(' ').slice(1).join(' ')

            const parsedCompany = _.omitBy(bankAccount.company, _.isEmpty)
            const parsedIndividual = _.omitBy(bankAccount.individual, _.isEmpty)
            const _bankAccount = await postContactBackAccounts({
              orgId: organizationId,
              contactId: res.data.publicId,
              payload: {
                destinationAccount: {
                  ...bankAccount.destinationAccount
                },
                recipientType:
                  type === EContactType.individual ? TripleARecipientType.INDIVIDUAL : TripleARecipientType.COMPANY,
                recipient:
                  type === EContactType.individual
                    ? { ...parsedIndividual, firstName, lastName }
                    : { ...parsedCompany, registeredName: bankAccount.destinationAccount.accountName }
              }
            }).unwrap()

            return _bankAccount
          })
        )
      }

      setLoading(false)
      toast.success('Successfully created contact')
      router.push(backURL)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const onEditContact = async (data: IAddContact) => {
    if (contact?.id) {
      try {
        setLoading(true)
        await editContact({
          orgId: organizationId,
          id: contact.id,
          payload: {
            organizationName: data.organizationName,
            type: contact.type,
            contactName: data.contactName,
            contacts: data.providers
              .map((provider) => ({ providerId: provider.providerId, content: provider.content }))
              .filter((item) => item.content !== ''),
            organizationAddress: data.organizationAddress,
            wallets: data.wallets
              .map((wallet) => ({
                blockchainId: String(wallet.blockchainId),
                address: wallet.walletAddress,
                cryptocurrencySymbol: String(wallet.cryptocurrencySymbol)
              }))
              .filter((item) => item.address !== '')
          }
        }).unwrap()

        const list = []

        const updatedBanks =
          data?.bankAccounts?.filter((item) => item?.publicId && hasChange.current?.[item?.publicId]) || []
        const updatedIds = updatedBanks?.map((item) => item.publicId)

        const newBanks = data?.bankAccounts?.filter((item) => !item?.publicId) || []
        const deletedBanks =
          bankAccounts?.filter((item) => !data?.bankAccounts?.some((_item) => _item?.publicId === item?.id)) || []
        const deletedIds = deletedBanks?.map((item) => item.id)

        await Promise.all([
          // create
          ...newBanks.map(async (bankAccount) => {
            const firstName = bankAccount.destinationAccount.accountName.split(' ')[0]
            const lastName = bankAccount.destinationAccount.accountName.split(' ').slice(1).join(' ')

            const parsedCompany = _.omitBy(bankAccount.company, _.isEmpty)
            const parsedIndividual = _.omitBy(bankAccount.individual, _.isEmpty)
            const _bankAccount = await postContactBackAccounts({
              orgId: organizationId,
              contactId: contact.publicId,
              payload: {
                destinationAccount: {
                  ...bankAccount.destinationAccount
                },
                recipientType:
                  type === EContactType.individual ? TripleARecipientType.INDIVIDUAL : TripleARecipientType.COMPANY,
                recipient:
                  type === EContactType.individual
                    ? { ...parsedIndividual, firstName, lastName }
                    : { ...parsedCompany, registeredName: bankAccount.destinationAccount.accountName }
              }
            }).unwrap()

            list.push(_bankAccount)
            return _bankAccount
          })
        ])
        // dispatch(setContactBankAccounts(list))

        await Promise.all([
          // update
          ...updatedBanks.map(async (bankAccount) => {
            const bank = bankOptions?.find(
              (option) =>
                option.country === bankAccount.destinationAccount.countryCode &&
                option.label.toLowerCase() === bankAccount.destinationAccount.bankName.toLowerCase()
            )
            const firstName = bankAccount.destinationAccount.accountName.split(' ')[0]
            const lastName = bankAccount.destinationAccount.accountName.split(' ').slice(1).join(' ')

            const parsedCompany = _.omitBy(bankAccount.company, _.isEmpty)
            const parsedIndividual = _.omitBy(bankAccount.individual, _.isEmpty)
            const _bankAccount = await updateContactBackAccounts({
              orgId: organizationId,
              contactId: contact.publicId,
              id: bankAccount.publicId,
              payload: {
                destinationAccount: {
                  ...bankAccount.destinationAccount,
                  bankId: bankAccount.destinationAccount.bankId || bank?.value,
                  bankName: bank?.label || bankAccount.destinationAccount.bankName
                },
                recipientType:
                  type === EContactType.individual ? TripleARecipientType.INDIVIDUAL : TripleARecipientType.COMPANY,
                recipient:
                  type === EContactType.individual
                    ? { ...parsedIndividual, firstName, lastName }
                    : { ...parsedCompany, registeredName: bankAccount.destinationAccount.accountName }
              }
            }).unwrap()

            list.push(_bankAccount)
            return _bankAccount
          })
        ])
        dispatch(
          setContactBankAccounts([
            ...bankAccounts.filter((bank) => {
              const isNotUpdated = !updatedIds.includes(bank.id)
              const isNotDeleted = !deletedIds.includes(bank.id)

              return isNotUpdated && isNotDeleted
            }),
            ...list
          ])
        )

        await Promise.all([
          // delete
          ...deletedBanks.map(async (bankAccount) => {
            const _bankAccount = await deleteContactBackAccounts({
              orgId: organizationId,
              contactId: contact.publicId,
              id: bankAccount.id
            }).unwrap()

            return _bankAccount
          })
        ])
        setLoading(false)
        toast.success('Successfully edited contact')
        router.push(`/${organizationId}/contacts/${contact.id}`)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const onDeleteContact = () => {
    if (contact?.id) {
      deleteContact({
        orgId: organizationId,
        payload: { id: contact.id }
      })
    }
  }

  return {
    control,
    errors,
    apiError,
    isLoading: loading,
    isBankAccountsLoading,
    walletFields,
    providerFields,
    bankAccountFields,
    currencyOptions,
    countryOptions,
    bankOptions,
    onRemoveWallet,
    onAppendWallet,
    onUpdateWallet,
    onRemoveProvider,
    onAppendProvider,
    onUpdateProvider,
    onAppendBankAccount,
    onRemoveBankAccount,
    onUpdateBankAccount,
    onCreateContact: handleSubmit(onCreateContact),
    onEditContact: handleSubmit(onEditContact),
    onDeleteContact,
    defaultBankAccount: DEFAULT_BANK_ACCOUNT_FIELD
  }
}

export default useContact
