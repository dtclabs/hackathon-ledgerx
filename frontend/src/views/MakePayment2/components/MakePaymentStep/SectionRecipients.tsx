/* eslint-disable react/no-array-index-key */
import { FC, useMemo, useState, useEffect, useRef } from 'react'
import { useAppSelector } from '@/state'
import { useFieldArray, useFormContext } from 'react-hook-form'
import Typography from '@/components-v2/atoms/Typography'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { groupedChartOfAccounts } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import useCheckBalance from '@/hooks-v2/useCheckBalance'
import { selectOrganizationPlanActive } from '@/slice/subscription/subscription-selectors'
import { InputActionMeta } from 'react-select'
import Button from '@/components-v2/atoms/Button'
import ErrorBanner from '../ErrorBanner'
import { PaymentLineItem } from '@/components-v2/molecules/PaymentLineItem'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { SourceOfRecipient } from '../../MakePaymentView'
import { findMatchingAddress } from '@/utils/isExistedRecipient'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'

interface IRecipientProps {
  selectedChain: {
    chainId: string
    blockchain: string
  }
  recipients: any
  onClickUploadCSV: () => void
  sourceWalletType: string
  onCreateRecipient: () => void
  onClickAddNewContact: (address: string, index: number) => void
  onClickImportDrafts?: () => void
  sectionTitle: string
}

