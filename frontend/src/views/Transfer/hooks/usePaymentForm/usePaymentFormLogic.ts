/* eslint-disable no-param-reassign */
// Libraries
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { useWeb3React } from '@web3-react/core'

// Utilities
import { useAppSelector, useAppDispatch } from '@/state'
import { findMatchingAddress } from '@/utils/isExistedRecipient'
import { useOrganizationId } from '@/utils/getOrganizationId'

// Types
import { IMakePaymentForm, IRecipientItemForm, RecipientType } from '../../Transfer.types'

// Selectors
import { selectTokenPriceIdMap, selectedChainNativeToken } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { selectContactMapWalletAddress } from '@/slice/contacts/contacts.selectors'

import { selectWalletMapByAddress, walletsSelector, selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { selectReviewData } from '@/slice/transfer/transfer.selectors'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'

// import { resetTokenApprovals } from '@/slice/transfer/trasnfer.slice'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { IPreviewFileRequest, useUploadTxFileMutation } from '@/api-v2/old-tx-api'

import { SourceType } from '@/slice/wallets/wallet-types'
import { is } from 'date-fns/locale'

type UnknownError = {
  type: 'UnknownError'
  data?: {
    sourceId: string
    message: string
  }
}

type NoSourceFoundError = {
  type: 'NoSourceFound'
  data?: {
    sourceId: string
    message: string
  }
}

type IFileTooLarge = {
  type: 'FileTooLarge'
  data?: {
    message: string
  }
}

type IFileNotSupported = {
  type: 'FileNotSupported'
  data?: {
    message: string
  }
}

type MixedTokensNotAllowed = {
  type: 'MixedTokensNotAllowed'
  data?: {
    sourceId: string
    message: string
  }
}

interface IOnClickFile {
  file: any
  index: number
  action: 'add' | 'remove'
}

// Define a union type for all possible error types
type ChangeSourceErrorTypes = NoSourceFoundError | MixedTokensNotAllowed | UnknownError
type AddRecipientErrorTypes = UnknownError
type UploadFileErrorTypes = IFileTooLarge | IFileNotSupported | UnknownError

// Define a union type for the result
type Result<T, E> = { isSuccess: true; data: T } | { isSuccess: false; error: E }

const maxSizeInMB = 2
const allowedExtensions = [
  'jpg',
  'png',
  'csv',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'pages',
  'numbers',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'tif'
]

export const usePaymentFormLogic = () => {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()

  const reviewData = useAppSelector(selectReviewData)
  const wallets = useAppSelector(walletsSelector)
  const contactsMap = useAppSelector(selectContactMapWalletAddress)
  const selectedChain = useAppSelector(selectedChainSelector)
  const nativeToken = useAppSelector(selectedChainNativeToken)
  const tokenPriceMap = useAppSelector(selectTokenPriceIdMap)
  const walletMap = useAppSelector(selectWalletMapByAddress)
  const walletMapId = useAppSelector(selectWalletMapById)
  const organizationSettings = useAppSelector(orgSettingsSelector)

  const isInitialized = useRef(false)
  const prevSelectedChainIdRef = useRef(selectedChain?.id)

  const [triggerUploadFile, uploadFileResponse] = useUploadTxFileMutation()
  const [triggerTokenPriceQuery] = useLazyGetTokenPriceQuery()
  const { setError, setValue, watch, getValues, reset, formState, control } = useFormContext<IMakePaymentForm>()

  const { append: appendRecipient, remove: handleRemoveRecipient } = useFieldArray({
    control,
    name: 'recipients' // Name of the field array
  })

  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  // When account is changed - check if exists in sources and set the sourceWalletId
  useEffect(() => {
    if (account && !isInitialized.current) {
      const wallet = walletMap[account?.toLowerCase()]
      if (wallet) {
        isInitialized.current = true
        setValue('sourceWalletId', wallet.id)
        //   dispatch(resetTokenApprovals())
      }
    }
  }, [account])

  useEffect(() => {
    if (reviewData) {
      const { recipients } = reviewData
      if (recipients.length === 0) {
        resetPaymentForm()
      } else {
        setValue('recipients', reviewData.recipients)
      }
    } else {
      resetPaymentForm()
    }
  }, [])

  const resetRecipientTokens = () => {
    const recipients = getValues('recipients') ?? []

    // Don't change tokens for those that are imported drafts
    recipients.forEach((recipient, index) => {
      if (!recipient.draftMetadata) {
        setValue(`recipients.${index}.tokenId`, nativeToken?.publicId)
      }
    })
  }

  useEffect(() => {
    // To prevent re-rendering on every change - higher level components causing re-renders
    const prevSelectedChainId = prevSelectedChainIdRef.current
    const currentSelectedChainId = selectedChain?.id

    if (prevSelectedChainId !== currentSelectedChainId) {
      resetRecipientTokens()
      const sourceWalletId = getValues('sourceWalletId')
      const wallet = walletMapId[sourceWalletId]
      if (wallet && wallet?.sourceType === SourceType.GNOSIS) {
        setValue('sourceWalletId', null)
      }
      prevSelectedChainIdRef.current = currentSelectedChainId
    }
  }, [selectedChain?.id])

  const resetPaymentForm = () => {
    reset({
      recipients: [
        {
          walletAddress: null,
          files: [],
          amount: '',
          tokenId: nativeToken?.publicId,
          chartOfAccountId: null,
          note: '',
          isUnknown: true
        }
      ],
      sourceWalletId: watch('sourceWalletId') ?? null
    })
  }

  const removeRecipient = (index: number) => {
    handleRemoveRecipient(index)
  }

  const addRecipient = (_recipient: Partial<IRecipientItemForm> = {}): Result<null, AddRecipientErrorTypes> => {
    try {
      const emptyRecipient: IRecipientItemForm = {
        walletAddress: null,
        files: [],
        amount: '',
        tokenId: nativeToken?.publicId,
        chartOfAccountId: null,
        note: '',
        walletId: null,
        isUnknown: true,
        metadata: null,
        draftMetadata: null
      }

      // Iterate over _recipient keys and override emptyRecipient values only if _recipient's value is truthy
      const recipientWithDefaults = Object.keys(_recipient).reduce(
        (acc, key) => {
          const value = _recipient[key]
          if (value) {
            acc[key] = value // Checks for truthy value; falsy values will not overwrite the default
          }
          return acc
        },
        { ...emptyRecipient }
      )

      // Check if the recipient's wallet address exists in any of the maps
      const recipientWalletAddress = recipientWithDefaults?.walletAddress?.toLowerCase()
      if (recipientWalletAddress) {
        if (contactsMap[recipientWalletAddress]) {
          const contact = contactsMap[recipientWalletAddress]

          const recipientAddressId = contact?.recipientAddresses?.find(
            (address) => address?.address?.toLowerCase() === recipientWalletAddress.toLowerCase()
          )

          recipientWithDefaults.walletId = contact?.walletId || null
          recipientWithDefaults.isUnknown = false
          recipientWithDefaults.metadata = { type: RecipientType.RECIPIENT_ADDRESS, id: recipientAddressId?.publicId } // Add metadata for contact
        } else if (walletMap[recipientWalletAddress]) {
          const wallet = walletMap[recipientWalletAddress]
          recipientWithDefaults.walletId = wallet?.id || null
          recipientWithDefaults.isUnknown = false
          recipientWithDefaults.metadata = { type: RecipientType.WALLET, id: wallet?.id } // Add metadata for wallet
        }
      }
      const recipients = getValues('recipients')
      const lastRecipient = recipients[recipients.length - 1]

      if (!lastRecipient.amount && !lastRecipient.note && !lastRecipient.walletAddress) {
        setValue(`recipients.${recipients.length - 1}`, recipientWithDefaults)
      } else {
        appendRecipient(recipientWithDefaults)
      }

      return {
        isSuccess: true,
        data: null
      }
    } catch (_err) {
      return {
        isSuccess: false,
        error: {
          type: 'UnknownError'
        }
      }
    }
  }

  const handleChangeInput = (_value, _action, _index) => {
    // Handle User is typing or pasting an address
    if (_action.action === 'input-change' && _value) {
      const isAddressPartOfRecipients = findMatchingAddress(contacts?.items, _value)
      const isAddressPartOfWallets = wallets.find((wallet) => wallet.address.toLowerCase() === _value.toLowerCase())

      if (isAddressPartOfRecipients || isAddressPartOfWallets) {
        // Address is in our system
        if (isAddressPartOfRecipients) {
          const { recipient } = isAddressPartOfRecipients
          const recipientsWallet = recipient.recipientAddresses.find(
            (recipientObj) => recipientObj.address?.toLowerCase() === _value?.toLowerCase()
          )
          setValue(`recipients.${_index}.walletId`, recipientsWallet.publicId)
          setValue(`recipients.${_index}.walletAddress`, recipientsWallet.address)
          setValue(`recipients.${_index}.metadata`, {
            id: recipientsWallet.publicId,
            type: RecipientType.RECIPIENT_ADDRESS
          })
        } else if (isAddressPartOfWallets) {
          setValue(`recipients.${_index}.walletId`, isAddressPartOfWallets.id)
          setValue(`recipients.${_index}.walletAddress`, isAddressPartOfWallets.address)
          setValue(`recipients.${_index}.metadata`, {
            id: isAddressPartOfWallets.id,
            type: RecipientType.WALLET
          })
        }
        setValue(`recipients.${_index}.isUnknown`, false)
      } else {
        // Address is not in our system
        setValue(`recipients.${_index}.walletId`, null)
        setValue(`recipients.${_index}.walletAddress`, _value)
        setValue(`recipients.${_index}.isUnknown`, true)
        setValue(`recipients.${_index}.metadata`, null)
      }
    }
  }

  const handleChangeToken = (_field, _value) => {
    if (!tokenPriceMap[_value]) {
      triggerTokenPriceQuery({
        params: {
          cryptocurrencyId: _value,
          date: format(new Date(), 'yyyy-MM-dd'),
          fiatCurrency: organizationSettings?.fiatCurrency?.code ?? 'USD'
        }
      })
    }
    setValue(_field, _value)
  }

  // Handle when selecting item from recipient dropdown
  const handleSelectContact = (_contact, _index) => {
    const isAddressPartOfRecipients = findMatchingAddress(contacts?.items, _contact?.address)
    const isAddressPartOfWallets = wallets.find(
      (wallet) => wallet.address.toLowerCase() === _contact?.address.toLowerCase()
    )

    if (isAddressPartOfRecipients || isAddressPartOfWallets) {
      if (isAddressPartOfRecipients) {
        const { recipient } = isAddressPartOfRecipients

        const recipientsWallet = recipient.recipientAddresses.find(
          (recipientObj) => recipientObj.address?.toLowerCase() === _contact?.address?.toLowerCase()
        )
        setValue(`recipients.${_index}.walletId`, recipientsWallet.publicId)
        setValue(`recipients.${_index}.isUnknown`, false)
        setValue(`recipients.${_index}.walletAddress`, recipientsWallet.address)
        setValue(`recipients.${_index}.metadata`, {
          id: recipientsWallet?.publicId,
          type: RecipientType.RECIPIENT_ADDRESS
        })
      } else if (isAddressPartOfWallets) {
        setValue(`recipients.${_index}.isUnknown`, false)
        setValue(`recipients.${_index}.walletId`, isAddressPartOfWallets.publicId)
        setValue(`recipients.${_index}.walletAddress`, isAddressPartOfWallets.address)
        setValue(`recipients.${_index}.metadata`, {
          id: isAddressPartOfWallets.id,
          type: RecipientType.WALLET
        })
      }
    } else {
      window.alert("Recipient's address is not in our system")
    }
  }

  const handleOnChangeSourceWallet = async ({
    id: _newSourceWalletId
  }): Promise<Result<{ sourceWalletId: string }, ChangeSourceErrorTypes>> => {
    try {
      const sourceWalletId = getValues('sourceWalletId')
      const recipients = getValues('recipients')
      const tokenValues = recipients.map((obj) => obj.tokenId)

      // Check we are going from gnosis to eth wallet & multiple tokens
      const currentSourceWalletType = walletMapId[sourceWalletId]?.sourceType
      const newSourceWalletType = walletMapId[_newSourceWalletId]?.sourceType

      if (!walletMapId[_newSourceWalletId] || !walletMapId[_newSourceWalletId].id) {
        return {
          isSuccess: false,
          error: {
            type: 'NoSourceFound'
          }
        }
      }

      if (
        currentSourceWalletType === SourceType.GNOSIS &&
        newSourceWalletType === SourceType.ETH &&
        new Set(tokenValues).size !== 1
      ) {
        return {
          isSuccess: false,
          error: {
            type: 'MixedTokensNotAllowed'
          }
        }
      }
      setValue('sourceWalletId', _newSourceWalletId)
      return {
        isSuccess: true,
        data: null
      }
    } catch (_err) {
      return {
        isSuccess: false,
        error: {
          type: 'UnknownError'
        }
      }
    }
  }

  function validateFile(file): Result<boolean, UploadFileErrorTypes> {
    const sizeInMB = file.size / (1024 * 1024) // Convert bytes to megabytes
    const extension = file.name.split('.').pop().toLowerCase()

    if (sizeInMB > maxSizeInMB) {
      return {
        isSuccess: false,
        error: {
          type: 'FileTooLarge',
          data: {
            message: `File size is too big. Select a file less than ${maxSizeInMB} MB.`
          }
        }
      }
    }

    if (!allowedExtensions.includes(extension)) {
      return {
        isSuccess: false,
        error: {
          type: 'FileNotSupported',
          data: {
            message: `.${extension} is not supported.`
          }
        }
      }
    }

    return {
      isSuccess: true,
      data: true
    }
  }

  const handleOnClickFile = async ({ file, index, action }: IOnClickFile) => {
    console.log('ON CLICK FILE LOGIC ', file, action)
    if (action === 'add') {
      try {
        console.log('what')
        const fileValidation = validateFile(file)
        if (fileValidation.isSuccess === true) {
          const filesToUpload = new FormData()
          filesToUpload.append('files', file)
          const result = await triggerUploadFile({ files: filesToUpload }).unwrap()
          const getRecipientFiles = getValues(`recipients.${index}.files`)
          const data = {
            key: result?.data[0],
            filename: file.name
          }
          setValue(`recipients.${index}.files`, [...getRecipientFiles, data])

          console.log('result', data)
          return {
            isSuccess: true
          }
        }

        // Handle different error cases without else blocks
        if (fileValidation.error.type === 'FileTooLarge') {
          setError(`recipients.${index}.files`, {
            type: 'manual',
            message: fileValidation.error.data.message
          })
          return {
            isSuccess: false,
            error: {
              type: '',
              message: ''
            }
          }
        }

        if (fileValidation.error.type === 'FileNotSupported') {
          setError(`recipients.${index}.files`, {
            type: 'manual',
            message: fileValidation.error.data.message
          })
          return {
            isSuccess: false,
            error: {
              type: '',
              message: ''
            }
          }
        }
      } catch (err) {
        setError(`recipients.${index}.files`, {
          type: 'manual',
          message: 'Error uploading file'
        })
        return {
          isSuccess: false,
          error: {
            type: '',
            message: ''
          }
        }
      }
    }
    if (action === 'remove') {
      console.log('REMOVE FILE - LOGIC', file)
      const getRecipientFiles = getValues(`recipients.${index}.files`)
      console.log('getRecipientFiles', getRecipientFiles)
      const updatedFiles = getRecipientFiles.filter((item) => item.filename !== file.filename)
      setValue(`recipients.${index}.files`, updatedFiles)
      return {
        isSuccess: true
      }
    }
    return {
      isSuccess: false,
      error: {
        type: '',
        message: 'Unhandled error occurred'
      }
    }
  }

  return {
    resetPaymentForm,
    getValues,
    watch,
    setValue,
    formState,
    addRecipient,
    handleChangeInput,
    handleSelectContact,
    removeRecipient,
    handleChangeToken,
    handleOnClickFile,
    handleOnChangeSourceWallet,
    recipients: watch('recipients')
  }
}

export default usePaymentFormLogic
