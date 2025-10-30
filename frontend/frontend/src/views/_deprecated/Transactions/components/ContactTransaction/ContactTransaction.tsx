import {
  useEditContactMutation,
  useGetContactByIdQuery,
  useGetContactsQuery,
  usePostContactMutation
} from '@/slice/contacts/contacts-api'
import Modal from '@/components/Modal'
import { IModal } from '@/components/Modal/interface'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import TabItem from '@/components/TabsComponent/TabItem'
import Tabs, { ITab } from '@/components/TabsComponent/Tabs'
import { TOKENS_URL } from '@/constants/tokens'
import { useToken } from '@/hooks/useToken'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useAppDispatch, useAppSelector } from '@/state'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { EProcessStatus } from '@/views/Organization/interface'
import { IAddRecipient } from '@/views/Recipients/components/AddNewRecipientModal/AddNewRecipientModal'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { MultiValue } from 'react-select'
import { toast } from 'react-toastify'
import ContactItem from './ContactItem'
import Typography from '@/components-v2/atoms/Typography'
// import { getFullRecipients } from '@/state/recipient/action'
import { EContactType } from '@/slice/contacts/contacts.types'
import { contactProvidersSelector } from '@/slice/contacts/contacts-slice'

interface IContactTransactionModal extends IModal {
  active?: string
  contactAddress: string
  onSuccess?: (_contact) => void
}

export enum ETypeRadioContact {}

const ADD_RECIPIENT_TABS: ITab[] = [
  {
    key: 'individual',
    name: 'Add an individual contact'
  },
  {
    key: 'organization',
    name: 'Add an organisation contact'
  }
]

