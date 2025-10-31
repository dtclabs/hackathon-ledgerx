import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import TextField from '@/components/TextField/TextField'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetWalletByIdQuery, useUpdateWalletWithoutInvalidationMutation } from '@/slice/wallets/wallet-api'
import { useAppSelector } from '@/state'
import { log } from '@/utils-v2/logger'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'
import { AuthenticatedView as View, Header, Footer } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import DropDown from '@/components-v2/atoms/Dropdown/index'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Link from 'next/link'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import { toast } from 'react-toastify'
import Typography from '@/components-v2/atoms/Typography'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import CheckboxCustom from '@/components-v2/atoms/CheckBoxCustom'
import ToggleSwitch from '@/components-v2/atoms/ToggleSwitch'
import Loading from '@/components/Loading'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { difference } from 'lodash'
import cautionSvg from '@/public/svg/Caution.svg'
import { usePermissions } from '@/hooks-v2/usePermissions'
import ReactTooltip from 'react-tooltip'
import warning from '@/public/svg/warning.svg'
import CustomDropdownMenu from '../../components/CustomDropdownMenu'
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal'
import { CHAIN_SHORT_NAMES } from '@/config-v2/constants'

interface IEditWalletForm {
  name: string
  address: string
  walletGroup?: any
  isFlagged: boolean
  supportedBlockchains: string[]
}

