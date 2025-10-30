import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Modal from '@/components/Modal'
import { IModal } from '@/components/Modal/interface'
import TabItem from '@/components/TabsComponent/TabItem'
import Tabs, { ITab } from '@/components/TabsComponent/Tabs'
import TextField from '@/components/TextField/TextField'
import { TOKENS_URL } from '@/constants/tokens'
import { useToken } from '@/hooks/useToken'
import BigClose from '@/public/svg/BigClose.svg'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { EProcessStatus } from '@/views/Organization/interface'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/legacy/image'
import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { recipientTabs } from '../../data'
import ContactPerson from './ContactPerson'
import { addRecipientSchema } from './add-contact-validation'
import { EContactType } from '@/slice/contacts/contacts.types'
import { contactProvidersSelector } from '@/slice/contacts/contacts-slice'
import { usePostContactMutation } from '@/slice/contacts/contacts-api'

interface IAddNewRecipientModal extends IModal {
  setStatus: (status: EProcessStatus) => void
  setError: (error: string) => void
  setName?: (name: string) => void
  active?: string
  setSelectedToken?: React.Dispatch<React.SetStateAction<string>>
  selectedChain: any
  onSuccessfulSubmit?: () => void
  onFailedSubmit?: () => void
}

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

export interface IAddRecipient {
  id?: string
  contactName: string
  organizationName?: string
  organizationAddress?: string
  wallets?: { blockchainId?: string; cryptocurrencySymbol?: string; walletAddress?: string; disabled?: boolean }[]
  providers?: { providerId?: string; content?: string; disabled?: boolean }[]
  radioValue?: string
  disabled?: boolean
}

