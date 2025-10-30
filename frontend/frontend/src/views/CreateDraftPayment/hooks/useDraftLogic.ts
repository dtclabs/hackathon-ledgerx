import { useGetMembersQuery } from '@/api-v2/members-api'
import { useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import useCheckBalance from '@/hooks-v2/useCheckBalance'
import { log } from '@/utils-v2/logger'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { EProcessStatus } from '@/views/Organization/interface'
import { useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ICreateDraftForm } from './useDraftForm/draft-form.type'

const useDraftLogic = (methods: UseFormReturn<ICreateDraftForm, any>) => {
  const organizationId = useOrganizationId()
  const currentSelectedRecipient = useRef(null)
  const walletToAddAsContact = useRef(null)

  const uploadCsvModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const importContactModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const { balance: tokenBalance, isLoading: isTokenBalanceLoading, error: isTokenBalanceError } = useCheckBalance()

  const [error, setErrorMsg] = useState<any>('')
  const [status, setStatus] = useState<string>(EProcessStatus.PENDING)
  const [openAddRecipientModal, setOpenAddRecipientModal] = useState(false)
  const [walletBalance, setWalletBalance] = useState({
    recipientId: '',
    balance: ''
  })

  const { data: members } = useGetMembersQuery(
    {
      orgId: String(organizationId),
      params: { state: 'active', page: 0, size: 99999 }
    },
    { skip: !organizationId }
  )
  const [triggerPreviewFile] = useLazyPreviewFileQuery()

  useEffect(() => {
    if (isTokenBalanceLoading) {
      setWalletBalance({
        recipientId: '',
        balance: ''
      })
    }
    if (tokenBalance) {
      setWalletBalance({
        recipientId: currentSelectedRecipient.current,
        balance: tokenBalance
      })
    }
  }, [isTokenBalanceLoading, tokenBalance, isTokenBalanceError])

  useEffect(() => {
    if (status === EProcessStatus.SUCCESS) {
      setOpenAddRecipientModal(false)
      toast.success('New recipient successfully added')
      setStatus('')
    }
    if (status === EProcessStatus.FAILED) {
      setOpenAddRecipientModal(false)
      toast.error(error || 'Add new recipient failed')
      setStatus('')

      log.error(
        'Error while adding a recipient on make payments page',
        ['Error while adding a recipient on make payments page'],
        {},
        `${window.location.pathname}`
      )
    }
  }, [status])

  const handleOnClickUploadCSV = () => {
    uploadCsvModalProvider.methods.setIsOpen(true)
  }

  const handlePreviewFile = (file) => {
    if (file?.id) {
      triggerPreviewFile({ key: file.id, filename: file.name })
    } else {
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
    }
  }

  const handleCreateRecipient = () => {
    setOpenAddRecipientModal(true)
  }

  const onClickAddNewContact = (_address, _index) => {
    walletToAddAsContact.current = { address: _address, index: _index }
    importContactModalProvider?.methods?.setIsOpen(true)
  }

  const onAddContactSuccess = (_contact) => {
    const contact = methods.watch(`recipients.${walletToAddAsContact.current?.index}.walletAddress`)
    if (contact) {
      const newWallet = _contact?.recipientAddresses?.find(
        (wallet) => wallet?.address?.toLowerCase() === contact?.address?.toLowerCase()
      )

      const contactMap = {
        ...contact,
        label: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName,
        address: walletToAddAsContact.current?.address,
        isUnknown: false,
        metadata: {
          id: newWallet.publicId,
          type: 'recipient_address'
        }
      }
      methods.setValue(`recipients.${walletToAddAsContact.current?.index}.walletAddress`, contactMap)
    }
  }
  return {
    organizationId,
    members,
    uploadCsvModalProvider,
    openAddRecipientModal,
    walletToAddAsContact,
    importContactModalProvider,
    setOpenAddRecipientModal,
    setErrorMsg,
    setStatus,
    handlePreviewFile,
    handleOnClickUploadCSV,
    handleCreateRecipient,
    onClickAddNewContact,
    onAddContactSuccess
  }
}
export default useDraftLogic