const SectionRecipients: FC<IRecipientProps> = ({
  selectedChain,
  sectionTitle,
  onClickUploadCSV,
  recipients,
  sourceWalletType,
  onCreateRecipient,
  onClickAddNewContact,
  onClickImportDrafts
}) => {
  const { balance: tokenBalance, isLoading: isTokenBalanceLoading, error: isTokenBalanceError } = useCheckBalance()
  const isDraftTransactionsEnabled = useAppSelector((state) => selectFeatureState(state, 'isDraftTransactionsEnabled'))
  const isPlanExpired = useAppSelector(selectOrganizationPlanActive)
  const currentSelectedRecipient = useRef(null)
  const { control, getValues, setValue, watch, trigger, formState } = useFormContext()
  const [uniqueValidationErrorFields, setUniqueValidationErrorFields] = useState(new Set())
  const verifiedTokens = useAppSelector(selectVerifiedCryptocurrencies)
  const wallets = useAppSelector(walletsSelector)
  const chainIcons = useAppSelector(selectChainIcons)
  const chartOfAccounts = useAppSelector(groupedChartOfAccounts)
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
    if (formState?.errors?.recipients || formState?.errors?.sourceWallet?.type === 'check-multicurrency-for-eoa') {
      const newErrorFields = []
      Object.values(formState?.errors?.recipients || {}).forEach((recipientError) => {
        if (recipientError) {
          Object.keys(recipientError).forEach((recipientErrorField) => {
            newErrorFields.push(recipientErrorField)
          })
        }
      })
      if (formState?.errors?.sourceWallet?.type === 'check-multicurrency-for-eoa') {
        newErrorFields.push('sourceWallet')
      }
      setUniqueValidationErrorFields(new Set(newErrorFields))
    } else {
      setUniqueValidationErrorFields(new Set())
    }
  }, [formState?.errors?.recipients, formState.errors.sourceWallet])

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
    const ethToken = verifiedTokens?.find((token) => token.symbol === 'ETH')
    recipientAppend({
      walletAddress: null,
      amount: '',
      token: { value: '', label: 'ETH', src: ethToken?.image?.thumb || '/svg/ETH.svg', address: '' },
      files: [],
      note: '',
      chartOfAccounts: null,
      source: SourceOfRecipient.MANUAL
    })
  }

  function findFirstCoin(cryptocurrencies, selectedChainId) {
    for (let i = 0; i < cryptocurrencies.length; i++) {
      const currency = cryptocurrencies[i]
      for (let j = 0; j < currency.addresses.length; j++) {
        const address = currency.addresses[j]
        if (address.blockchainId === selectedChainId && address.type === 'Coin') {
          const coinInfo = currency.addresses.find((item) => item.type === 'Coin')
          return { ...currency, native: coinInfo }
        }
      }
    }
    return null // Return null if no matching cryptocurrency is found
  }
  const [triggerDownload] = useLazyDownloadTxFileQuery()
  const [triggerPreviewFile] = useLazyPreviewFileQuery()

  const handleDownloadFile = (file) => {
    if (file?.id) triggerDownload({ filename: file.name, key: file.id })
  }
  const handlePreviewFile = (file) => {
    if (file?.id) {
      triggerPreviewFile({ key: file.id, filename: file.name })
    } else {
      const fileURL = URL.createObjectURL(file)
      window.open(fileURL, '_blank')
    }
  }
  const handleCopyRecipientRow = (_index) => {
    const _recipients = getValues('recipients')
    const copiedRecipient = _recipients[_index]

    const selectedChainId = selectedChain?.blockchain
    const firstCoin = findFirstCoin(verifiedTokens, selectedChainId)

    recipientInsert(_index + 1, {
      walletAddress: copiedRecipient?.walletAddress ?? null,
      amount: copiedRecipient?.amount ?? '',
      token: copiedRecipient?.token ?? {
        value: firstCoin?.symbol,
        label: firstCoin?.symbol,
        src: firstCoin?.image?.thumb,
        type: firstCoin?.native?.type,
        address: firstCoin?.native?.address,
        decimal: firstCoin?.native?.decimal
      },
      files: copiedRecipient?.files ?? [],
      note: copiedRecipient?.note ?? '',
      chartOfAccounts: copiedRecipient?.chartOfAccounts ?? null,
      source: SourceOfRecipient.MANUAL // When a txn is copied, the copied line item will always be a fresh payment line item that will need to be added to DB
    })
    trigger(`recipients.${_index + 1}`)
  }

  const tokenOptions = useMemo(() => {
    const options = []

    if (verifiedTokens?.length > 0) {
      let updatedVerifiedTokens = verifiedTokens
      if (sourceWalletType === 'eth') {
        updatedVerifiedTokens = updatedVerifiedTokens.filter((token) => token.symbol !== 'USDT')
      }
      for (const token of updatedVerifiedTokens) {
        for (const address of token.addresses) {
          if (address.blockchainId === selectedChain.blockchain) {
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
  }, [verifiedTokens, sourceWalletType, selectedChain.blockchain])

  const recipientOptions = useMemo(() => {
    const options = []

    if (recipients?.length > 0) {
      for (const recipient of recipients) {
        for (const recipientAddress of recipient.recipientAddresses) {
          // if (selectedChain.blockchain === recipientAddress.blockchainId)
          options.push({
            value: recipientAddress.address,
            label: recipient.type === 'individual' ? recipient.contactName : recipient.organizationName,
            address: recipientAddress.address,
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
        for (const supportedBlockchain of wallet.supportedBlockchains) {
          // if (supportedBlockchain === selectedChain.blockchain) {
          options.push({
            value: wallet.address,
            label: wallet.name,
            address: wallet.address,
            src: chainIcons[supportedBlockchain],
            chainId: supportedBlockchain,
            supportedBlockchains: wallet.supportedBlockchains,
            metadata: {
              id: wallet.id,
              type: 'wallet'
            }
          })
          // }
        }
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
    setValue(`recipients.${_index}.source`, SourceOfRecipient.MANUAL)
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
                  (recipientObj) => recipientObj.address?.toLowerCase() === _value?.toLowerCase()
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
    sourceWallet:
      'Multi-currency is not supported when paying from an EOA wallet. All payments must be in the same currency.'
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
  return (
    <div className="w-full text-dashboard-main">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="subtitle1">
          {sectionTitle} ({payees?.length || 0})
        </Typography>
        <div className="flex items-center gap-3">
          <Button variant="grey" height={40} onClick={onClickUploadCSV} label="+ Add from CSV" />
          {isDraftTransactionsEnabled && !isPlanExpired && (
            <Button variant="grey" height={40} onClick={onClickImportDrafts} label="+ Add from Drafts" />
          )}
        </div>
      </div>
      {uniqueValidationErrorFields.size > 0 && (
        <ErrorBanner classNames="mt-4">
          <Typography variant="body2" classNames="!text-[#C61616]">
            We have found some error(s) in the below payments. Please resolve them to proceed.
          </Typography>
          <ul className="pl-6">
            {Array.from(uniqueValidationErrorFields).map((recipientErrorField, index) => (
              <li key={index} className="list-disc text-[#C61616]">
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
        {payees?.map((item, index) => (
          <PaymentLineItem
            index={index}
            errors={formState?.errors?.recipients?.[index]}
            disabled={item?.draftMetadata}
            accountOptions={parsedAvailableAccounts}
            contactOptions={recipientOptions}
            tokenOptions={tokenOptions}
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
            onDownloadFile={item?.draftMetadata && handleDownloadFile}
            account={item?.chartOfAccounts}
            contact={item?.walletAddress}
            token={item?.token}
            files={item?.files}
            amount={item?.amount}
            note={item?.note}
            draftStatus={item?.draftMetadata?.status}
            removeDisabled={false}
            onSaveContact={onClickAddNewContact}
            onCreateRecipient={onCreateRecipient}
            key={index}
            totalRecipients={payees?.length}
            onPreviewFile={handlePreviewFile}
          />
        ))}
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