const ContactTransactionModal: React.FC<IContactTransactionModal> = ({
  setShowModal,
  showModal,
  contactAddress,
  onSuccess
}) => {
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const selectedChain = useAppSelector(selectedChainSelector)

  const [valueSelectContact, setValueSelectContact] = useState<IFormatOptionLabel>({
    label: '',
    value: ''
  })
  const [status, setStatus] = useState<EProcessStatus>()
  const [error, setError] = useState<string>()
  const [activeTab, setActiveTab] = useState<string>(EContactType.individual)
  const [radioValue, setRadioValue] = useState('')
  const [showErrorRadio, setShowErrorRadio] = useState(false)

  useEffect(() => {
    setStatus(EProcessStatus.PENDING)
  }, [])

  const submitRef = useRef(null)

  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const { data: contactDetail } = useGetContactByIdQuery(
    {
      orgId: organizationId,
      id: valueSelectContact.value
    },
    { skip: !valueSelectContact.value }
  )

  const [postContact, postContactResult] = usePostContactMutation()
  const [editContact, editContactResult] = useEditContactMutation()

  useEffect(() => {
    if (postContactResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setError(postContactResult.error.data.message)
    }
    if (postContactResult.isSuccess) {
      // dispatch(getFullRecipients({ organizationId }))
      setStatus(EProcessStatus.SUCCESS)
      setError('')
      if (onSuccess) {
        onSuccess(postContactResult.data.data)
      }
    }
  }, [postContactResult.isError, postContactResult.isSuccess])

  useEffect(() => {
    if (editContactResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setError(editContactResult.error.data.message)
    }
    if (editContactResult.isSuccess) {
      // dispatch(getFullRecipients({ organizationId }))
      setStatus(EProcessStatus.SUCCESS)
      if (onSuccess) {
        onSuccess(editContactResult.data.data)
      }
      setError('')
    }
  }, [editContactResult.isError, editContactResult.isSuccess])

  const recipientTypes = useMemo(() => {
    const recipientIndividual = contacts?.items?.filter(
      (itemIndividual) => itemIndividual.type === EContactType.individual
    )
    const recipientOrganisation = contacts?.items?.filter(
      (itemOrganisation) => itemOrganisation.type === EContactType.organization
    )
    return { recipientIndividual, recipientOrganisation }
  }, [contacts?.items])

  const {
    control,
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    resetField
  } = useForm<IAddRecipient>({
    defaultValues: {
      contactName: '',
      providers: [{ content: '', providerId: '4' }],
      wallets: [{ walletAddress: contactAddress, blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }], // Todo: Remove hardcoded ethereum when multichain write is ready
      radioValue: ''
    }
  })

  const {
    fields: providerFields,
    append: providerAppend,
    remove: providerRemove,
    replace: providerReplace
  } = useFieldArray<IAddRecipient>({ control, name: 'providers', keyName: 'id' })

  const {
    fields: walletFields,
    append: walletAppend,
    remove: walletRemove,
    replace: walletReplace
  } = useFieldArray<IAddRecipient>({ control, name: 'wallets', keyName: 'id' })

  useEffect(() => {
    if (valueSelectContact?.value && contactDetail?.id && radioValue === '1') {
      const wallets = contactDetail.recipientAddresses.map((address) => ({
        blockchainId: address.blockchainId,
        cryptocurrencySymbol: address.token.name,
        walletAddress: address.address,
        disabled: true
      }))
      wallets.push({ blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH', walletAddress: contactAddress }) // Todo: Remove hardcoded ethereum when multichain write is ready
      reset({
        id: contactDetail.id,
        organizationAddress: contactDetail.organizationAddress,
        organizationName: contactDetail.organizationName,
        contactName: contactDetail.contactName,
        providers:
          contactDetail.recipientContacts && contactDetail.recipientContacts.length
            ? contactDetail.recipientContacts.map((contact) => ({
                content: contact.content,
                providerId: contact.contactProvider.id,
                disabled: true
              }))
            : [
                {
                  content: '',
                  providerId: '4'
                }
              ],
        wallets,
        disabled: true
      })
    }
    if (radioValue === '2') {
      reset({
        organizationName: '',
        organizationAddress: '',
        contactName: '',
        providers: [{ content: '', providerId: '4' }],
        wallets: [{ walletAddress: contactAddress, blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }] // Todo: Remove hardcoded ethereum when multichain write is ready
      })
    }
  }, [contactDetail, reset, valueSelectContact, radioValue, contactAddress, selectedChain?.id])

  const walletFieldsWatch = useWatch({ control, name: 'wallets' })
  const providerFieldsWatch = useWatch({ control, name: 'providers' })
  const contactProviders = useAppSelector(contactProvidersSelector)
  const walletList = useAppSelector(walletsSelector)

  const { verifiedToken: tokenItems, supportedChain: chainItems } = useToken(
    selectedChain?.id,
    walletList?.map((wallet) => wallet.id)
  )

  const getImageToken = (tokenName: string) => TOKENS_URL.find((token) => token.name === tokenName)
  const getSelectToken = (symbol: string, chainId: string) => {
    if (tokenItems) {
      if (['ethereum', 'goerli'].includes(chainId)) {
        // TODO: Remove filter for multichain write
        return tokenItems[chainId]?.find((token) => token.symbol === symbol)
      }

      /* eslint-disable dot-notation */
      return tokenItems['ethereum']?.find((token) => token.symbol === symbol)
    }

    return []
  }
  const getSelectChain = (chainId: string) =>
    chainItems &&
    chainItems?.find((chain) => {
      if (chainId) {
        return chain.id === chainId
      }
      return chain.id === 'ethereum'
    }) // TODO: Remove filter for multichain write
  const getSelectProvider = (providerId: string) => contactProviders.find((provider) => provider.id === providerId)

  const onSubmit = async (data: IAddRecipient, _e) => {
    _e.preventDefault()
    if (!radioValue || (!valueSelectContact?.value && radioValue === '1')) {
      setShowErrorRadio(true)
      return
    }
    submitRef.current.disabled = true
    if (radioValue === '1') {
      await editContact({
        orgId: organizationId,
        id: data.id,
        payload: {
          organizationName: data.organizationName.trim(),
          type: activeTab as EContactType,
          contactName: data.contactName.trim(),
          contacts: data.providers
            .map((provider) => ({ providerId: provider.providerId, content: provider.content }))
            .filter((item) => item.content !== ''),
          organizationAddress: data.organizationAddress,
          wallets: data.wallets
            .map((wallet) => ({
              blockchainId: String(wallet.blockchainId).toLowerCase(),
              address: wallet.walletAddress,
              cryptocurrencySymbol: String(wallet.cryptocurrencySymbol)
            }))
            .filter((item) => item.address !== '')
        }
      })
      setRadioValue('')
      setValueSelectContact({
        label: '',
        value: ''
      })
      setShowModal(false)
    }
    if (radioValue === '2') {
      await postContact({
        orgId: organizationId,
        payload: {
          organizationName: data.organizationName.trim(),
          type: activeTab as EContactType,
          contactName: data.contactName.trim(),
          contacts: data.providers
            .map((provider) => ({ providerId: provider.providerId, content: provider.content }))
            .filter((item) => item.content !== ''),
          organizationAddress: data.organizationAddress,
          wallets: data.wallets
            .map((wallet) => ({
              blockchainId: String(wallet.blockchainId).toLowerCase(),
              address: wallet.walletAddress,
              cryptocurrencySymbol: String(wallet.cryptocurrencySymbol)
            }))
            .filter((item) => item.address !== '')
        }
      })
      setRadioValue('')
      setValueSelectContact({
        label: '',
        value: ''
      })
      setShowModal(false)
    }
  }

  useEffect(() => {
    if (status === EProcessStatus.SUCCESS) {
      setActiveTab(EContactType.individual)
      toast.success('Contact saved successfully', {
        position: 'top-right',
        pauseOnHover: false,
        theme: 'colored',
        onOpen: () => {
          setStatus(EProcessStatus.PENDING)
        }
      })
    }
    if (status === EProcessStatus.FAILED || status === EProcessStatus.REJECTED) {
      toast.error(error, {
        position: 'top-right',
        pauseOnHover: false,
        theme: 'colored',
        onOpen: () => {
          setStatus(EProcessStatus.PENDING)
        }
      })
    }
  }, [status, error, organizationId])

  useEffect(() => {
    setRadioValue('')
    setValueSelectContact({
      label: '',
      value: ''
    })
    setShowErrorRadio(false)
  }, [activeTab])

  const handleChangeSelectContact = (newValue: IFormatOptionLabel | MultiValue<IFormatOptionLabel>) => {
    setValueSelectContact(newValue as IFormatOptionLabel)
  }
  const handleCancelSaveContact = () => {
    setRadioValue('')
    setValueSelectContact({
      label: '',
      value: ''
    })
    setShowModal(false)
    setShowErrorRadio(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setRadioValue('')
    setValueSelectContact({
      label: '',
      value: ''
    })
    setActiveTab(EContactType.individual)
    setShowErrorRadio(false)
  }

  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-[600px] bg-white rounded-2xl shadow-home-modal font-inter">
        <div className="p-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Typography variant="heading2" color="dark">
                Save as Contact
              </Typography>
              <button type="button" onClick={handleCloseModal}>
                <img src="/svg/BigClose.svg" alt="BigClose" />
              </button>
            </div>
            <p className="font-medium text-dashboard-sub text-sm text-left">
              Save address to an existing contact or create a new contact
            </p>
          </div>
        </div>
        <div className="h-[50vh] scrollbar overflow-auto">
          <Tabs
            setActive={setActiveTab}
            active={activeTab}
            tabs={ADD_RECIPIENT_TABS}
            activeStyle="bg-[#F1F1EF] text-[#2D2D2C] flex justify-center font-semibold"
            unActiveStyle="text-[#777675] font-medium"
            className="px-8 pb-8 border-b border-dashboard-border gap-4 justify-between"
            classNameBtn="font-inter font-medium text-sm px-4 flex justify-center py-2 rounded-lg w-full "
          >
            <TabItem key={EContactType.individual}>
              <div className="p-8">
                {activeTab === EContactType.individual && (
                  <ContactItem
                    recipientList={recipientTypes?.recipientIndividual || []}
                    register={register}
                    control={control}
                    getValues={getValues}
                    requiredField={activeTab === ADD_RECIPIENT_TABS[0].key}
                    watch={watch}
                    errors={errors}
                    chainItems={chainItems}
                    tokenItems={tokenItems}
                    providerFieldsWatch={providerFieldsWatch}
                    walletFields={walletFields}
                    providerFields={providerFields}
                    walletFieldsWatch={walletFieldsWatch}
                    contactProviders={contactProviders}
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
                    onChangeSelectContact={handleChangeSelectContact}
                    radioValue={radioValue}
                    valueSelectContact={valueSelectContact}
                    setRadioValue={setRadioValue}
                    setValueSelectContact={setValueSelectContact}
                    showErrorRadio={showErrorRadio}
                    setShowErrorRadio={setShowErrorRadio}
                    selectedChain={selectedChain}
                  />
                )}
              </div>
            </TabItem>
            <TabItem key={EContactType.organization}>
              <div className="p-8">
                {activeTab === EContactType.organization && (
                  <ContactItem
                    recipientList={recipientTypes?.recipientOrganisation || []}
                    register={register}
                    control={control}
                    getValues={getValues}
                    requiredField={activeTab === ADD_RECIPIENT_TABS[0].key}
                    watch={watch}
                    errors={errors}
                    chainItems={chainItems}
                    tokenItems={tokenItems}
                    providerFieldsWatch={providerFieldsWatch}
                    walletFields={walletFields}
                    providerFields={providerFields}
                    walletFieldsWatch={walletFieldsWatch}
                    contactProviders={contactProviders}
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
                    onChangeSelectContact={handleChangeSelectContact}
                    radioValue={radioValue}
                    valueSelectContact={valueSelectContact}
                    setRadioValue={setRadioValue}
                    setValueSelectContact={setValueSelectContact}
                    activeTab={activeTab}
                    showErrorRadio={showErrorRadio}
                    setShowErrorRadio={setShowErrorRadio}
                    selectedChain={selectedChain}
                  />
                )}
              </div>
            </TabItem>
          </Tabs>
        </div>
        <div className="p-8 gap-4 flex border-t">
          <button
            onClick={handleCancelSaveContact}
            type="button"
            className=" py-4 px-8 font-semibold  rounded-lg text-base hover:bg-gray-300 text-dashboard-main font-inter bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            ref={submitRef}
            disabled={isSubmitting}
            type="submit"
            className=" py-4 cursor-pointer  w-full text-center font-semibold rounded-lg text-base hover:opacity-90 text-white font-inter bg-grey-900 disabled:opacity-80 hover:bg-grey-901"
          >
            Save Contact
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ContactTransactionModal