const AddNewRecipientModal: React.FC<IAddNewRecipientModal> = ({
  setName,
  setShowModal,
  showModal,
  setError,
  setStatus,
  active = recipientTabs[0].key,
  setSelectedToken,
  selectedChain,
  onSuccessfulSubmit,
  onFailedSubmit
}) => {
  const organizationId = useOrganizationId()
  const contactProviders = useAppSelector(contactProvidersSelector)
  const walletList = useAppSelector(walletsSelector)

  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [activeTab, setActiveTab] = useState<string>(ADD_RECIPIENT_TABS[0].key)

  const [postContact, postContactResult] = usePostContactMutation()

  const {
    control,
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
    watch
  } = useForm<IAddRecipient>({
    resolver: yupResolver(addRecipientSchema),
    defaultValues: {
      contactName: '',
      providers: [{ content: '', providerId: '4' }],
      wallets: [{ walletAddress: '', blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }] // Todo: Remove hardcoded ethereum when multichain write is ready
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

  const walletFieldsWatch = useWatch({ control, name: 'wallets' })
  const providerFieldsWatch = useWatch({ control, name: 'providers' })

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

  useEffect(() => {
    if (activeTab) {
      reset({
        organizationName: '',
        organizationAddress: '',
        contactName: '',
        providers: [{ content: '', providerId: '4' }],
        wallets: [{ walletAddress: '', blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }] // Todo: Remove hardcoded ethereum when multichain write is ready
      })
    }
  }, [activeTab, reset])
  // reset error message to null  if altered
  useEffect(() => {
    setApiError('')
  }, [walletFieldsWatch])

  useEffect(() => {
    if (postContactResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setApiError(postContactResult.error.data.message)
      if (onFailedSubmit) {
        onFailedSubmit()
      }
    }
    if (postContactResult.isSuccess) {
      setStatus(EProcessStatus.SUCCESS)
      setError('')
      if (onSuccessfulSubmit) {
        onSuccessfulSubmit()
      }
    }
  }, [postContactResult.isError, postContactResult.isSuccess])

  const onSubmit = (data: IAddRecipient) => {
    if (!isSubmitting) {
      setIsLoading(true)
      postContact({
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
              blockchainId: wallet.blockchainId,
              address: wallet.walletAddress,
              cryptocurrencySymbol: String(wallet.cryptocurrencySymbol)
            }))
            .filter((item) => item.address !== '')
        }
      })

      // submitRef.current.disabled = false
      setIsLoading(false)
      if (setSelectedToken) {
        setSelectedToken(
          tokenItems &&
            tokenItems[selectedChain?.id]?.find((item) => item?.symbol === data?.wallets[0]?.cryptocurrencySymbol) &&
            tokenItems[selectedChain?.id]?.find((item) => item?.symbol === data?.wallets[0]?.cryptocurrencySymbol)?.name
        )
      }
      if (setName) {
        setName(data?.organizationName || data?.contactName)
      }
    }
  }

  useEffect(() => {
    if (showModal) {
      if (active === recipientTabs[2].key) {
        setActiveTab(ADD_RECIPIENT_TABS[1].key)
      }
      if (active === recipientTabs[1].key || active === recipientTabs[0].key) {
        setActiveTab(ADD_RECIPIENT_TABS[0].key)
      }

      reset({
        organizationName: '',
        organizationAddress: '',
        contactName: '',
        providers: [{ content: '', providerId: '4' }],
        wallets: [{ walletAddress: '', blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }] // Todo: Remove hardcoded ethereum when multichain write is ready
      })
    }
  }, [active, reset, showModal])

  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-[600px] bg-white rounded-2xl shadow-home-modal font-inter">
        <div className="p-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Typography variant="heading2">Add new contact</Typography>
              <Image
                className="cursor-pointer"
                onClick={() => setShowModal(false)}
                src={BigClose}
                height={40}
                width={40}
              />
            </div>
            <Typography variant="body2" color="dark">
              This adds a new contact profile to your address book.
            </Typography>
          </div>
        </div>
        <div className="h-[54vh] scrollbar overflow-auto">
          <Tabs
            setActive={setActiveTab}
            active={activeTab}
            tabs={ADD_RECIPIENT_TABS}
            activeStyle="bg-[#F1F1EF] text-[#2D2D2C] flex justify-center font-semibold"
            unActiveStyle="text-[#777675] font-medium"
            className="px-8 pb-8 border-b border-dashboard-border gap-4 justify-between"
            classNameBtn="font-inter font-medium text-sm px-4 flex justify-center py-2 rounded-lg w-full "
          >
            <TabItem key={ADD_RECIPIENT_TABS[0].key}>
              <Typography variant="body1" classNames="tracking-wide mb-4 px-8 pt-8" styleVariant="medium">
                Contact information
              </Typography>
            </TabItem>
            <TabItem key={ADD_RECIPIENT_TABS[1].key}>
              <Typography variant="body1" classNames="tracking-wide mb-4 px-8 pt-8" styleVariant="medium">
                Organisation information
              </Typography>
              <div className="px-8">
                {activeTab === ADD_RECIPIENT_TABS[1].key && (
                  <>
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
                          value: activeTab === ADD_RECIPIENT_TABS[1].key,
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
                          value: activeTab === ADD_RECIPIENT_TABS[1].key,
                          message: 'This field is required.'
                        },
                        maxLength: {
                          value: 70,
                          message: 'Organisation Mailing Address allows maximum of 70 characters.'
                        },
                        validate: (value: string) => value.trim().length !== 0 || 'This field is required.'
                      }}
                    />
                  </>
                )}
                <Typography variant="body1" classNames="tracking-wide mb-4 mt-8" styleVariant="medium">
                  Organisation’s Contact Person
                </Typography>
              </div>
            </TabItem>
          </Tabs>
          <ContactPerson
            requiredField={activeTab === ADD_RECIPIENT_TABS[0].key}
            watch={watch}
            errors={errors}
            apiError={apiError}
            control={control}
            chainItems={chainItems} // Hard-coded for multichain read experience
            tokenItems={tokenItems}
            providerFieldsWatch={providerFieldsWatch}
            walletFields={walletFields}
            providerFields={providerFields}
            walletFieldsWatch={walletFieldsWatch}
            contactProviders={contactProviders}
            register={register}
            currentChainId={parseInt(selectedChain?.chainId)}
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
            selectedChain={selectedChain}
          />
        </div>
        <div className="p-8 gap-4 flex border-t">
          <Button
            onClick={() => setShowModal(false)}
            variant="grey"
            type="button"
            height={48}
            label="Cancel"
            // className=" py-4 px-8 font-semibold  rounded-lg text-base hover:bg-gray-300 text-dashboard-main font-inter bg-[#F2F4F7]"
          >
            Cancel
          </Button>
          <Button
            // ref={submitRef}
            disabled={isLoading}
            loading={isLoading}
            variant="black"
            type="submit"
            height={48}
            width="w-full"
            label="Add New Contact"
            // className=" py-4 cursor-pointer  w-full text-center font-semibold rounded-lg text-base hover:opacity-90 text-white font-inter bg-grey-900 disabled:cursor-not-allowed disabled:opacity-80 hover:bg-grey-901"
          >
            Add New Contact
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddNewRecipientModal
