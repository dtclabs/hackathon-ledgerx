/* eslint-disable react/no-array-index-key */
import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { PaymentLineItem } from '@/components-v2/molecules/PaymentLineItem'
import { PaymentLineItemV2 } from '@/components-v2/molecules/PaymentLineItemV2'
import useCheckBalance from '@/hooks-v2/useCheckBalance'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { groupedChartOfAccounts } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { ITag } from '@/slice/tags/tag-type'
import { useCreateTagMutation, useDeleteTagMutation, useUpdateTagMutation } from '@/slice/tags/tags-api'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { findMatchingAddress } from '@/utils/isExistedRecipient'
import ErrorBanner from '@/views/MakePayment2/components/ErrorBanner'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { InputActionMeta } from 'react-select'
import { toast } from 'react-toastify'

interface IRecipientProps {
  selectedChain: {
    chainId: string
    blockchain: string
  }
  recipients: any
  onClickUploadCSV: () => void
  sourceWalletType?: string // Make it optional for create drafts page
  onCreateRecipient: () => void
  onClickAddNewContact: (address: string, index: number) => void
  sectionTitle: string
  tagOptions?: ITag[]
}

const SectionRecipients: FC<IRecipientProps> = ({
  tagOptions,
  selectedChain,
  recipients,
  sectionTitle,
  onClickUploadCSV,
  sourceWalletType,
  onCreateRecipient,
  onClickAddNewContact
}) => {
  const organizationId = useOrganizationId()
  const { balance: tokenBalance, isLoading: isTokenBalanceLoading, error: isTokenBalanceError } = useCheckBalance()
  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))

  const [createTag, createTagRes] = useCreateTagMutation()
  const [deleteTag] = useDeleteTagMutation()
  const [updateTag, updateTagRes] = useUpdateTagMutation()

  const currentSelectedRecipient = useRef(null)
  const { control, getValues, setValue, watch, trigger, formState } = useFormContext()
  const [uniqueValidationErrorFields, setUniqueValidationErrorFields] = useState(new Set())
  const verifiedTokens = useAppSelector(selectVerifiedCryptocurrencies)
  const wallets = useAppSelector(walletsSelector)
  const chainIcons = useAppSelector(selectChainIcons)
  const chartOfAccounts = useAppSelector(groupedChartOfAccounts)
  const [triggerPreviewFile] = useLazyPreviewFileQuery()
  const [triggerDownloadFile] = useLazyDownloadTxFileQuery()

  const [walletBalance, setWalletBalance] = useState({
    recipientId: '',
    balance: ''
  })
  const [inputValue, setInputValue] = useState<{ [index: number]: string }>({})
  const payees = watch('recipients') ?? []

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
    if (formState?.errors?.recipients) {
      const newErrorFields = []
      Object.values(formState.errors.recipients).forEach((recipientError) => {
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
  }, [formState?.errors?.recipients])

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

  const parsedAvailableAccounts = useMemo(
    () => [
      {
        value: null,
        label: 'No Account'
      },
      ...chartOfAccounts
    ],
    [chartOfAccounts]
  )

  const {
    append: recipientAppend,
    remove: recipientRemove,
    insert: recipientInsert
  } = useFieldArray<any>({
    control,
    name: 'recipients',
    keyName: 'id'
  })

  const onChangeToken = (_field) => (_token) => {
    setValue(_field, _token)
  }

  const handleAddRecipient = () => {
    // Note: Removed logic of limiting the max number of recipients based on plan

    recipientAppend({
      walletAddress: null,
      amount: '',
      token: { value: '', label: 'ETH', src: '/svg/ETH.svg', address: '' },
      files: [],
      note: '',
      chartOfAccounts: null
    })
  }

  const handleCopyRecipientRow = (_index) => {
    const _recipients = getValues('recipients')
    const copiedRecipient = _recipients[_index]

    recipientInsert(_index + 1, {
      walletAddress: copiedRecipient?.walletAddress ?? null,
      amount: copiedRecipient?.amount ?? '',
      token: copiedRecipient?.token ?? { value: '', label: 'ETH', src: '/svg/ETH.svg', address: '' },
      files: copiedRecipient?.files ?? [],
      note: copiedRecipient?.note ?? '',
      annotations: copiedRecipient?.annotations ?? [],
      chartOfAccounts: copiedRecipient?.chartOfAccounts ?? null
    })
    trigger(`recipients.${_index + 1}`)
  }

  const tokenOptions = useMemo(() => {
    const options = []
    if (verifiedTokens?.length > 0) {
      const updatedVerifiedTokens = verifiedTokens
      // if (sourceWalletType === 'eth') {
      //   updatedVerifiedTokens = updatedVerifiedTokens.filter((token) => token.symbol !== 'USDT')
      // }
      for (const token of updatedVerifiedTokens) {
        for (const address of token.addresses) {
          if (address.blockchainId === selectedChain.blockchain && address?.address?.toLowerCase()) {
            options.push({
              value: token.publicId,
              label: token.symbol,
              src: token.image?.small,
              address
            })
          }
        }
      }
    }
    return options
  }, [verifiedTokens, sourceWalletType])

  const recipientOptions = useMemo(() => {
    const options = []

    if (recipients?.length > 0) {
      for (const recipient of recipients) {
        for (const recipientAddress of recipient.recipientAddresses) {
          options.push({
            value: recipientAddress.address.toLowerCase(),
            label: recipient.type === 'individual' ? recipient.contactName : recipient.organizationName,
            address: recipientAddress.address.toLowerCase(),
            src: chainIcons[recipientAddress.blockchainId],
            chainId: recipientAddress.blockchainId,
            supportedBlockchains: [recipientAddress.blockchainId],
            metadata: {
              id: recipientAddress.publicId,
              type: 'recipient_address' // TODO-DRAFT - Change this to a constant for consistency
            },
            isUnknown: (recipient.contactName || recipient.organizationName) ?? false
          })
        }
      }
    }

    if (wallets?.length > 0) {
      for (const wallet of wallets) {
        options.push({
          value: wallet.address.toLowerCase(),
          label: wallet.name,
          address: wallet.address.toLowerCase(),
          src: chainIcons[selectedChain.blockchain],
          chainId: selectedChain.blockchain,
          supportedBlockchains: wallet.supportedBlockchains,
          metadata: {
            id: wallet.id,
            type: 'wallet'
          }
        })
      }
    }
    return options
  }, [recipients, wallets, selectedChain])

  // CHARMANDER - Because the components are shite need to set these manually
  const onChangeTextInout = (_field) => (_value) => {
    setValue(_field, _value)
  }
  // CHARMANDER - Because the components are shite need to set these manually
  const onChangeChartOfAccount = (_field) => (_value) => {
    setValue(_field, _value)
  }

  const handleChangeInput = (_value, _action, _index) => {
    if (_action.action === 'input-change') {
      setInputValue({
        ...inputValue,
        [_index]: _value
      })
      if (_value) {
        const isAddressPartOfRecipients = findMatchingAddress(recipients, _value)
        const isAddressPartOfWallets = wallets.find((wallet) => wallet.address.toLowerCase() === _value.toLowerCase())

        if (isAddressPartOfRecipients || isAddressPartOfWallets) {
          if (isAddressPartOfRecipients) {
            const { recipient } = isAddressPartOfRecipients
            setValue(`recipients.${_index}.walletAddress`, {
              address: _value,
              value: _value,
              label: recipient?.organizationName || recipient?.contactName,
              chainId: selectedChain?.blockchain,
              supportedBlockchains: [selectedChain?.blockchain],
              isUnknown: false,
              metadata: {
                id: recipient.recipientAddresses.find(
                  (recipientObj) => recipientObj.address?.toLowerCase() === _value.toLowerCase()
                )?.publicId,
                type: 'recipient_address'
              }
            })
          } else if (isAddressPartOfWallets) {
            setValue(`recipients.${_index}.walletAddress`, {
              address: _value,
              value: _value,
              label: isAddressPartOfWallets?.name,
              chainId: selectedChain?.blockchain,
              supportedBlockchains: [selectedChain?.blockchain],
              isUnknown: false,
              metadata: {
                id: isAddressPartOfWallets.id,
                type: 'wallet'
              }
            })
          }
        } else {
          setValue(`recipients.${_index}.walletAddress`, {
            address: _value,
            value: _value,
            label: '',
            chainId: selectedChain?.blockchain,
            supportedBlockchains: [selectedChain?.blockchain],
            isUnknown: true,
            metadata: null
          })
        }
      } else {
        setValue(`recipients.${_index}.walletAddress`, null)
      }
    } else if (_action.action === 'set-value') {
      setInputValue({
        ...inputValue,
        [_index]: ''
      })
    }
  }

  const handleRemoveRecipient = (_index) => {
    setInputValue({
      ...inputValue,
      [_index]: ''
    })
    recipientRemove(_index)
  }

  const errorMessageMap = {
    amount: 'Amount is missing/invalid in some of the payments. Please add a valid amount to all the payments.',
    walletAddress:
      'Recipient address is missing/invalid in some of the payments. Please add a valid recipient to all the payments.',
    token: 'Currency is invalid in some of the payments. Please select a valid currency for all the payments.',
    files: 'Payments must not have more than 10 files attached, please edit the number of files on your payments.',
    s3Files: 'File uploaded failed.'
  }

  const onClickAddNewFile = (__file, _index, _action) => {
    if (_action === 'add') {
      const getCurrentFiles = getValues(`recipients.${_index}.files`) ?? []
      setValue(`recipients.${_index}.files`, [...getCurrentFiles, __file])
    } else if (_action === 'remove') {
      const getCurrentFiles = getValues(`recipients.${_index}.files`) ?? []
      setValue(
        `recipients.${_index}.files`,
        getCurrentFiles.filter((file) => file.name !== __file.name)
      )
    }
  }

  const onAttachTag = (_value, _index) => {
    const getCurrentTags = getValues(`recipients.${_index}.annotations`) ?? []

    setValue(`recipients.${_index}.annotations`, [...getCurrentTags, _value])
  }
  const onDeleteTag = (_value, _index) => {
    const getCurrentTags = getValues(`recipients.${_index}.annotations`) ?? []

    setValue(
      `recipients.${_index}.annotations`,
      getCurrentTags.filter((_tag) => _tag.value !== _value.value)
    )
  }

  const handlePreviewFile = (file) => {
    if (file?.id) {
      triggerPreviewFile({ key: file.id, filename: file.name })
    } else {
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
    }
  }
  const handleDownloadFile = (file) => {
    if (file?.id) {
      triggerDownloadFile({ key: file.id, filename: file.name })
    } else {
      const fileURL = URL.createObjectURL(file)
      const hiddenElement = document.createElement('a')
      hiddenElement.href = fileURL
      hiddenElement.target = '_blank'
      hiddenElement.download = file.name
      hiddenElement.click()
    }
  }

  const tagsHandler = useMemo(
    () => ({
      options: tagOptions?.map((_tag) => ({ value: _tag.id, label: _tag.name })) || [],
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
    [tagOptions]
  )

  return (
    <div className="w-full text-dashboard-main">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="subtitle1">
          {sectionTitle} ({payees?.length || 0})
        </Typography>
        <div className="flex">
          <Button variant="grey" height={40} onClick={onClickUploadCSV} label="+ Add from CSV" />
        </div>
      </div>
      {uniqueValidationErrorFields.size > 0 && (
        <ErrorBanner classNames="mt-4">
          <Typography variant="body2" classNames="!text-[#C61616]">
            We have found some error(s) in the below payments. Please resolve them to proceed.
          </Typography>
          <ul className="pl-6">
            {Array.from(uniqueValidationErrorFields).map((recipientErrorField) => (
              <li className="list-disc text-[#C61616]">
                <Typography variant="body2" classNames="!text-[#C61616]">
                  {/* @ts-ignore */}
                  {`${errorMessageMap[recipientErrorField]}`}
                </Typography>
              </li>
            ))}
          </ul>
        </ErrorBanner>
      )}
      <div className="  rounded-2xl mt-5">
        {payees?.map((item, index) =>
          isAnnotationEnabled ? (
            <PaymentLineItemV2
              index={index}
              accountOptions={parsedAvailableAccounts}
              contactOptions={recipientOptions}
              tokenOptions={tokenOptions}
              errors={formState?.errors?.recipients?.[index]}
              onCopyItem={handleCopyRecipientRow}
              onRemoveItem={() => handleRemoveRecipient(index)}
              onInputChange={(value: string, action: InputActionMeta) => handleChangeInput(value, action, index)}
              onContactChange={(_contact) =>
                setValue(`recipients.${index}.walletAddress`, { ..._contact, isUnknown: false })
              }
              onTokenChange={onChangeToken(`recipients.${index}.token`)}
              onAmountChange={onChangeTextInout(`recipients.${index}.amount`)}
              onAccountChange={onChangeChartOfAccount(`recipients.${index}.chartOfAccounts`)}
              onNoteChange={onChangeTextInout(`recipients.${index}.note`)}
              onFileChange={onClickAddNewFile}
              account={item?.chartOfAccounts}
              contact={item?.walletAddress}
              token={item?.token}
              files={item?.files}
              annotations={item?.annotations}
              amount={item?.amount}
              note={item?.note}
              removeDisabled={false}
              onSaveContact={onClickAddNewContact}
              onCreateRecipient={onCreateRecipient}
              key={index}
              totalRecipients={payees?.length}
              tagsHandler={tagsHandler}
              onPreviewFile={handlePreviewFile}
              onDownloadFile={handleDownloadFile}
            />
          ) : (
            <PaymentLineItem
              index={index}
              accountOptions={parsedAvailableAccounts}
              contactOptions={recipientOptions}
              tokenOptions={tokenOptions}
              errors={formState?.errors?.recipients?.[index]}
              onCopyItem={handleCopyRecipientRow}
              onRemoveItem={() => handleRemoveRecipient(index)}
              onInputChange={(value: string, action: InputActionMeta) => handleChangeInput(value, action, index)}
              onContactChange={(_contact) =>
                setValue(`recipients.${index}.walletAddress`, { ..._contact, isUnknown: false })
              }
              onTokenChange={onChangeToken(`recipients.${index}.token`)}
              onAmountChange={onChangeTextInout(`recipients.${index}.amount`)}
              onAccountChange={onChangeChartOfAccount(`recipients.${index}.chartOfAccounts`)}
              onNoteChange={onChangeTextInout(`recipients.${index}.note`)}
              onFileChange={onClickAddNewFile}
              account={item?.chartOfAccounts}
              contact={item?.walletAddress}
              token={item?.token}
              files={item?.files}
              amount={item?.amount}
              note={item?.note}
              removeDisabled={false}
              onSaveContact={onClickAddNewContact}
              onCreateRecipient={onCreateRecipient}
              key={index}
              totalRecipients={payees?.length}
              onPreviewFile={handlePreviewFile}
            />
          )
        )}
        <div className="flex gap-4 pl-8 pt-2 items-center">
          <button
            type="button"
            onClick={handleAddRecipient}
            className="font-inter text-dashboard-main font-medium text-xs text-right px-3 py-[7px] border border-dashboard-border-200 rounded"
          >
            + Add another payment
          </button>
        </div>
      </div>
    </div>
  )
}
export default SectionRecipients
