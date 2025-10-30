import { useGetFiatCurrenciesQuery } from '@/api-v2/org-settings-api'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { groupedChartOfAccounts } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectedChainSelector } from '@/slice/platform/platform-slice'

import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrencyImage } from './useDraftForm/useDraftForm'
import { fiatCurrenciesSelector, orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { PurposeOfRemittance } from '@/api-v2/payment-api'
import _, { chunk } from 'lodash'
import { useLazyGetRecipientBankAccountQuery } from '@/slice/contact-bank-accounts/contact-bank-accounts-api'

const useCreateDrafts = () => {
  const organizationId = useOrganizationId()

  const wallets = useAppSelector(walletsSelector)
  const chartOfAccounts = useAppSelector(groupedChartOfAccounts)
  const verifiedTokens = useAppSelector(selectVerifiedCryptocurrencies)
  const selectedChain = useAppSelector(selectedChainSelector)
  const orgSettings = useAppSelector(orgSettingsSelector)
  const fiatCurrencies = useAppSelector(fiatCurrenciesSelector)

  const [dataBankAccount, setDataBankAccount] = useState<any>([])
  const [loading, setLoading] = useState(true)

  const init = useRef(false)

  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId }
  )

  const [triggerGetBankAccount] = useLazyGetRecipientBankAccountQuery()

  const bankAccountOptions = useMemo(() => {
    let list = []
    contacts?.items?.forEach((contact) => {
      const bankAccounts =
        contact?.recipientBankAccounts?.map((_bankAccount) => ({
          label: contact.organizationName || contact.contactName,
          value: _bankAccount?.publicId,
          bankName: _bankAccount?.bankName,
          accountNumber: _bankAccount?.accountNumberLast4,
          currencyCode: dataBankAccount.find((item) => item?.id === _bankAccount?.publicId)?.fiatCurrency?.code,
          src: getCurrencyImage(
            dataBankAccount.find((item) => item?.id === _bankAccount?.publicId)?.fiatCurrency?.code ||
              orgSettings?.fiatCurrency?.code
          ),
          metadata: {
            id: _bankAccount.publicId,
            type: 'recipient_bank_account'
          }
        })) || []
      list = [...list, ...bankAccounts]
    })
    return list
  }, [contacts?.items, dataBankAccount])

  const parsedAvailableAccounts = useMemo(
    () => [
      {
        value: null,
        label: 'No Account'
      },
      ...chartOfAccounts
    ],
    [chartOfAccounts]
  )

  const tokenOptions = useMemo(() => {
    const options = []
    if (verifiedTokens?.length > 0) {
      // const updatedVerifiedTokens = verifiedTokens?.filter((token) => token.symbol !== 'USDT')

      for (const token of verifiedTokens) {
        const address = token.addresses?.find((_address) => _address.blockchainId === selectedChain?.id)
        options.push({
          value: token.publicId,
          label: token.symbol,
          src: token.image?.small,
          address
        })
      }
    }
    return options
  }, [verifiedTokens])

  const currenciesOptions = useMemo(
    () =>
      fiatCurrencies?.map((currencyVal) => ({
        value: currencyVal.code,
        label: currencyVal.code,
        src: getCurrencyImage(currencyVal.code)
      })),
    [fiatCurrencies]
  )

  const recipientOptions = useMemo(() => {
    const options = []
    const recipients = contacts?.items || []

    if (recipients?.length > 0) {
      for (const recipient of recipients) {
        const groupedAddress = _.groupBy(
          recipient.recipientAddresses?.map((_item) => ({ ..._item, address: _item.address.toLowerCase() })),
          'address'
        )
        const recipientAddresses = _.map(groupedAddress, (value, key) => ({
          publicId: value[0].publicId,
          address: key,
          supportedBlockchains: _.map(value, 'blockchainId')
        }))

        for (const recipientAddress of recipientAddresses) {
          options.push({
            value: recipientAddress.address.toLowerCase(),
            label: recipient.organizationName || recipient.contactName,
            address: recipientAddress.address.toLowerCase(),
            chainId: selectedChain?.id,
            supportedBlockchains: recipientAddress.supportedBlockchains,
            metadata: {
              id: recipientAddress.publicId,
              type: 'recipient_address' // TODO-DRAFT - Change this to a constant for consistency
            },
            isUnknown: !(recipient.contactName || recipient.organizationName)
          })
        }
      }
    }

    if (wallets?.length > 0) {
      for (const wallet of wallets) {
        options.push({
          value: wallet.address.toLowerCase(),
          label: wallet.name,
          address: wallet.address.toLowerCase(),
          chainId: selectedChain?.id,
          supportedBlockchains: wallet.supportedBlockchains,
          metadata: {
            id: wallet.id,
            type: 'wallet'
          }
        })
      }
    }
    return options
  }, [contacts?.items, wallets, selectedChain])

  const purposeOfTransferOptions = Object.values(PurposeOfRemittance)
    .map((item) => ({
      value: item,
      label: _.startCase(_.toLower(item))
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  useEffect(() => {
    const fetchData = async () => {
      let list = []
      setLoading(true)

      contacts?.items?.forEach((_contact) => {
        if (_contact?.recipientBankAccounts?.length > 0) {
          const bankAccountIds = _contact?.recipientBankAccounts?.map((_bankAccount) => ({
            contactId: _contact?.publicId,
            id: _bankAccount?.publicId
          }))
          list = [...list, ...bankAccountIds]
        }
      })
      const batchCalls = chunk(list, 2)
      const batchData = []
      for (const batchCall of batchCalls) {
        const response = await Promise.all(
          batchCall.map((_item: any) =>
            triggerGetBankAccount({
              orgId: organizationId,
              ..._item
            }).unwrap()
          )
        )
        batchData.push(...response)
      }
      setDataBankAccount(batchData)

      init.current = true
      setLoading(false)
    }
    if (contacts?.items?.length > 0 && !init.current) {
      fetchData()
    }
  }, [contacts?.items])

  return {
    chartOfAccountsOptions: parsedAvailableAccounts,
    tokenOptions,
    currenciesOptions,
    contactOptions: recipientOptions,
    bankAccountOptions,
    purposeOfTransferOptions,
    loadingData: loading
  }
}

export default useCreateDrafts
