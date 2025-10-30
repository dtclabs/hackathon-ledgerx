import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { Footer, Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import { IBankAccountField } from '@/hooks-v2/contact/type'
import useContact from '@/hooks-v2/contact/useContact'
import LeftArrow from '@/public/svg/Dropdown.svg'
import { EContactType } from '@/slice/contacts/contacts.types'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import AddBankAccountModal from '../components/AddBankAccountModal/AddBankAccountModal'
import BankAccounts from '../components/BankAccounts'
import ContactMethods from '../components/ContactMethods'
import ContactTypeSelector from '../components/ContactTypeSelector'
import ContactWallets from '../components/ContactWallets'
import OrganisationBasicInformation from '../components/OrganisationBasicInformation'
import { ChangeAction } from '../../interfaces'

const CreateOrganisationContact = () => {
  const router = useRouter()

  const organizationId = useOrganizationId()
  const showBanner = useAppSelector(showBannerSelector)
  const action = useRef(ChangeAction.ADD)
  const addBankAccountModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const [selectedBankAccount, setSelectedBankAccount] = useState<IBankAccountField & { index: number }>()

  const {
    control,
    errors,
    apiError,
    isLoading,
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
    onCreateContact,
    defaultBankAccount
  } = useContact({ organizationId, type: EContactType.organization })

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

  return (
    <div className="bg-white p-4 rounded-lg">
      <form onSubmit={onCreateContact}>
        <Header>
          <div className="flex items-center">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] p-[0.5rem]"
              leadingIcon={<Image src={LeftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
              onClick={() => router.push(`/${organizationId}/contacts`)}
            />
            <Breadcrumb>
              <Link href={`/${organizationId}/contacts`}>Address Book</Link>
              <Link href={`/${organizationId}/contacts/create/organisation`}>Create Contact</Link>
            </Breadcrumb>
          </div>
        </Header>

        <View.Content className={`${showBanner ? '!h-[calc(100vh-340px)]' : 'h-[calc(100vh-270px)]'} mt-4`}>
          <ContactTypeSelector
            contactType={EContactType.organization}
            onChange={(e) => router.push(`/${organizationId}/contacts/create/individual`)}
          />
          <div className="flex flex-col gap-6 pb-2">
            <OrganisationBasicInformation control={control} errors={errors} />
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
              countryOptions={countryOptions}
              bankAccountFields={bankAccountFields}
              onAppendBankAccount={onAddBankAccount}
              onRemoveBankAccount={onRemoveBankAccount}
              onEditBankAccount={onEditBankAccount}
            />
          </div>
        </View.Content>

        <Footer>
          <div className="flex items-center gap-4">
            <Button
              height={40}
              variant="grey"
              label="Cancel"
              loadingWithLabel={isLoading}
              disabled={isLoading}
              onClick={() => router.push(`/${organizationId}/contacts`)}
            />
            <Button
              variant="black"
              height={40}
              label="Save New Contact"
              type="submit"
              loadingWithLabel={isLoading}
              disabled={isLoading}
            />
          </div>
        </Footer>
      </form>
      <AddBankAccountModal
        type={EContactType.organization}
        bankOptions={bankOptions}
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        provider={addBankAccountModalProvider}
        defaultBankAccount={selectedBankAccount || defaultBankAccount}
        action={action.current}
        onSubmit={onSubmitBankAccount}
      />
    </div>
  )
}

export default CreateOrganisationContact
