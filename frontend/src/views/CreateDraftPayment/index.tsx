import React, { useEffect, useMemo, useRef, useState } from 'react'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useRouter } from 'next/router'
import { useBatchSendAnalysisMutation } from '@/api-v2/analysis-api'
import View, { Header } from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useAppSelector } from '@/state'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import Recipients from './components/Recipients'
import { useForm, FormProvider } from 'react-hook-form'
import Typography from '@/components-v2/atoms/Typography'
import DocumentIcon from '@/public/svg/Document.svg'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import ContactTransactionModal from '../_deprecated/Transactions/components/ContactTransaction/ContactTransaction'
import { Dropdown } from '@/components-v2/molecules/Forms'
import { NoBorderDropdown } from '@/components-v2/atoms/Dropdown'
import { ImportRecipientsModal } from './components/ImportRecipientsModal'
import { useGetMembersQuery } from '@/api-v2/members-api'
import { yupResolver } from '@hookform/resolvers/yup'
import { schema, walletAddressSchema } from '../MakePayment2/components/MakePaymentStep/form-schema'
import * as yup from 'yup'
import { selectCryptocurrencyBySymbol } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { usePostPaymentsMutation } from '@/api-v2/payment-api'
import { toast } from 'react-toastify'
import { EProcessStatus } from '../Organization/interface'
import { log } from '@/utils-v2/logger'
import AddNewRecipientModal from '../Recipients/components/AddNewRecipientModal/AddNewRecipientModal'
import { useUploadTxFileMutation } from '@/api-v2/old-tx-api'
import { isEmpty } from 'lodash'
import { useGetUserAccountQuery } from '@/api-v2/account-api'
import ReviewerOptionLabel from './components/ReviewerOptionLabel'
import { useGetTagsQuery } from '@/slice/tags/tags-api'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'

// TODO-DRAFT Extract this to an external form ?
interface IWalletAddressItem {
  value: string
  label: string
  address: string
  src: string
  chainId: string
  metadata?: {
    id: string
    type: string
  }
  isUnknown?: boolean
}

interface IAddressItem {
  address: string
  blockchainId: string
  decimal: 18
  type: string
  label: string
  src: string
  value: string
}

interface IChartOfAccountItem {
  value: string
  label: string
  code?: string
  name: string
  type: string
}

export interface ICreateDraftForm {
  recipients: IRecipientItemForm[]
  reviewer: string
  isSubmitForReview: boolean
}

export interface IRecipientItemForm {
  walletAddress: null | IWalletAddressItem
  chartOfAccounts?: IChartOfAccountItem
  note: string
  files: any
  annotations?: { value: string; label: string }[]
  s3Files?: any
  amount: string
  token: {
    publicId: string
    value: string
    label: string
    src: string
    address: IAddressItem
  }
}

