import { useLazyGetRecipientBankAccountQuery } from '@/slice/contact-bank-accounts/contact-bank-accounts-api'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { chunk } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getCurrencyImage } from './useFiatPaymentForm/useFiatPaymentForm'
import { contactsSelector } from '@/slice/contacts/contacts-slice'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'

const useBankAccounts = () => {
  const organizationId = useOrganizationId()
  const orgSettings = useAppSelector(orgSettingsSelector)
  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  const [dataBankAccount, setDataBankAccount] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const init = useRef(false)

  const [triggerGetBankAccount] = useLazyGetRecipientBankAccountQuery()

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

  return {
    bankAccountLoading: loading,
    bankAccountOptions
  }
}

export default useBankAccounts
