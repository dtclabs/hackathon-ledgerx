/* eslint-disable arrow-body-style */
import { FC, useEffect, useState, ChangeEvent, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import Avvvatars from 'avvvatars-react'
import { format } from 'date-fns'
import ReactTooltip from 'react-tooltip'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import Tabs from '@/components-v2/Tab-v2/Tabs'
import TabItem from '@/components/TabsComponent/TabItem'
import { Input } from '@/components-v2/Input'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import ContactsLoading from './components/ContactsLoading'
import { useAppDispatch, useAppSelector } from '@/state'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useDebounce } from '@/hooks/useDebounce'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toShort } from '@/utils/toShort'
import { api } from '@/api-v2'
import { EProcessStatus } from '../Organization/interface'
import AddNewRecipientModal from './components/AddNewRecipientModal/AddNewRecipientModal'
import { IRecipientItem } from './interfaces'
import { logEvent } from '@/utils/logEvent'
import { useDeleteContactMutation, useGetContactsQuery } from '@/slice/contacts/contacts-api'
import listIcon from '@/public/svg/Users.svg'
import { EContactType } from '@/slice/contacts/contacts.types'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { setContactBankAccounts } from '@/slice/contacts/contacts-slice'
import { TabsV3 } from '@/components-v2/Tab-v3'
import RowRecipientsV2 from './components/RowRecipientsV2'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { toast } from 'react-toastify'
import DeleteContactModal from './components/DeleteContactModal'

const columns = [
  {
    Header: 'Name',
    accessor: 'name',
    extendedClass: 'pr-3'
  },
  {
    Header: 'Wallet Address',
    accessor: 'coin_address',
    extendedClass: '!px-3'
  },
  {
    Header: 'Bank Account',
    accessor: 'bank_account',
    extendedClass: '!px-3'
  },
  {
    Header: 'Type',
    accessor: 'type',
    extendedClass: '!px-3'
  },
  {
    Header: 'Last Updated',
    accessor: 'updated',
    extendedClass: '!px-3'
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    extendedClass: '!px-3'
  }
]

const recipientTabs = [
  {
    key: 'all',
    name: 'All',
    active: true
  },
  {
    key: 'individuals',
    name: 'Individual Contacts',
    active: false
  },
  {
    key: 'organizations',
    name: 'Organisation Contacts',
    active: false
  }
]

