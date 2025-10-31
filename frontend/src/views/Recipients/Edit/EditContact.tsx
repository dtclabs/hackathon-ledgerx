import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { Footer, Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import Loading from '@/components/Loading'
import { IBankAccountField } from '@/hooks-v2/contact/type'
import useContact from '@/hooks-v2/contact/useContact'
import LeftArrow from '@/public/svg/Dropdown.svg'
import { useGetContactByIdQuery } from '@/slice/contacts/contacts-api'
import { contactBankAccountsSelector } from '@/slice/contacts/contacts-slice'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import AddBankAccountModal from '../Create/components/AddBankAccountModal/AddBankAccountModal'
import BankAccounts from '../Create/components/BankAccounts'
import ContactMethods from '../Create/components/ContactMethods'
import ContactWallets from '../Create/components/ContactWallets'
import IndividualBasicInformation from '../Create/components/IndividualBasicInformation'
import OrganisationBasicInformation from '../Create/components/OrganisationBasicInformation'
import DeleteContactModal from '../components/DeleteContactModal'
import { ChangeAction } from '../interfaces'

const EditContact = () => {
  const router = useRouter()
  const contactId = router?.query?.id
  const organizationId = useOrganizationId()
  const showBanner = useAppSelector(showBannerSelector)
  const bankAccounts = useAppSelector(contactBankAccountsSelector)
  const deleteModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const addBankAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const action = useRef(ChangeAction.ADD)

  const listTab = window.sessionStorage.getItem('contact-tab')
  const backURL = `/${organizationId}/contacts${listTab ? `?tab=${listTab}` : ''}`

  const { data: contact, isLoading: isFetching } = useGetContactByIdQuery(
    {
      orgId: organizationId,
      id: contactId
    },
    { skip: !organizationId || !contactId }
  )

  const [selectedBankAccount, setSelectedBankAccount] = useState<IBankAccountField & { index: number }>()

  const {
    control,
    errors,
    apiError,
    isLoading,
    isBankAccountsLoading,
    providerFields,
    walletFields,
    bankAccountFields,
    bankOptions,
    countryOptions,
    currencyOptions,
    onRemoveWallet,
    onAppendWallet,
    onUpdateWallet,
    onRemoveProvider,
    onAppendProvider,
    onUpdateProvider,
    onAppendBankAccount,
    onRemoveBankAccount,
    onUpdateBankAccount,
    onEditContact,
    onDeleteContact,
    defaultBankAccount
  } = useContact({ organizationId, type: contact?.type, contact, bankAccounts })

  const onAddBankAccount = () => {
    action.current = ChangeAction.ADD
    addBankAccountModalProvider.methods.setIsOpen(true)
  }
  const onEditBankAccount = (index) => {
    action.current = ChangeAction.EDIT
    setSelectedBankAccount({ ...bankAccountFields?.[index], index })
    addBankAccountModalProvider.methods.setIsOpen(true)
  }
  const onSubmitBankAccount = (data) => {
    if (selectedBankAccount?.index >= 0) onUpdateBankAccount(selectedBankAccount.index, data)
    else onAppendBankAccount(data)
  }
  useEffect(() => {
    if (!addBankAccountModalProvider?.state?.isOpen) {
      setSelectedBankAccount(null)
    }
  }, [addBankAccountModalProvider?.state?.isOpen])

  return isFetching ? (
    <div className="h-full">
      <Loading dark title="Fetching Contact" height="h-full" />
    </div>
  ) : (
    <>
      <form onSubmit={onEditContact}>
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

        <View.Content className={`${showBanner ? '!h-[calc(100vh-340px)]' : 'h-[calc(100vh-270px)]'}`}>
          <div className="flex flex-col gap-6 pb-2">
            {contact?.organizationName ? (
              <OrganisationBasicInformation control={control} errors={errors} />
            ) : (
              <IndividualBasicInformation control={control} errors={errors} />
            )}
            <ContactMethods
              control={control}
              errors={errors}
              providerFields={providerFields}
              onAppendProvider={onAppendProvider}
              onRemoveProvider={onRemoveProvider}
              onUpdateProvider={onUpdateProvider}
            />
            <ContactWallets
              control={control}
              errors={errors}
              apiError={apiError}
              walletFields={walletFields}
              onAppendWallet={onAppendWallet}
              onRemoveWallet={onRemoveWallet}
              onUpdateWallet={onUpdateWallet}
            />
            <BankAccounts
              isBankAccountsLoading={isBankAccountsLoading}
              countryOptions={countryOptions}
              bankAccountFields={bankAccountFields}
              onAppendBankAccount={onAddBankAccount}
              onRemoveBankAccount={onRemoveBankAccount}
              onEditBankAccount={onEditBankAccount}
            />
          </div>
        </View.Content>

        <Footer>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                height={40}
                variant="grey"
                label="Discard Changes"
                loadingWithLabel={isLoading}
                disabled={isLoading}
                onClick={() => router.push(`/${organizationId}/contacts/${contact.id}`)}
              />
              <Button
                variant="black"
                height={40}
                label="Save Changes"
                type="submit"
                loadingWithLabel={isLoading}
                disabled={isLoading}
              />
            </div>
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
      </form>
      <DeleteContactModal
        name={contact?.organizationName || contact?.contactName}
        provider={deleteModalProvider}
        onDelete={onDeleteContact}
      />
      <AddBankAccountModal
        type={contact?.type}
        bankOptions={bankOptions}
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        provider={addBankAccountModalProvider}
        defaultBankAccount={selectedBankAccount || defaultBankAccount}
        action={action.current}
        onSubmit={onSubmitBankAccount}
      />
    </>
  )
}

export default EditContact