const CreateDraftPayment = () => {
  const router = useRouter()
  const walletToAddAsContact = useRef(null)
  const processingIndex = useRef(0)
  const submitType = useRef('')
  const [reviewer, setReviewer] = useState({ value: null, label: 'Anyone can review' })
  const importContactModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const uploadCsvModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const organizationId = useOrganizationId()
  const isShowingBanner = useAppSelector(showBannerSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [openAddRecipientModal, setOpenAddRecipientModal] = useState(false)
  const [status, setStatus] = useState<string>(EProcessStatus.PENDING)
  const [error, setErrorMsg] = useState<any>('')
  const [uploadFile, uploadFileRes] = useUploadTxFileMutation()
  const [postPayments, postPaymentsResult] = usePostPaymentsMutation()
  const { data: account } = useGetUserAccountQuery({})
  const [triggerBatchSendAnalysis] = useBatchSendAnalysisMutation()
  const ethToken = useAppSelector((state) => selectCryptocurrencyBySymbol(state)(['eth']))
  const { data: members } = useGetMembersQuery(
    {
      orgId: String(organizationId),
      params: { state: 'active', page: 0, size: 99999 }
    },
    { skip: !organizationId }
  )
  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId }
  )
  const { data: tags } = useGetTagsQuery({ organizationId }, { skip: !organizationId })

  const amountSchemaForDrafts = yup.string().when('amount', {
    is: (val) => val && val !== '',
    then: yup
      .string()
      .test('checkMinimumAmount', 'Must be greater than 0', (value) => Number.isNaN(Number(value)) || Number(value) > 0)
      .matches(/^\d+\.?\d*$/, 'Please enter a valid amount'),
    otherwise: yup.string()
  })

  const amountSchemaForReview = yup
    .string()
    .required('Amount is required.')
    .test('checkMinimumAmount', 'Must be greater than 0', (value) => Number.isNaN(Number(value)) || Number(value) > 0)
    .matches(/^\d+\.?\d*$/, 'Please enter a valid amount')

  const validationSchema = yup.object().shape({
    isSubmitForReview: yup.boolean(),
    recipients: yup.array().of(
      yup.object().shape({
        walletAddress: walletAddressSchema,
        amount: yup.string().when('isSubmitForReview', () => {
          const isSubmitForReview = methods.getValues('isSubmitForReview')
          if (isSubmitForReview) {
            return amountSchemaForReview
          }
          return amountSchemaForDrafts
        }),
        files: yup
          .array()
          .nullable()
          .test('checkNumberOfFile', 'Maximum number of files: 10', (file) => file?.length <= Number(10))
      })
    )
  })

  const methods = useForm<ICreateDraftForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      isSubmitForReview: false,
      reviewer: null,
      recipients: [
        {
          walletAddress: null,
          files: [],
          s3Files: [], // TODO-PENDING- Better naming
          amount: '',
          annotations: [],
          token: {
            value: '',
            label: 'ETH',
            src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_71573a87-6766-433a-9c5e-b96526a78138_small.png',
            address: {
              blockchainId: selectedChain?.id,
              type: 'Coin',
              decimal: 18,
              address: null
            }
          },
          chartOfAccounts: null
        }
      ]
    },
    resolver: yupResolver(validationSchema)
  })

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

  useEffect(() => {
    if (postPaymentsResult.isSuccess) {
      methods.setValue('isSubmitForReview', false)
      const uuid = uuidv4()
      const salt = new Date().getTime()

      const analysisData = postPaymentsResult.data.map((payment) => ({
        eventType: 'CREATE_DRAFT_PAYMENT',
        metadata: {
          id: payment.id,
          batchId: `${salt}-${uuid}`,
          amount: payment.amount,
          blockchainId: payment.blockchainId,
          cryptocurrency: payment?.cryptocurrency?.symbol,
          createdAt: payment.createdAt,
          chartOfAccount: payment?.chartOfAccount?.name ?? null,
          createdBy: payment.createdBy?.name,
          destinationAddress: payment.destinationAddress,
          isDestinationRecipient: Boolean(payment?.destinationMetadata),
          files: payment.files?.length,
          hasNotes: payment.notes?.length > 0,
          hasReviewer: Boolean(payment?.reviewer?.id)
        }
      }))

      triggerBatchSendAnalysis(analysisData)
      if (submitType.current === 'review') {
        submitType.current = ''
        router.push(`/${organizationId}/transact/drafts?tab=pending-review`)
      } else {
        router.push(`/${organizationId}/transact/drafts`)
      }
    } else if (postPaymentsResult.isError) {
      toast.error(postPaymentsResult.error?.data?.message || 'Sorry, an error occurred')

      log.error(
        `${postPaymentsResult.error?.data?.message} while creating drafts`,
        [`${postPaymentsResult.error?.data?.message} while creating drafts`],
        { actualErrorObject: JSON.stringify(postPaymentsResult.error) },
        `${window.location.pathname}`
      )
    }
  }, [postPaymentsResult.isSuccess, postPaymentsResult.isError])

  const submitPaymentsAsDrafts = async () => {
    try {
      processingIndex.current = 0

      const promisesToFileUpload = methods.getValues('recipients').map(async (recipient, index) => {
        const formData = new FormData()
        recipient.files.forEach((file) => {
          formData.append('files', file)
        })
        const result: any = await uploadFile({ files: formData })

        // track what draft is failed
        processingIndex.current = index
        if (result?.data.data.length > 0) {
          methods.setValue(`recipients.${index}.s3Files`, result?.data.data)
        }
      })

      await Promise.all(promisesToFileUpload)
      // This will only trigger as long as Yup validations on Create Draft page passes
      const postPaymentArray = methods.getValues('recipients').map((recipient) => ({
        destinationAddress: recipient.walletAddress.address,
        destinationName: recipient.walletAddress.label,
        destinationMetadata: recipient.walletAddress?.metadata?.id
          ? {
              id: recipient.walletAddress?.metadata?.id,
              type: recipient.walletAddress?.metadata?.type
            }
          : null,
        status: 'created',
        cryptocurrencyId: recipient.token.value || ethToken[0]?.publicId, // Because this will be null if user selects the default eth,
        amount: recipient.amount,
        blockchainId: selectedChain?.id,
        chartOfAccountId: recipient?.chartOfAccounts?.value,
        notes: recipient?.note,
        files: recipient?.s3Files,
        reviewerId: reviewer?.value,
        annotationIds: recipient?.annotations?.map((_annotation) => _annotation.value)
      }))

      postPayments({
        params: { organizationId },
        body: postPaymentArray
      })
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload files')
      methods.setError(`recipients.${processingIndex.current}.s3Files`, {
        message: err?.data?.message || 'Failed to upload files'
      })

      log.error(
        `${err?.data?.message} while creating drafts`,
        [`${err?.data?.message} while creating drafts`],
        { actualErrorObject: JSON.stringify(err) },
        `${window.location.pathname}`
      )
    }
  }

  const submitPaymentsForReview = async () => {
    try {
      processingIndex.current = 0

      submitType.current = 'review'
      const promisesToFileUpload = methods.getValues('recipients').map(async (recipient, index) => {
        const formData = new FormData()
        recipient.files.forEach((file) => {
          formData.append('files', file)
        })
        const result: any = await uploadFile({ files: formData })

        // track what draft is failed
        processingIndex.current = index
        if (result?.data.data.length > 0) {
          methods.setValue(`recipients.${index}.s3Files`, result?.data.data)
        }
      })

      await Promise.all(promisesToFileUpload)
      const postPaymentArray = methods.getValues('recipients').map((recipient) => ({
        destinationAddress: recipient.walletAddress.address,
        destinationName: recipient.walletAddress.label,
        destinationMetadata: recipient.walletAddress?.metadata?.id
          ? {
              id: recipient.walletAddress?.metadata?.id,
              type: recipient.walletAddress?.metadata?.type
            }
          : null,
        status: 'pending',
        cryptocurrencyId: recipient.token.value || ethToken[0]?.publicId, // Because this will be null if user selects the default eth,
        amount: recipient.amount,
        blockchainId: selectedChain?.id,
        chartOfAccountId: recipient?.chartOfAccounts?.value,
        notes: recipient?.note,
        files: recipient?.s3Files,
        reviewerId: reviewer?.value,
        reviewRequestedBy: {
          name: `${account?.data?.firstName} ${account?.data?.lastName}`
        },
        annotationIds: recipient?.annotations?.map((_annotation) => _annotation.value)
      }))

      postPayments({
        params: {
          organizationId
        },
        body: postPaymentArray
      })
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload files')
      methods.setError(`recipients.${processingIndex.current}.s3Files`, {
        message: err?.data?.message || 'Failed to upload files'
      })

      log.error(
        `${err?.data?.message} while creating drafts`,
        [`${err?.data?.message} while creating drafts`],
        { actualErrorObject: JSON.stringify(err) },
        `${window.location.pathname}`
      )
    }
  }

  const handleSubmitForReview = async () => {
    methods.setValue('isSubmitForReview', true)
    await validateForm()
    if (isEmpty(methods.formState.errors)) submitPaymentsForReview()
  }

  // Create Draft line items
  const handleFormSubmit = async () => {
    methods.setValue('isSubmitForReview', false)
    await validateForm()
    if (isEmpty(methods.formState.errors)) submitPaymentsAsDrafts()
  }

  const validateForm = async () => {
    await methods.trigger()
  }

  const handleOnClickUploadCSV = () => {
    uploadCsvModalProvider.methods.setIsOpen(true)
  }

  const onClickAddNewContact = (_address, _index) => {
    walletToAddAsContact.current = { address: _address, index: _index }
    importContactModalProvider?.methods?.setIsOpen(true)
  }

  const onAddContactSuccess = (_contact) => {
    const contact = methods.watch(`recipients.${walletToAddAsContact.current?.index}.walletAddress`)

    if (contact) {
      const contactMap = {
        ...contact,
        label: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName,
        address: walletToAddAsContact.current?.address,
        isUnknown: false,
        metadata: {
          id: _contact.publicId,
          type: 'recipient_address'
        }
      }
      methods.setValue(`recipients.${walletToAddAsContact.current?.index}.walletAddress`, contactMap)
    }
  }

  const breadcrumbItems = [
    { to: `/${organizationId}/transact/drafts`, label: 'Manage Drafts' },
    { to: `/${organizationId}/transfer/create-draft`, label: 'Create Draft' }
  ]

  const handleCreateRecipient = () => {
    setOpenAddRecipientModal(true)
  }

  const handleClickFooterSecondary = () => {
    router.push(`/${organizationId}/transact/drafts`)
  }

  return (
    <FormProvider {...methods}>
      <form>
        <Header>
          <div className="flex items-center">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] p-[0.5rem]"
              leadingIcon={<Image src={leftArrow} height={10} width={10} />}
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
        <View.Content className={isShowingBanner ? '!h-[calc(100vh-340px)]' : '!h-[calc(100vh-272px)]'}>
          <div className="flex rounded-2xl gap-6 mb-8 mt-2">
            <Recipients
              selectedChain={{
                blockchain: selectedChain?.id,
                chainId: selectedChain?.chainId
              }}
              recipients={contacts?.items || []}
              onClickUploadCSV={handleOnClickUploadCSV}
              onCreateRecipient={handleCreateRecipient}
              onClickAddNewContact={onClickAddNewContact}
              sectionTitle="Payments"
              tagOptions={tags}
            />
          </div>
        </View.Content>
        <View.Footer extraClassName="!pl-0">
          <section id="footer-buttons" className="flex flex-row justify-between p-4 bg-white border-t border-[#F1F1EF]">
            <div className="flex gap-2">
              <Button onClick={handleClickFooterSecondary} variant="grey" label="Cancel" height={48} />
              {/* TODO-DRAFT - Clean up the button system */}
              <Button
                variant="black"
                height={48}
                onClick={handleFormSubmit}
                loadingWithLabel={
                  uploadFileRes.isLoading || (postPaymentsResult.isLoading && !methods.getValues('isSubmitForReview'))
                }
                label="Save as Drafts"
                disabled={postPaymentsResult.isLoading || uploadFileRes.isLoading}
              />
            </div>
            <div className="border border-[#F1F1EF] flex w-fit-content p-1 rounded gap-2">
              <NoBorderDropdown
                options={members?.data?.items
                  .map((member) => ({
                    value: member.id,
                    label: `${member.firstName} ${member.lastName}`
                  }))
                  .concat({
                    value: null,
                    label: 'Anyone can review'
                  })}
                showCaret
                onChange={(value) => {
                  setReviewer(value)
                }}
                defaultValue={{ value: null, label: 'Anyone can review' }}
                value={reviewer}
                sizeVariant="small"
                isSearchable
                menuPlacement="top"
                formatOptionLabel={ReviewerOptionLabel}
              />
              <Button
                variant="grey"
                height={40}
                label="Submit For Review"
                onClick={handleSubmitForReview}
                loadingWithLabel={
                  uploadFileRes.isLoading || (postPaymentsResult.isLoading && methods.getValues('isSubmitForReview'))
                }
                classNames="grow"
                disabled={uploadFileRes.isLoading || postPaymentsResult.isLoading}
              />
            </div>
          </section>
        </View.Footer>
      </form>
      <ImportRecipientsModal provider={uploadCsvModalProvider} />
      {openAddRecipientModal && (
        <AddNewRecipientModal
          setError={setErrorMsg}
          setStatus={setStatus}
          showModal={openAddRecipientModal}
          setShowModal={setOpenAddRecipientModal}
          selectedChain={selectedChain}
        />
      )}
      <ContactTransactionModal
        showModal={importContactModalProvider?.state?.isOpen}
        setShowModal={importContactModalProvider?.methods?.setIsOpen}
        contactAddress={walletToAddAsContact.current?.address}
        onSuccess={onAddContactSuccess}
      />
    </FormProvider>
  )
}
export default CreateDraftPayment
