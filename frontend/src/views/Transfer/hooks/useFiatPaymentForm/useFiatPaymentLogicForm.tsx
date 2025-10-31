/* eslint-disable no-param-reassign */
// Libraries
import { useWeb3React } from '@web3-react/core'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

// Utilities
import { useAppSelector } from '@/state'

// Types
import { IMakePaymentForm, IRecipientItemForm } from '../../Transfer.types'

// Selectors
import {
  selectTokenFiatPriceMap,
  selectVerifiedCryptocurrencyMap
} from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'

import { selectReviewData } from '@/slice/transfer/transfer.selectors'
import { selectWalletMapByAddress, selectWalletMapById } from '@/slice/wallets/wallet-selectors'

// import { resetTokenApprovals } from '@/slice/transfer/trasnfer.slice'
import { useUploadTxFileMutation } from '@/api-v2/old-tx-api'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'

import { SourceType } from '@/slice/wallets/wallet-types'

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

export const useFiatPaymentLogicForm = () => {
  const { account } = useWeb3React()

  const reviewData = useAppSelector(selectReviewData)
  const selectedChain = useAppSelector(selectedChainSelector)
  const walletMap = useAppSelector(selectWalletMapByAddress)
  const walletMapId = useAppSelector(selectWalletMapById)
  const organizationSettings = useAppSelector(orgSettingsSelector)
  const tokenFiatPriceMap = useAppSelector(selectTokenFiatPriceMap)
  const verifiedCryptocurrencyMap: any = useAppSelector(selectVerifiedCryptocurrencyMap)

  const isInitialized = useRef(false)
  const prevSelectedChainIdRef = useRef(selectedChain?.id)

  const [triggerUploadFile, uploadFileResponse] = useUploadTxFileMutation()
  const [triggerTokenPriceQuery] = useLazyGetTokenPriceQuery()
  const { setError, setValue, watch, getValues, reset, formState, control } = useFormContext<IMakePaymentForm>()

  const { append: appendRecipient, remove: handleRemoveRecipient } = useFieldArray({
    control,
    name: 'recipients' // Name of the field array
  })

  useEffect(() => {
    if (account && !isInitialized.current) {
      const wallet = walletMap[account?.toLowerCase()]
      if (wallet) {
        isInitialized.current = true
        setValue('sourceWalletId', wallet.id)
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

  useEffect(() => {
    // To prevent re-rendering on every change - higher level components causing re-renders
    const prevSelectedChainId = prevSelectedChainIdRef.current
    const currentSelectedChainId = selectedChain?.id

    if (prevSelectedChainId !== currentSelectedChainId) {
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
          bankAccount: null,
          files: [],
          amount: '',
          tokenId: organizationSettings?.fiatCurrency?.code || 'USD',
          chartOfAccountId: null,
          note: '',
          purposeOfTransfer: ''
        }
      ],
      sourceWalletId: watch('sourceWalletId') ?? null
    })
  }

  const removeRecipient = (index: number) => {
    handleRemoveRecipient(index)
  }

  const addRecipient = (_recipient = {}): Result<null, AddRecipientErrorTypes> => {
    try {
      const emptyRecipient: IRecipientItemForm = {
        bankAccount: null,
        files: [],
        amount: '',
        tokenId: organizationSettings?.fiatCurrency?.code || 'USD',
        chartOfAccountId: null,
        note: '',
        walletId: null,
        isUnknown: false,
        metadata: null,
        draftMetadata: null
      }
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
      const recipients = getValues('recipients')
      const lastRecipient = recipients[recipients.length - 1]
      if (!lastRecipient.amount && !lastRecipient.bankAccount) {
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

  const handleCopyRecipientRow = (_index) => {
    const clonedRecipient = { ...getValues('recipients')[_index] }
    clonedRecipient.draftMetadata = null
    const result = addRecipient(clonedRecipient)
    if (result.isSuccess === false) {
      // TODO - Handle Error
    }
  }

  const handleSelectContact = (_contact, _index) => {
    setValue(`recipients.${_index}.bankAccount`, { ..._contact, isUnknown: false })
    setValue(`recipients.${_index}.tokenId`, _contact.currencyCode)
  }

  useEffect(() => {
    const getFiatPrices = async () => {
      const sourceCryptocurrencyId = verifiedCryptocurrencyMap?.usdc?.publicId
      const defaultFatCurrency = organizationSettings?.fiatCurrency?.code

      if (defaultFatCurrency && tokenFiatPriceMap[sourceCryptocurrencyId]?.[defaultFatCurrency]) {
        await triggerTokenPriceQuery({
          params: {
            cryptocurrencyId: sourceCryptocurrencyId,
            date: format(new Date(), 'yyyy-MM-dd'),
            fiatCurrency: defaultFatCurrency ?? 'USD'
          }
        }).unwrap()
      }
      if (reviewData) {
        const { recipients } = reviewData

        for (const recipient of recipients) {
          const fiatCurrency = recipient.tokenId
          if (!tokenFiatPriceMap[sourceCryptocurrencyId]?.fiatCurrency)
            await triggerTokenPriceQuery({
              params: {
                cryptocurrencyId: sourceCryptocurrencyId,
                fiatCurrency,
                date: format(new Date(), 'yyyy-MM-dd')
              }
            }).unwrap()
        }
      }
    }

    getFiatPrices()
  }, [])

  const handleChangeToken = (_field, _value) => {
    const sourceCryptocurrencyId = verifiedCryptocurrencyMap?.usdc?.publicId

    if (!tokenFiatPriceMap[sourceCryptocurrencyId]?.[_value]) {
      triggerTokenPriceQuery({
        params: {
          cryptocurrencyId: sourceCryptocurrencyId,
          date: format(new Date(), 'yyyy-MM-dd'),
          fiatCurrency: _value ?? 'USD'
        }
      })
    }
    setValue(_field, _value)
  }

  const handleOnChangeSourceWallet = async ({
    id: _newSourceWalletId
  }): Promise<Result<{ sourceWalletId: string }, ChangeSourceErrorTypes>> => {
    try {
      if (!walletMapId[_newSourceWalletId] || !walletMapId[_newSourceWalletId].id) {
        return {
          isSuccess: false,
          error: {
            type: 'NoSourceFound'
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

  const handleOnClickFile = async (file, index, action) => {
    if (action === 'add') {
      try {
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
      const getRecipientFiles = getValues(`recipients.${index}.files`)
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
    removeRecipient,
    handleChangeToken,
    handleOnClickFile,
    handleOnChangeSourceWallet,
    handleCopyRecipientRow,
    handleSelectContact
  }
}

export default useFiatPaymentLogicForm
