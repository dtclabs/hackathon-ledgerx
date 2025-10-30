import { useGetUserAccountQuery } from '@/api-v2/account-api'
import { useBatchSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useUploadTxFileMutation } from '@/api-v2/old-tx-api'
import { CurrencyType, ISubmitPaymentBody, usePostPaymentsMutation } from '@/api-v2/payment-api'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { selectCryptocurrencyBySymbol } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetTagsQuery,
  useUpdateTagMutation
} from '@/slice/tags/tags-api'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { log } from '@/utils-v2/logger'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { findMatchingAddress } from '@/utils/isExistedRecipient'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import useDraftForm, { getCurrencyImage } from './useDraftForm'
import { IDraftRecipientForm } from './draft-form.type'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'

export const errorMessageMap = {
  amount: 'Amount is missing/invalid in some of the payments. Please add a valid amount to all the payments.',
  walletAddress:
    'Recipient address is missing/invalid in some of the payments. Please add a valid recipient to all the payments.',
  token: 'Currency is invalid in some of the payments. Please select a valid currency for all the payments.',
  files: 'Payments must not have more than 10 files attached, please edit the number of files on your payments.',
  s3Files: 'File uploaded failed.'
}

const useDraftFormLogic = (destinationCurrencyType: CurrencyType) => {
  const methods = useDraftForm(destinationCurrencyType)

  const organizationId = useOrganizationId()
  const router = useRouter()

  const wallets = useAppSelector(walletsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const orgSettings = useAppSelector(orgSettingsSelector)
  const ethToken = useAppSelector((state) => selectCryptocurrencyBySymbol(state)(['eth']))
  const usdcToken = useAppSelector((state) => selectCryptocurrencyBySymbol(state)(['usdc']))

  const [uniqueValidationErrorFields, setUniqueValidationErrorFields] = useState(new Set())
  const [reviewer, setReviewer] = useState({ value: null, label: 'Anyone can review' })

  const processingIndex = useRef(0)
  const submitType = useRef('')

  const [uploadFile, uploadFileRes] = useUploadTxFileMutation()
  const [postPayments, postPaymentsResult] = usePostPaymentsMutation()
  const [triggerBatchSendAnalysis] = useBatchSendAnalysisMutation()
  const [createTag, createTagRes] = useCreateTagMutation()
  const [deleteTag] = useDeleteTagMutation()
  const [updateTag, updateTagRes] = useUpdateTagMutation()

  const { data: tags } = useGetTagsQuery({ organizationId }, { skip: !organizationId })

  const { data: account } = useGetUserAccountQuery({})
  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const {
    append: recipientAppend,
    remove: recipientRemove,
    insert: recipientInsert
  } = useFieldArray({
    control: methods.control,
    name: 'recipients',
    keyName: 'id'
  })

  const onChangeTextInput = (_field) => (_value) => {
    methods.setValue(_field, _value)
  }

  const onChangeChartOfAccount = (_account, _index) => {
    methods.setValue(`recipients.${_index}.chartOfAccounts`, _account)
  }

  const onChangePurposeOfTransfer = (_purpose, _index) => {
    methods.setValue(`recipients.${_index}.purposeOfTransfer`, _purpose.value)
  }

  const handleSelectContact = (_index) => (_contact) => {
    methods.setValue(`recipients.${_index}.walletAddress`, { ..._contact, isUnknown: false })
    if (destinationCurrencyType === CurrencyType.FIAT) {
      methods.setValue(`recipients.${_index}.token`, {
        value: _contact.currencyCode,
        label: _contact.currencyCode,
        src: getCurrencyImage(_contact.currencyCode)
      })
    }
  }

  const onChangeToken = (_field) => (_token) => {
    methods.setValue(_field, _token)
  }

  const handleAddRecipient = () => {
    recipientAppend({
      walletAddress: null,
      amount: '',
      token:
        destinationCurrencyType === CurrencyType.CRYPTO
          ? { value: '', label: 'ETH', src: '/svg/ETH.svg', address: null }
          : {
              value: orgSettings?.fiatCurrency?.code,
              label: orgSettings?.fiatCurrency?.code,
              src: getCurrencyImage(orgSettings?.fiatCurrency?.code)
            },
      files: [],
      note: '',
      chartOfAccounts: null,
      purposeOfTransfer: '',
      destinationCurrencyType
    })
  }

  const handleCopyRecipientRow = (_index) => {
    const _recipients = methods.getValues('recipients')
    const copiedRecipient = _recipients[_index]

    recipientInsert(_index + 1, {
      walletAddress: copiedRecipient?.walletAddress ?? null,
      amount: copiedRecipient?.amount ?? '',
      token:
        copiedRecipient?.token ??
        (destinationCurrencyType === CurrencyType.CRYPTO
          ? { value: '', label: 'ETH', src: '/svg/ETH.svg', address: null }
          : {
              value: orgSettings?.fiatCurrency?.code,
              label: orgSettings?.fiatCurrency?.code,
              src: getCurrencyImage(orgSettings?.fiatCurrency?.code)
            }),
      files: copiedRecipient?.files ?? [],
      note: copiedRecipient?.note ?? '',
      annotations: copiedRecipient?.annotations ?? [],
      chartOfAccounts: copiedRecipient?.chartOfAccounts ?? null,
      purposeOfTransfer: copiedRecipient?.purposeOfTransfer ?? '',
      destinationCurrencyType
    })
    methods.trigger(`recipients.${_index + 1}`)
  }

  const handleRemoveRecipient = (_index) => {
    recipientRemove(_index)
  }

  const handleChangeInput = (_value, _action, _index) => {
    if (_action.action === 'input-change') {
      if (_value) {
        const isAddressPartOfRecipients = findMatchingAddress(contacts?.items, _value)
        const isAddressPartOfWallets = wallets.find((wallet) => wallet.address.toLowerCase() === _value.toLowerCase())

        if (isAddressPartOfRecipients || isAddressPartOfWallets) {
          // Address is in our system
          if (isAddressPartOfRecipients) {
            const { recipient } = isAddressPartOfRecipients
            methods.setValue(`recipients.${_index}.walletAddress`, {
              address: _value,
              value: _value,
              label: recipient?.organizationName || recipient?.contactName,
              chainId: selectedChain?.id,
              isUnknown: false,
              metadata: {
                id: recipient.recipientAddresses.find(
                  (recipientObj) => recipientObj.address?.toLowerCase() === _value.toLowerCase()
                )?.publicId,
                type: 'recipient_address'
              }
            })
            // Address is not in our system
          } else {
            methods.setValue(`recipients.${_index}.walletAddress`, {
              address: _value,
              value: _value,
              label: isAddressPartOfWallets?.name,
              chainId: selectedChain?.id,
              isUnknown: false,
              metadata: {
                id: isAddressPartOfWallets.id,
                type: 'wallet'
              }
            })
          }
        } else {
          methods.setValue(`recipients.${_index}.walletAddress`, {
            address: _value,
            value: _value,
            label: '',
            chainId: selectedChain?.id,
            isUnknown: true,
            metadata: null
          })
        }
      } else {
        methods.setValue(`recipients.${_index}.walletAddress`, null)
      }
    }
  }

  const handleFileChange = (__file, _index, _action) => {
    if (_action === 'add') {
      const getCurrentFiles = methods.getValues(`recipients.${_index}.files`) ?? []
      methods.setValue(`recipients.${_index}.files`, [...getCurrentFiles, __file])
    } else if (_action === 'remove') {
      const getCurrentFiles = methods.getValues(`recipients.${_index}.files`) ?? []
      methods.setValue(
        `recipients.${_index}.files`,
        getCurrentFiles.filter((file) => file.name !== __file.name)
      )
    }
  }

  const validateForm = async () => {
    await methods.trigger()
  }

  // Create Draft line items
  const handleFormSubmit = async () => {
    methods.setValue('isSubmitForReview', false)
    await validateForm()
    if (isEmpty(methods.formState.errors)) {
      submitPaymentsAsDrafts()
    }
  }

  const paymentBody = (recipient: IDraftRecipientForm, status: string) => {
    const obj: ISubmitPaymentBody = {
      destinationName: recipient.walletAddress.label,
      status,
      chartOfAccountId: recipient?.chartOfAccounts?.value,
      notes: recipient?.note,
      reviewerId: reviewer?.value,
      files: recipient?.s3Files,
      annotationIds: recipient?.annotations?.map((_annotation) => _annotation.value),
      destinationCurrencyType: recipient.destinationCurrencyType,
      destinationMetadata: recipient.walletAddress?.metadata?.id ? recipient.walletAddress?.metadata : null,
      destinationCurrencyId: recipient.token.value || ethToken[0]?.publicId,
      destinationAmount: recipient.amount
    }
    if (destinationCurrencyType === CurrencyType.CRYPTO) {
      obj.destinationAddress = recipient.walletAddress.address
      obj.sourceCryptocurrencyId = recipient.token.value || ethToken[0]?.publicId
      obj.sourceAmount = recipient.amount
      obj.blockchainId = selectedChain?.id
    } else if (destinationCurrencyType === CurrencyType.FIAT) {
      obj.sourceCryptocurrencyId = usdcToken[0]?.publicId
      obj.metadata = {
        purposeOfTransfer: recipient?.purposeOfTransfer
      }
    }
    if (status === 'pending') {
      obj.reviewRequestedBy = {
        name: `${account?.data?.firstName} ${account?.data?.lastName}`
      }
    }
    return obj
  }

  const submitPaymentsAsDrafts = async () => {
    try {
      processingIndex.current = 0
      const promisesToFileUpload = methods.getValues('recipients').map(async (recipient, index) => {
        const formData = new FormData()
        if (recipient.files?.length > 0) {
          recipient.files.forEach((file) => {
            formData.append('files', file)
          })
          const result: any = await uploadFile({ files: formData })

          // track what draft is failed
          processingIndex.current = index
          if (result?.data.data.length > 0) {
            methods.setValue(`recipients.${index}.s3Files`, result?.data.data)
          }
        }
      })

      await Promise.all(promisesToFileUpload)
      // This will only trigger as long as Yup validations on Create Draft page passes
      const postPaymentArray = methods.getValues('recipients').map((recipient) => paymentBody(recipient, 'created'))

      await postPayments({
        params: { organizationId },
        body: postPaymentArray
      }).unwrap()

      toast.success('Successfully saved as drafts')
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

  const submitPaymentsForReview = async () => {
    try {
      processingIndex.current = 0

      submitType.current = 'review'
      const promisesToFileUpload = methods.getValues('recipients').map(async (recipient, index) => {
        const formData = new FormData()
        if (recipient.files?.length > 0) {
          recipient.files.forEach((file) => {
            formData.append('files', file)
          })
          const result: any = await uploadFile({ files: formData })

          // track what draft is failed
          processingIndex.current = index
          if (result?.data.data.length > 0) {
            methods.setValue(`recipients.${index}.s3Files`, result?.data.data)
          }
        }
      })

      await Promise.all(promisesToFileUpload)
      const postPaymentArray = methods.getValues('recipients').map((recipient) => paymentBody(recipient, 'pending'))

      postPayments({
        params: {
          organizationId
        },
        body: postPaymentArray
      }).unwrap()

      toast.success('Successfully saved as drafts')
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

  const handleChangeReviewer = (_value) => {
    setReviewer(_value)
  }

  const handleClickFooterSecondary = () => {
    router.push(`/${organizationId}/transact/drafts`)
  }

  const onAttachTag = (_value, _index) => {
    const getCurrentTags = methods.getValues(`recipients.${_index}.annotations`) ?? []

    methods.setValue(`recipients.${_index}.annotations`, [...getCurrentTags, _value])
  }

  const onDeleteTag = (_value, _index) => {
    const getCurrentTags = methods.getValues(`recipients.${_index}.annotations`) ?? []

    methods.setValue(
      `recipients.${_index}.annotations`,
      getCurrentTags.filter((_tag) => _tag.value !== _value.value)
    )
  }

  const tagsHandler = useMemo(
    () => ({
      options: tags?.map((_tag) => ({ value: _tag.id, label: _tag.name })) || [],
      onCreate: async (_tagName, _index) => {
        const newTag = await createTag({ organizationId, payload: { name: _tagName } }).unwrap()
        onAttachTag({ value: newTag.id, label: newTag.name }, _index)
      },
      onDelete: (_tag) => {
        deleteTag({ organizationId, id: _tag.value })
      },
      onUpdate: (_tag, _newName) => {
        updateTag({ organizationId, id: _tag.value, payload: { name: _newName } })
      },
      onAttachAnnotation: onAttachTag,
      onDeleteAnnotation: onDeleteTag
    }),
    [tags]
  )

  useEffect(() => {
    if (createTagRes.isError) {
      toast.error(
        createTagRes?.error?.data?.message || 'An error has occurred while creating a new tag. Please try again.'
      )
    }
  }, [createTagRes.isError])

  useEffect(() => {
    if (updateTagRes.isError) {
      toast.error(updateTagRes?.error?.data?.message || 'An error has occurred while updating tag. Please try again.')
    }
  }, [updateTagRes.isError])

  useEffect(() => {
    if (methods.formState?.errors?.recipients) {
      const newErrorFields = []
      Object.values(methods.formState.errors.recipients).forEach((recipientError) => {
        if (recipientError) {
          Object.keys(recipientError).forEach((recipientErrorField) => {
            newErrorFields.push(recipientErrorField)
          })
        }
      })
      setUniqueValidationErrorFields(new Set(newErrorFields))
    } else {
      setUniqueValidationErrorFields(new Set())
    }
  }, [methods.formState?.errors?.recipients])

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

  return {
    methods,
    payee: methods.watch('recipients'),
    recipientAppend,
    reviewer,
    tagsHandler,
    uniqueValidationErrorFields,
    isLoadingWithLabelForSaveDraft:
      uploadFileRes.isLoading || (postPaymentsResult.isLoading && !methods.getValues('isSubmitForReview')),
    isLoadingWithLabelForReview:
      uploadFileRes.isLoading || (postPaymentsResult.isLoading && methods.getValues('isSubmitForReview')),
    isDisabled: postPaymentsResult.isLoading || uploadFileRes.isLoading,
    handleCopyRecipientRow,
    handleRemoveRecipient,
    handleAddRecipient,
    handleChangeInput,
    handleFileChange,
    onChangeTextInput,
    onChangeChartOfAccount,
    onChangePurposeOfTransfer,
    handleSelectContact,
    onChangeToken,
    handleFormSubmit,
    handleChangeReviewer,
    handleSubmitForReview,
    handleClickFooterSecondary
  }
}

export default useDraftFormLogic
