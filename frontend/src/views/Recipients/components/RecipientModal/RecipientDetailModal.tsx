import deleteIcon from '@/public/svg/TrashRed.svg'
import editIcon from '@/public/svg/Edit.svg'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import React, { useEffect, useId, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { IAddRecipient } from '../AddNewRecipientModal/AddNewRecipientModal'
import EditRecipientModal from './EditRecipientModal'
import ProfileRecipientTab from './ProfileRecipientTab'
import { useRouter } from 'next/router'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { TOKENS_URL } from '@/constants/tokens'
import ReactTooltip from 'react-tooltip'
import { toShort } from '@/utils/toShort'
import Loading from '@/components/Loading'
import { CHAINID } from '@/constants/chains'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useToken } from '@/hooks/useToken'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import leftArrow from '@/public/svg/Dropdown.svg'
import Typography from '@/components-v2/atoms/Typography'
import {
  useGetContactByIdQuery,
  useGetContactProviderQuery,
  useEditContactMutation,
  useDeleteContactMutation
} from '@/slice/contacts/contacts-api'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { addRecipientSchema } from '../AddNewRecipientModal/add-contact-validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { contactProvidersSelector } from '@/slice/contacts/contacts-slice'

const RecipientDetailModal: React.FC = () => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const showBanner = useAppSelector(showBannerSelector)

  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    reset,
    resetField,
    watch
  } = useForm<IAddRecipient>({
    resolver: yupResolver(addRecipientSchema),
    defaultValues: {
      contactName: '',
      providers: [{ content: '', providerId: '4' }],
      wallets: [{ walletAddress: '', blockchainId: 'ethereum', cryptocurrencySymbol: 'ETH' }]
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

  const [currentChainId, setCurrentChainId] = useState(1)
  const [isEdit, setIsEdit] = useState(false)
  const [action, setAction] = useState<string>()
  const [error, setError] = useState<string>()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const idTooltip = useId()
  const router = useRouter()
  const organizationId = useOrganizationId()
  const contactId = router?.query?.id

  const { data: selectedRecipient } = useGetContactByIdQuery(
    {
      orgId: organizationId,
      id: contactId
    },
    { skip: !organizationId }
  )

  const [editContact, editContactResult] = useEditContactMutation()
  const [deleteContact, deleteContactResult] = useDeleteContactMutation()

  const walletList = useAppSelector(walletsSelector)
  const contactProviders = useAppSelector(contactProvidersSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const contactName = useWatch({ control, name: 'contactName' })
  const walletFieldsWatch = useWatch({ control, name: 'wallets' })
  const providerFieldsWatch = useWatch({ control, name: 'providers' })
  const organisationName = useWatch({ control, name: 'organizationName' })
  const organisationAddress = useWatch({ control, name: 'organizationAddress' })

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
    if (deleteContactResult.isSuccess) {
      setShowSuccessModal(true)
    }
  }, [deleteContactResult])

  const handleDeleteRecipient = () => {
    setShowWarning(true)
    setAction('DELETE')
  }

  const handleAccept = async () => {
    if (action === 'DELETE') {
      try {
        await deleteContact({ orgId: organizationId, payload: { id: selectedRecipient.id } })
        setShowWarning(false)
        setShowSuccessModal(true)
      } catch (err) {
        setError(deleteContactResult.error.data.message)
      }
    }
  }

  const handleDecline = () => {
    setShowWarning(false)
  }

  const handleEditRecipient = async (data: IAddRecipient) => {
    setAction('EDIT')
    try {
      await editContact({
        orgId: organizationId,
        id: selectedRecipient.id,
        payload: {
          organizationName: data.organizationName,
          type: selectedRecipient.type,
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
      setShowSuccessModal(true)
      setError('')
    } catch (err: any) {
      setError(err?.data?.message)
      setShowErrorModal(true)
    }
  }

  const handleCloseSuccessModal = () => {
    if (action === 'DELETE') {
      router.back()
      return
    }
    setShowSuccessModal(false)
    setIsEdit(false)
  }

  useEffect(() => {
    if (isEdit && selectedRecipient) {
      reset({
        id: selectedRecipient.id,
        organizationAddress: selectedRecipient.organizationAddress,
        organizationName: selectedRecipient.organizationName,
        contactName: selectedRecipient.contactName,
        providers:
          selectedRecipient.recipientContacts && selectedRecipient.recipientContacts?.length
            ? selectedRecipient.recipientContacts.map((contact) => ({
                content: contact.content,
                providerId: contact.contactProvider.id
              }))
            : [
                {
                  content: '',
                  providerId: '4'
                }
              ],
        wallets: selectedRecipient?.recipientAddresses.map((address) => ({
          blockchainId: address.blockchainId,
          cryptocurrencySymbol: address.token.name.toUpperCase(),
          walletAddress: address.address
        }))
      })
    }
  }, [isEdit, selectedRecipient, reset])

  useEffect(() => {
    const currentChainId_ = window.localStorage.getItem(CHAINID)
    if (currentChainId_) {
      setCurrentChainId(parseInt(currentChainId_))
    } else {
      setCurrentChainId(1)
    }
  }, [])

  return selectedRecipient ? (
    <>
      <Header>
        <Header.Left>
          <div className="flex gap-4 items-center font-semibold text-xl text-[#344054]">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] !p-[0.5rem] w-[40px]"
              leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
              onClick={() => router.back()}
            />
            <Header.Left.Title>
              <ReactTooltip
                id={idTooltip}
                borderColor="#eaeaec"
                border
                place="top"
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg !font-medium"
              >
                {selectedRecipient.organizationName || selectedRecipient.contactName}
              </ReactTooltip>
              {(selectedRecipient.organizationName || selectedRecipient.contactName).length > 20 ? (
                <span data-tip data-for={idTooltip} className=" whitespace-nowrap  text-[#344054]  ">
                  {toShort(selectedRecipient?.organizationName || selectedRecipient?.contactName, 20, 0)}
                </span>
              ) : (
                <span className="whitespace-nowrap">
                  {selectedRecipient.organizationName || selectedRecipient.contactName}
                </span>
              )}
            </Header.Left.Title>
            <div className=" border-r h-4 border-[#EAECF0]" />
            {selectedRecipient.recipientAddresses.length > 1 ? (
              <Typography variant="body2" styleVariant="medium">
                Multiple Addresses
              </Typography>
            ) : (
              <WalletAddress
                split={4}
                address={selectedRecipient.recipientAddresses[0].address}
                color="dark"
                variant="body1"
              >
                <WalletAddress.Link
                  address={selectedRecipient.recipientAddresses[0].address}
                  isMultiple={false}
                  blockExplorer={
                    supportedChains?.find(
                      (_chain) => _chain.id === selectedRecipient.recipientAddresses[0].blockchainId
                    )?.blockExplorer
                  }
                />
                <WalletAddress.Copy address={selectedRecipient.recipientAddresses[0].address} />
              </WalletAddress>
            )}
          </div>
        </Header.Left>
        <Header.Right>
          <div className="flex items-center">
            {isEdit ? (
              <div>
                <button
                  type="button"
                  className="border border-dashboard-border-200 rounded-lg px-3 py-[7px] font-normal text-xs text-dashboard-main mr-2"
                  onClick={() => setIsEdit(false)}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-[#101828] rounded-lg px-3 py-[7px] font-normal text-xs text-white"
                  onClick={handleSubmit(handleEditRecipient)}
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsEdit(true)} disabled={editContactResult?.isLoading}>
                <Image src={editIcon} alt="edit" width={20} height={20} />
              </button>
            )}
            <div className="border-l border-dashboard-border-200 pl-4 ml-4 h-4 " />
            <button type="button" onClick={handleDeleteRecipient} disabled={deleteContactResult?.isLoading}>
              <Image src={deleteIcon} alt="delete" width={20} height={20} />
            </button>
          </div>
        </Header.Right>
      </Header>
      <View.Content>
        <form
          onSubmit={handleSubmit(handleEditRecipient)}
          className={`${showBanner ? 'h-[calc(100vh-346px)]' : 'h-[calc(100vh-278px)]'}`}
        >
          {isEdit ? (
            <EditRecipientModal
              watch={watch}
              organisationAddress={organisationAddress}
              organisationName={organisationName}
              contactName={contactName}
              resetField={resetField}
              chainItems={chainItems}
              tokenItems={tokenItems}
              contactProvidersSelector={contactProviders}
              getSelectToken={getSelectToken}
              getImageToken={getImageToken}
              getSelectChain={getSelectChain}
              getSelectProvider={getSelectProvider}
              providerFieldsWatch={providerFieldsWatch}
              walletFieldsWatch={walletFieldsWatch}
              recipient={selectedRecipient}
              errors={errors}
              control={control}
              walletFields={walletFields}
              providerFields={providerFields}
              register={register}
              walletAppend={walletAppend}
              walletRemove={walletRemove}
              walletReplace={walletReplace}
              providerAppend={providerAppend}
              providerRemove={providerRemove}
              providerReplace={providerReplace}
              currentChainId={currentChainId}
              selectedChain={selectedChain}
            />
          ) : (
            <div>
              <div className="px-6 pt-6 border-t border-dashboard-border">
                <ProfileRecipientTab
                  getImageToken={getImageToken}
                  organizationAddress={selectedRecipient?.organizationAddress}
                  organizationName={selectedRecipient?.organizationName}
                  recipientAddresses={selectedRecipient?.recipientAddresses}
                  recipientContacts={selectedRecipient?.recipientContacts}
                  recipientType={selectedRecipient?.type}
                  contactName={selectedRecipient?.contactName}
                  getSelectChain={getSelectChain}
                  getSelectToken={getSelectToken}
                  supportedChains={supportedChains}
                />
              </div>
            </div>
          )}
          <div className="h-5" />
        </form>
        {showSuccessModal && (
          <NotificationPopUp
            title={
              (action === 'EDIT' && 'Successfully Edited Contact') ||
              (action === 'DELETE' && 'Successfully Deleted Contact') ||
              ''
            }
            type="success"
            setShowModal={setShowSuccessModal}
            showModal={showSuccessModal}
            onClose={handleCloseSuccessModal}
          />
        )}
        {showWarning && (
          <NotificationPopUp
            title="Are you sure?"
            description={action === 'DELETE' && 'If you delete this contact you’ll need to add them again'}
            option
            setShowModal={setShowWarning}
            showModal={showWarning}
            declineText={action === 'DELETE' && 'No, don’t delete'}
            acceptText={action === 'DELETE' && 'Yes, delete'}
            onClose={handleDecline}
            onAccept={handleAccept}
          />
        )}

        {showErrorModal && (
          <NotificationPopUp
            type="error"
            title="Error"
            description={error}
            onClose={() => {
              setShowErrorModal(false)
              setError(undefined)
            }}
            acceptText="Close"
            setShowModal={setShowErrorModal}
            showModal={showErrorModal}
          />
        )}
      </View.Content>
    </>
  ) : (
    <Loading dark />
  )
}

export default RecipientDetailModal