const Recipients: FC = () => {
  const organizationId = useOrganizationId()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const isBannerShown = useAppSelector(showBannerSelector)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))

  const deleteModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const contactRef = useRef(null)

  const [textSearch, setTextSearch] = useState('')
  const { debouncedValue: search } = useDebounce(textSearch, 500)

  const { data: contacts, isLoading: contactsIsLoading } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999,
        search
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  const [deleteContact, deleteContactResult] = useDeleteContactMutation()

  const [showAddNewRecipientModal, setShowAddNewRecipientModal] = useState(false)
  const [status, setStatus] = useState<EProcessStatus>(EProcessStatus.PENDING)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [action, setAction] = useState<string>()
  const [error, setError] = useState<string>()
  const [name, setName] = useState('')
  const [selectedToken, setSelectedToken] = useState<string>()
  const [activeTab, setActiveTab] = useState<string>(recipientTabs[0].key)

  const handleChangeTab = (tab: string) => {
    setTextSearch('')
    router.push({
      pathname: `/${organizationId}/contacts`,
      query: { tab }
    })
  }

  const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    setTextSearch(e.target.value)
  }

  const handleShowDetailModal = (recipient: IRecipientItem) => {
    if (recipient.id) {
      dispatch(setContactBankAccounts([]))
      router.push(`/${organizationId}/contacts/${recipient.id}`)
    }
  }

  useEffect(() => {
    const activeTabParams = router?.query?.tab
    switch (activeTabParams) {
      case 'individuals':
        setActiveTab('individuals')
        window.sessionStorage.setItem('contact-tab', 'individuals')
        break
      case 'organizations':
        setActiveTab('organizations')
        window.sessionStorage.setItem('contact-tab', 'organizations')
        break
      default:
        setActiveTab('all')
        window.sessionStorage.setItem('contact-tab', 'all')
    }
  }, [activeTab, router])

  useEffect(() => {
    if (showAddNewRecipientModal) {
      setAction('ADD')
    }
  }, [showAddNewRecipientModal])

  useEffect(() => {
    switch (status) {
      case EProcessStatus.SUCCESS:
        if (action === 'ADD' && textSearch !== '') setTextSearch('')
        setShowSuccessModal(true)
        setShowAddNewRecipientModal(false)
        if (action === 'ADD') {
          logEvent({
            event: 'add_recipient',
            payload: {
              event_category: 'Full app',
              event_label: selectedToken,
              value: 1
            }
          })
        }
        dispatch(api.util.invalidateTags(['contacts']))
        break
      case EProcessStatus.FAILED:
        setShowAddNewRecipientModal(true)
        break
      default:
        setShowSuccessModal(false)
        break
    }
  }, [status])

  useEffect(() => {
    if (deleteContactResult.isError) {
      toast.error(deleteContactResult.error.data.message)
    } else if (deleteContactResult.isSuccess) {
      toast.success('Successfully deleted contact')
    }
    deleteModalProvider.methods.setIsOpen(false)
  }, [deleteContactResult.isError, deleteContactResult.isSuccess])

  const handleConfirmDeleteContact = (recipient: IRecipientItem) => {
    contactRef.current = { ...recipient }
    deleteModalProvider.methods.setIsOpen(true)
  }

  const handleDeleteContact = () => {
    deleteContact({
      orgId: organizationId,
      payload: { id: contactRef.current.id }
    })
  }

  const handleEditContact = (recipient: IRecipientItem) => {
    router.push(`/${organizationId}/contacts/${recipient.id}/edit`)
  }

  const handleAddContact = () => {
    if (isOffRampEnabled) {
      router.push(`/${organizationId}/contacts/create/${activeTab === 'organizations' ? 'organisation' : 'individual'}`)
    } else setShowAddNewRecipientModal(true)
  }

  const tabs = useMemo(() => {
    if (isOffRampEnabled) {
      return recipientTabs.map((tab) => {
        if (tab.key === 'individuals')
          return {
            ...tab,
            name: `${tab.name} (${
              contacts ? contacts?.items?.filter((item) => item.type === EContactType.individual)?.length : 0
            })`
          }
        if (tab.key === 'organizations')
          return {
            ...tab,
            name: `${tab.name} (${
              contacts ? contacts?.items?.filter((item) => item.type === EContactType.organization)?.length : 0
            })`
          }
        return { ...tab, name: `${tab.name} (${contacts ? contacts?.items?.length : 0})` }
      })
    }
    return recipientTabs
  }, [contacts])

  return (
    <div className="bg-white p-4 rounded-lg">
      <Header>
        <Header.Left>
          <Header.Left.Title>Address Book</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          <Header.Right.PrimaryCTA label="Create Contact" onClick={handleAddContact} />
        </Header.Right>
      </Header>
      <View.Content>
        <TabsV3
          setActive={handleChangeTab}
          active={activeTab}
          tabs={tabs}
          hasSearch
          onChangeSearch={handleChangeText}
          search={textSearch}
          className="mt-4"
        >
          <TabItem key={recipientTabs[0].key}>
            {contactsIsLoading ? (
              <ContactsLoading />
            ) : (
              <SimpleTable
                tableHeight={isBannerShown ? 'h-[calc(100vh-358px)]' : 'h-[calc(100vh-286px)]'}
                noData={
                  <EmptyData>
                    <EmptyData.Icon icon={listIcon} />
                    {contacts?.totalItems === 0 && search ? (
                      <>
                        <EmptyData.Title>No Contacts Found</EmptyData.Title>
                        <EmptyData.Subtitle>Try searching again with another keyword</EmptyData.Subtitle>
                      </>
                    ) : (
                      <>
                        <EmptyData.Title>Don’t see any contacts yet?</EmptyData.Title>
                        <EmptyData.Subtitle>Add new whitelisted addresses to get started</EmptyData.Subtitle>
                      </>
                    )}

                    <EmptyData.CTA onClick={handleAddContact} label="Create a Contact" />
                  </EmptyData>
                }
                onClickRow={(row) => handleShowDetailModal(row.original)}
                renderRow={(row) =>
                  isOffRampEnabled ? (
                    <RowRecipientsV2
                      row={row}
                      supportedChains={supportedChains}
                      onConfirmDeleteContact={handleConfirmDeleteContact}
                      onEdit={handleEditContact}
                      isDisabled={deleteContactResult.isLoading}
                    />
                  ) : (
                    <>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex  gap-3  items-center truncate">
                          <div>
                            <Avvvatars style="shape" size={32} value={row?.original?.contactName} />
                          </div>
                          {row?.original?.contactName.trim().length > 25 ? (
                            <div className="truncate pr-5 flex-1">
                              <ReactTooltip
                                id={row?.original?.id}
                                place="top"
                                borderColor="#eaeaec"
                                border
                                backgroundColor="white"
                                textColor="#111111"
                                effect="solid"
                                className="!opacity-100 !rounded-lg !text-xs"
                              >
                                {row?.original?.contactName}
                              </ReactTooltip>
                              <span data-tip data-for={row?.original?.id}>
                                {toShort(row?.original?.contactName, 25, 0)}
                              </span>
                            </div>
                          ) : (
                            <div className="truncate pr-5 flex-1">{row?.original?.contactName}</div>
                          )}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex-1 pr-5">
                          {row?.original?.recipientAddresses?.length > 1 ? (
                            'Multiple Addresses'
                          ) : (
                            <WalletAddress
                              split={5}
                              address={row?.original?.recipientAddresses[0]?.address}
                              color="dark"
                            >
                              <WalletAddress.Link
                                address={row?.original?.recipientAddresses[0]?.address}
                                options={supportedChains}
                              />
                              <WalletAddress.Copy address={row?.original?.recipientAddresses[0]?.address} />
                            </WalletAddress>
                          )}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div>
                          {row?.original?.updatedAt
                            ? format(new Date(row?.original?.updatedAt), 'dd MMM yyyy, hh:mm a')
                            : ''}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="whitespace-nowrap text-xs border border-[#CECECC] rounded-lg px-3 py-[7px]"
                            onClick={() => {
                              handleShowDetailModal(row.original)
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </BaseTable.Body.Row.Cell>
                    </>
                  )
                }
                columns={
                  !isOffRampEnabled
                    ? columns.filter((item) => !['bank_account', 'type'].includes(item.accessor))
                    : columns.filter((item) => !['actions'].includes(item.accessor))
                }
                pagination={contacts?.totalItems > 0}
                data={contacts?.items ?? []}
                defaultPageSize={10}
                isLoading={contactsIsLoading}
              />
            )}
          </TabItem>

          <TabItem key={recipientTabs[1].key}>
            {contactsIsLoading ? (
              <ContactsLoading />
            ) : (
              <SimpleTable
                tableHeight={isBannerShown ? 'h-[calc(100vh-358px)]' : 'h-[calc(100vh-286px)]'}
                noData={
                  <EmptyData>
                    <EmptyData.Icon icon={listIcon} />
                    {contacts?.totalItems === 0 && search ? (
                      <>
                        <EmptyData.Title>No Contacts Found</EmptyData.Title>
                        <EmptyData.Subtitle>Try searching again with another keyword</EmptyData.Subtitle>
                      </>
                    ) : (
                      <>
                        <EmptyData.Title>Don’t see any contacts yet?</EmptyData.Title>
                        <EmptyData.Subtitle>Add new whitelisted addresses to get started</EmptyData.Subtitle>
                      </>
                    )}

                    <EmptyData.CTA onClick={handleAddContact} label="Create a Contact" />
                  </EmptyData>
                }
                onClickRow={(row) => handleShowDetailModal(row.original)}
                renderRow={(row) =>
                  isOffRampEnabled ? (
                    <RowRecipientsV2
                      row={row}
                      supportedChains={supportedChains}
                      onConfirmDeleteContact={handleConfirmDeleteContact}
                      onEdit={handleEditContact}
                      isDisabled={deleteContactResult.isLoading}
                    />
                  ) : (
                    <>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex  gap-3  items-center truncate">
                          <div>
                            <Avvvatars style="shape" size={32} value={row?.original?.contactName} />
                          </div>
                          {row?.original?.contactName.trim().length > 25 ? (
                            <div className="truncate pr-5 flex-1">
                              <ReactTooltip
                                id={row?.original?.id}
                                place="top"
                                borderColor="#eaeaec"
                                border
                                backgroundColor="white"
                                textColor="#111111"
                                effect="solid"
                                className="!opacity-100 !rounded-lg !text-xs"
                              >
                                {row?.original?.contactName}
                              </ReactTooltip>
                              <span data-tip data-for={row?.original?.id}>
                                {toShort(row?.original?.contactName, 25, 0)}
                              </span>
                            </div>
                          ) : (
                            <div className="truncate pr-5 flex-1">{row?.original?.contactName}</div>
                          )}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex-1 pr-5">
                          {row?.original?.recipientAddresses?.length > 1 ? (
                            'Multiple Addresses'
                          ) : (
                            <WalletAddress
                              split={5}
                              address={row?.original?.recipientAddresses[0]?.address}
                              color="dark"
                            >
                              <WalletAddress.Link
                                address={row?.original?.recipientAddresses[0]?.address}
                                options={supportedChains}
                              />
                              <WalletAddress.Copy address={row?.original?.recipientAddresses[0]?.address} />
                            </WalletAddress>
                          )}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div>
                          {row?.original?.updatedAt
                            ? format(new Date(row?.original?.updatedAt), 'dd MMM yyyy, hh:mm a')
                            : ''}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="whitespace-nowrap text-xs border border-[#CECECC] rounded-lg px-3 py-[7px]"
                            onClick={() => {
                              handleShowDetailModal(row.original)
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </BaseTable.Body.Row.Cell>
                    </>
                  )
                }
                columns={
                  !isOffRampEnabled
                    ? columns.filter((item) => !['bank_account', 'type'].includes(item.accessor))
                    : columns.filter((item) => !['actions'].includes(item.accessor))
                }
                pagination={contacts?.totalItems > 0}
                data={contacts?.items?.filter((item) => item.type === EContactType.individual) ?? []}
                defaultPageSize={10}
                isLoading={contactsIsLoading}
              />
            )}
          </TabItem>

          <TabItem key={recipientTabs[2].key}>
            {contactsIsLoading ? (
              <ContactsLoading />
            ) : (
              <SimpleTable
                tableHeight={isBannerShown ? 'h-[calc(100vh-358px)]' : 'h-[calc(100vh-286px)]'}
                onClickRow={(row) => handleShowDetailModal(row.original)}
                noData={
                  <EmptyData>
                    <EmptyData.Icon icon={listIcon} />
                    {contacts?.totalItems === 0 && search ? (
                      <>
                        <EmptyData.Title>No Contacts Found</EmptyData.Title>
                        <EmptyData.Subtitle>Try searching again with another keyword</EmptyData.Subtitle>
                      </>
                    ) : (
                      <>
                        <EmptyData.Title>Don’t see any contacts yet?</EmptyData.Title>
                        <EmptyData.Subtitle>Add new whitelisted addresses to get started</EmptyData.Subtitle>
                      </>
                    )}

                    <EmptyData.CTA onClick={handleAddContact} label="Create a Contact" />
                  </EmptyData>
                }
                renderRow={(row) =>
                  isOffRampEnabled ? (
                    <RowRecipientsV2
                      row={row}
                      supportedChains={supportedChains}
                      onConfirmDeleteContact={handleConfirmDeleteContact}
                      onEdit={handleEditContact}
                      isDisabled={deleteContactResult.isLoading}
                    />
                  ) : (
                    <>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex  gap-3  items-center truncate">
                          <div>
                            <Avvvatars style="shape" size={32} value={row?.original?.contactName} />
                          </div>
                          {row?.original?.contactName.trim().length > 25 ? (
                            <div className="truncate pr-5 flex-1">
                              <ReactTooltip
                                id={row?.original?.id}
                                place="top"
                                borderColor="#eaeaec"
                                border
                                backgroundColor="white"
                                textColor="#111111"
                                effect="solid"
                                className="!opacity-100 !rounded-lg !text-xs"
                              >
                                {row?.original?.contactName}
                              </ReactTooltip>
                              <span data-tip data-for={row?.original?.id}>
                                {toShort(row?.original?.contactName, 25, 0)}
                              </span>
                            </div>
                          ) : (
                            <div className="truncate pr-5 flex-1">{row?.original?.contactName}</div>
                          )}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex-1 pr-5">
                          {row?.original?.recipientAddresses?.length > 1 ? (
                            'Multiple Addresses'
                          ) : (
                            <WalletAddress
                              split={5}
                              address={row?.original?.recipientAddresses[0]?.address}
                              color="dark"
                            >
                              <WalletAddress.Link
                                address={row?.original?.recipientAddresses[0]?.address}
                                options={supportedChains}
                              />
                              <WalletAddress.Copy address={row?.original?.recipientAddresses[0]?.address} />
                            </WalletAddress>
                          )}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div>
                          {row?.original?.updatedAt
                            ? format(new Date(row?.original?.updatedAt), 'dd MMM yyyy, hh:mm a')
                            : ''}
                        </div>
                      </BaseTable.Body.Row.Cell>
                      <BaseTable.Body.Row.Cell>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="whitespace-nowrap text-xs border border-[#CECECC] rounded-lg px-3 py-[7px]"
                            onClick={() => {
                              handleShowDetailModal(row.original)
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </BaseTable.Body.Row.Cell>
                    </>
                  )
                }
                columns={
                  !isOffRampEnabled
                    ? columns.filter((item) => !['bank_account', 'type'].includes(item.accessor))
                    : columns.filter((item) => !['actions'].includes(item.accessor))
                }
                pagination={contacts?.totalItems > 0}
                data={contacts?.items?.filter((item) => item.type === EContactType.organization) ?? []}
                defaultPageSize={10}
                isLoading={contactsIsLoading}
              />
            )}
          </TabItem>
        </TabsV3>
        <AddNewRecipientModal
          active={activeTab}
          setName={setName}
          setError={setError}
          setStatus={setStatus}
          showModal={showAddNewRecipientModal}
          setSelectedToken={setSelectedToken}
          setShowModal={setShowAddNewRecipientModal}
          selectedChain={selectedChain}
        />
        {/* Result PopUp */}
        {showSuccessModal && (
          <NotificationPopUp
            // close
            title={(action === 'ADD' && 'New contact successfully added!') || ''}
            firstText="You have successfully added"
            lastText="to your contact list."
            boldText={` ${name.length > 20 ? toShort(name, 20, 0) : name} `}
            type="success"
            setShowModal={setShowSuccessModal}
            option
            showModal={showSuccessModal}
            declineText={action === 'ADD' && 'Skip'}
            acceptText={action === 'ADD' && 'Add Another Contact'}
            onClose={() => {
              setStatus(EProcessStatus.PENDING)
            }}
            onAccept={() => {
              setStatus(EProcessStatus.PENDING)
              setShowAddNewRecipientModal(true)
            }}
          />
        )}
        <DeleteContactModal
          name={contactRef.current?.organizationName || contactRef.current?.contactName}
          provider={deleteModalProvider}
          onDelete={handleDeleteContact}
        />
      </View.Content>
    </div>
  )
}

export default Recipients