const EditEOAWallet: React.FC = () => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const {
    data: walletDetails,
    isSuccess: isGetWalletDetailsSuccess,
    isFetching: isGetWalletDetailsFetching,
    isError: isGetWalletDetailsError,
    error: getWalletDetailsError,
    isLoading
  } = useGetWalletByIdQuery(
    {
      orgId: organizationId,
      walletId: router.query.walletId
    },
    { skip: !router.query.walletId }
  )

  const {
    data: groups,
    isError: isGetWalletGroupsError,
    error: getWalletGroupsError,
    isSuccess: isGetWalletGroupsSuccess
  } = useGetWalletGroupsQuery({
    orgId: organizationId
  })

  const [responseError, setResponseError] = useState<string>()
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false)
  const [isWalletFlagged, setIsWalletFlagged] = useState<boolean>(false)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedChainsForWallet, setSelectedChainsForWallet] = useState<string[]>([])
  const [editWallet, editWalletResult] = useUpdateWalletWithoutInvalidationMutation()
  const [unselectedChains, setUnselectedChains] = useState<string[]>()
  const { hasPermission } = usePermissions()
  const isAuthorized = hasPermission('wallets.update')
  const formRef = useRef(null)

  useEffect(() => {
    if (isGetWalletGroupsError) {
      log.error(
        getWalletGroupsError?.message ?? 'Error while fetching wallet groups on wallets page',
        ['Error while fetching wallet groups on wallets page'],
        {
          actualErrorObject: getWalletGroupsError.data,
          errorStatusCode: getWalletGroupsError.status
        },
        `${window.location.pathname}`
      )
    }
  }, [isGetWalletGroupsError])

  useEffect(() => {
    if (isGetWalletDetailsSuccess) {
      setSelectedChainsForWallet(walletDetails.supportedBlockchains)
      setIsWalletFlagged(walletDetails.flaggedAt)
      setValue('name', walletDetails?.name)
      setValue('walletGroup', { value: walletDetails?.group?.id, label: walletDetails?.group?.name })
    }
  }, [isGetWalletDetailsSuccess, walletDetails])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<IEditWalletForm>({
    defaultValues: {
      name: walletDetails?.name,
      walletGroup: { value: walletDetails?.group?.id, label: walletDetails?.group?.name },
      isFlagged: isWalletFlagged
    }
  })

  const walletGroup = useWatch({ control, name: 'walletGroup' })
  const groupsFormatted = groups?.map((group) => ({ value: group.id, label: group.name }))

  useEffect(() => {
    if (editWalletResult.isSuccess) {
      toast.success('Wallet edited')
      router.push(`/${organizationId}/wallets`)
    }
    if (editWalletResult.isError) {
      setShowErrorModal(true)
      setResponseError(editWalletResult.error.data.message)
      log.error(
        editWalletResult?.error?.data?.message ??
          `${editWalletResult?.error?.status} API Error when adding a new wallet`,
        [`${editWalletResult?.error?.status} API Error when adding a new wallet`],
        {
          actualErrorObject: editWalletResult?.error?.data
        },
        `${window.location.pathname}`
      )
    }
  }, [editWalletResult])

  // submit
  const onSubmit = async (data: IEditWalletForm) => {
    if (isSubmitting) {
      return
    }

    await editWallet({
      orgId: organizationId,
      payload: {
        name: data.name,
        flagged: isWalletFlagged,
        walletGroupId: data.walletGroup?.value || '',
        supportedBlockchains: selectedChainsForWallet
      },
      id: walletDetails?.id
    })
  }

  const customModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const handleToggleCustomModalProvider = () => {
    customModalProvider.methods.setIsOpen(!customModalProvider.state.isOpen)
  }

  // select
  const handleSelectGroup = (item) => {
    setValue('walletGroup', item)
  }

  const handleChainSelectionForWallet = (chainId) => {
    if (selectedChainsForWallet.includes(chainId)) {
      setSelectedChainsForWallet(selectedChainsForWallet.filter((chain) => chain !== chainId))
    } else {
      setSelectedChainsForWallet([...selectedChainsForWallet, chainId])
    }
  }

  const toggleWalletFlag = () => {
    setIsWalletFlagged(!isWalletFlagged)
  }

  const breadcrumbItems = [
    { to: `/${organizationId}/wallets`, label: 'Wallets' },
    { to: `/${organizationId}/wallets/${walletDetails?.id}`, label: `${walletDetails?.name}` },
    { to: `/${organizationId}/wallets/${walletDetails?.id}/edit`, label: 'Edit' }
  ]

  if (isLoading || !walletDetails) {
    return <Loading dark title="Fetching Data" />
  }
  return (
    <>
      <Header>
        <div className="flex items-center">
          <Button
            variant="ghost"
            height={24}
            classNames="!h-[30px] p-[0.5rem]"
            leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
            onClick={() => router.back()}
          />
          <Breadcrumb>
            {breadcrumbItems.map(({ to, label }) => (
              <Link key={to} href={to} legacyBehavior>
                {label}
              </Link>
            ))}
          </Breadcrumb>
        </div>
      </Header>
      <View.Content>
        <form ref={formRef}>
          <div className="pb-8">
            <div className="flex-1 flex flex-col">
              <Typography variant="subtitle2" color="primary" classNames="mb-3">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="address">Wallet Address</label>
                <span className="text-error-500 ml-0.5">*</span>
              </Typography>
              <TextField errorClass="pt-2" placeholder={walletDetails?.address} name="address" disabled />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col">
              <Typography variant="subtitle2" color="primary" classNames="mb-3">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="name">Wallet Name</label>
                <span className="text-error-500 ml-0.5">*</span>
              </Typography>
              <TextField
                errorClass="pt-2"
                placeholder="e.g. Team Wallet EOA"
                name="name"
                control={control}
                errors={errors}
                disabled={isSubmitting}
                rules={{
                  required: { value: true, message: 'Wallet Name is required.' },
                  maxLength: {
                    value: 70,
                    message: 'Wallet name allows maximum of 70 characters.'
                  },
                  validate: (value: string) => value.trim().length !== 0 || 'Wallet Name is required.'
                }}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <Typography variant="subtitle2" color="primary" classNames="mb-3">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="walletGroup">Wallet Group</label>
                <span className="text-error-500 ml-0.5">*</span>
              </Typography>
              <DropDown
                value={walletGroup}
                options={groupsFormatted}
                handleOnChange={handleSelectGroup}
                placeholder="Select a Wallet Group"
                name="walletGroup"
                width="100%"
                customComponents={{
                  // eslint-disable-next-line react/no-unstable-nested-components
                  MenuList: (props) => <CustomDropdownMenu {...props} onCreateGroup={() => setShowCreateGroup(true)} />
                }}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col mt-8">
            <Typography variant="subtitle2" color="primary" classNames="mb-3">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="walletGroup">Flag Wallet</label>
            </Typography>
            {/* <Typography variant="caption" classNames="mb-3" color="secondary">
            Flagging your wallet will immediately stop all outgoing transactions
          </Typography> */}
            <ToggleSwitch checked={isWalletFlagged} onChange={toggleWalletFlag} />
          </div>
          <div className="flex-1 flex flex-col mt-8">
            <Typography variant="subtitle2" color="primary" classNames="mb-3">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor="walletGroup">Chains</label>
              <span className="text-error-500 ml-0.5">*</span>
            </Typography>
            <div className="flex gap-4">
              {supportedChains?.map((chain) => (
                <CheckboxCustom
                  label={chain.name}
                  imageUrl={chain.imageUrl}
                  checked={selectedChainsForWallet.includes(chain.id)}
                  onChange={() => handleChainSelectionForWallet(chain.id)}
                  checkboxGroupName="chainsFilter"
                  id={chain.id}
                  key={chain.id}
                />
              ))}
            </div>
            {selectedChainsForWallet.length === 0 && (
              <div className="flex gap-2 mt-2">
                <Image src={warning} height={10} width={10} />
                <Typography variant="body2">
                  <span className="text-[#E83F6D]">Please select at least one chain</span>
                </Typography>
              </div>
            )}
          </div>
        </form>
      </View.Content>
      <Footer>
        <div className="flex justify-end">
          <Button
            variant="grey"
            height={48}
            label="Cancel"
            classNames="mr-4"
            disabled={isSubmitting}
            onClick={() => router.push(`/${organizationId}/wallets`)}
          >
            Cancel
          </Button>
          <div data-for="disabled-edit-wallet" data-tip="disabled-edit-wallet" className="relative">
            <Button
              variant="black"
              height={48}
              label="Save"
              width="w-[200px]"
              type="submit"
              form="import-wallet-form"
              data-for="disabled-edit-wallet"
              data-tip="disabled-edit-wallet"
              disabled={isSubmitting || !isAuthorized}
              loading={isSubmitting || editWalletResult.isLoading}
              onClick={(e) => {
                if (selectedChainsForWallet.length === 0) return
                const chainsRemoved = difference(walletDetails?.supportedBlockchains, selectedChainsForWallet)
                if (chainsRemoved.length > 0) {
                  handleToggleCustomModalProvider()
                  setUnselectedChains(chainsRemoved)
                } else {
                  handleSubmit(onSubmit)(e)
                }
              }}
            >
              Save
            </Button>
            {!isAuthorized && (
              <ReactTooltip
                id="disabled-edit-wallet"
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
                place="top"
              >
                Only owners can perform this action
              </ReactTooltip>
            )}
          </div>
        </div>
      </Footer>
      {showErrorModal && (
        <NotificationPopUp
          title="Unable to Edit Wallet"
          acceptText="Dismiss"
          description={responseError || 'There was an issue updating the wallet. Please try again.'}
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setResponseError(undefined)
            setShowErrorModal(false)
          }}
        />
      )}
      <BaseModal provider={customModalProvider} width="600">
        <BaseModal.Header>
          <BaseModal.Header.HeaderIcon icon={cautionSvg} />
          <BaseModal.Header.Title>Save Wallet?</BaseModal.Header.Title>
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="secondary" variant="body2">
            {`You will no longer see the transactions and assets for ${
              unselectedChains?.map((chain) => CHAIN_SHORT_NAMES[chain]).join(' and ') || 'unselected'
            } chain.`}
          </Typography>
          <Typography color="secondary" variant="body2">
            {`You can export all your transactions for ${
              unselectedChains?.map((chain) => CHAIN_SHORT_NAMES[chain]).join(' and ') || 'unselected'
            } chain before saving the changes.`}
          </Typography>
        </BaseModal.Body>
        <BaseModal.Footer>
          <div className="flex w-full gap-4">
            <Button
              variant="grey"
              onClick={handleToggleCustomModalProvider}
              label="No, don't save"
              height={48}
              classNames="grow"
            />
            <Button variant="black" onClick={handleSubmit(onSubmit)} label="Yes, Save" height={48} classNames="grow" />
          </div>
        </BaseModal.Footer>
      </BaseModal>
      <CreateGroupModal groups={groups} setShowModal={setShowCreateGroup} showModal={showCreateGroup} action="Create" />
    </>
  )
}

export default EditEOAWallet
