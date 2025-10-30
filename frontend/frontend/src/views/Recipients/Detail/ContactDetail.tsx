import { useGetCountriesQuery } from '@/api-v2/org-settings-api'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { Footer, Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import Loading from '@/components/Loading'
import LeftArrow from '@/public/svg/Dropdown.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import {
  useLazyGetRecipientBankAccountQuery,
  useLazyGetRecipientBankAccountsQuery
} from '@/slice/contact-bank-accounts/contact-bank-accounts-api'

import { IContactBankAccount } from '@/slice/contact-bank-accounts/contact-bank-accounts-types'
import { useDeleteContactMutation, useGetContactByIdQuery } from '@/slice/contacts/contacts-api'
import { contactBankAccountsSelector, setContactBankAccounts } from '@/slice/contacts/contacts-slice'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import DeleteContactModal from '../components/DeleteContactModal'
import BankAccountsDetail from './components/BankAccountsDetail'
import BasicInformationDetail from './components/BasicInformationDetail'
import ContactMethodsDetail from './components/ContactMethodsDetail'
import ContactWalletsDetail from './components/ContactWalletsDetail'

const ContactDetail = () => {
  const router = useRouter()
  const contactId = router?.query?.id
  const organizationId = useOrganizationId()
  const dispatch = useAppDispatch()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const bankAccounts = useAppSelector(contactBankAccountsSelector)

  const listTab = window.sessionStorage.getItem('contact-tab')
  const backURL = `/${organizationId}/contacts${listTab ? `?tab=${listTab}` : ''}`

  const deleteModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const [isLoading, setIsLoading] = useState(false)

  const { data: countries } = useGetCountriesQuery({})
  const { data: contact, isLoading: contactLoading } = useGetContactByIdQuery(
    {
      orgId: organizationId,
      id: contactId
    },
    { skip: !organizationId || !contactId }
  )

  const [getBankAccount] = useLazyGetRecipientBankAccountQuery()
  const [getBankAccounts] = useLazyGetRecipientBankAccountsQuery()
  const [deleteContact, deleteContactResult] = useDeleteContactMutation()

  const getAllContactBankAccounts = useCallback(async () => {
    const list: IContactBankAccount[] = []

    try {
      if (contact?.id) {
        setIsLoading(true)
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
        }

        dispatch(setContactBankAccounts(list))
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }

    setIsLoading(false)
    // setBankAccounts(list)
  }, [contact?.id])

  useEffect(() => {
    if (contact?.id && !bankAccounts?.length) {
      getAllContactBankAccounts()
    }
  }, [contact?.id])

  useEffect(() => {
    if (deleteContactResult.isError) {
      toast.error(deleteContactResult.error.data.message)
    } else if (deleteContactResult.isSuccess) {
      toast.success('Successfully deleted contact')
      router.push(backURL)
    }
  }, [deleteContactResult.isError, deleteContactResult.isSuccess])

  const handleEditContact = () => router.push(`/${organizationId}/contacts/${contactId}/edit`)
  const handleDeleteContact = () => {
    deleteContact({
      orgId: organizationId,
      payload: { id: contact.id }
    })
  }

  return contactLoading ? (
    <div className="h-full">
      <Loading dark title="Fetching Contact" height="h-full" />
    </div>
  ) : (
    <>
      <Header>
        <div className="flex items-center">
          <Button
            variant="ghost"
            height={24}
            classNames="!h-[30px] p-[0.5rem]"
            leadingIcon={<Image src={LeftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
            onClick={() => router.push(backURL)}
          />
          <Breadcrumb>
            <Link href={backURL}>Address Book</Link>
            <Link href={window.location.pathname} legacyBehavior>
              {contact?.organizationName || contact?.contactName}
            </Link>
          </Breadcrumb>
        </div>
      </Header>

      <View.Content>
        <div className="flex flex-col gap-6">
          <BasicInformationDetail contact={contact} />
          <ContactMethodsDetail contactMethods={contact?.recipientContacts || []} />
          <ContactWalletsDetail contactWallets={contact?.recipientAddresses || []} supportedChains={supportedChains} />
          <BankAccountsDetail
            bankAccounts={bankAccounts || []}
            isLoading={isLoading}
            countries={countries?.data || []}
            type={contact?.type}
          />
        </div>
      </View.Content>

      <Footer>
        <div className="flex items-center gap-4 justify-between">
          <Button height={40} variant="black" label="Edit Contact" onClick={handleEditContact} />
          <Button
            variant="ghostRed"
            height={40}
            label="Delete Contact"
            onClick={() => {
              deleteModalProvider.methods.setIsOpen(true)
            }}
          />
        </div>
      </Footer>

      <DeleteContactModal
        name={contact?.organizationName || contact?.contactName}
        provider={deleteModalProvider}
        onDelete={handleDeleteContact}
      />
    </>
  )
}

export default ContactDetail
