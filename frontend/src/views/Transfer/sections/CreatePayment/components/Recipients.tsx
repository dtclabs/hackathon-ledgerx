/* eslint-disable react/no-array-index-key */
import { useRouter } from 'next/router'
import { FC, useMemo, useState } from 'react'

import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { selectIsEoaTransfer } from '@/slice/transfer/transfer.selectors'
import { useAppSelector, useAppDispatch } from '@/state'
import { setIsEoaTransfer } from '@/slice/transfer/transfer.slice'
import useCreatePayment from '../../../hooks/useCreatePayment'
import { usePaymentFormLogic } from '../../../hooks/usePaymentForm'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { selectOrganizationPlanActive } from '@/slice/subscription/subscription-selectors'
import { selectChartOfAccountsMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { selectVerifiedCryptocurrencyIdMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { FormGlobalError } from '../../../components'
import { PaymentLineItem } from '@/components-v2/molecules/PaymentLineItemV3'
import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import ReactTooltip from 'react-tooltip'
import { PaymentLineItemV2 } from '@/components-v2/molecules/PaymentLineItemV2'
import { useCreateTagMutation, useDeleteTagMutation, useUpdateTagMutation } from '@/slice/tags/tags-api'
import { useOrganizationId } from '@/utils/getOrganizationId'

interface IPaymentRecipientProps {
  onClickUploadCSV?: () => void
  onCreateRecipient?: () => void
  onClickAddNewContact?: (address: string, index: number) => void
  onClickImportDrafts: () => void
}

const Recipients: FC<IPaymentRecipientProps> = ({
  onClickUploadCSV,
  onCreateRecipient,
  onClickAddNewContact,
  onClickImportDrafts
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [triggerPreviewFile] = useLazyPreviewFileQuery()
  const [triggerDownloadFile] = useLazyDownloadTxFileQuery()
  const isPlanExpired = useAppSelector(selectOrganizationPlanActive)
  const currencyMapById = useAppSelector(selectVerifiedCryptocurrencyIdMap)
  const chartOfAccountMap = useAppSelector(selectChartOfAccountsMap)
  const organizationId = useOrganizationId()
  const walletMapById = useAppSelector(selectWalletMapById)
  const isEoaTransfer = useAppSelector(selectIsEoaTransfer)

  // TODO - Where used?
  const [uniqueValidationErrorFields, setUniqueValidationErrorFields] = useState(new Set())
  const {
    getValues,
    setValue,
    formState,
    watch,
    addRecipient,
    removeRecipient,
    handleChangeInput,
    handleSelectContact,
    handleChangeToken,
    handleOnClickFile
  } = usePaymentFormLogic()
  const { tokenOptions, contactOptions, chartOfAccountsOptions, tagOptions } = useCreatePayment({
    selectedSourceId: watch('sourceWalletId')
  })

  const [createTag] = useCreateTagMutation()
  const [deleteTag] = useDeleteTagMutation()
  const [updateTag] = useUpdateTagMutation()

  const paymentStep = router.query?.step ?? 'create'

  const handleCopyRecipientRow = (_index) => {
    const clonedRecipient = { ...getValues('recipients')[_index] }
    clonedRecipient.draftMetadata = null
    const result = addRecipient(clonedRecipient)
    if (result.isSuccess === false) {
      // TODO - Handle Error
    }
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

  const onClickAddNewFile = (__file, _index, _action) =>
    handleOnClickFile({
      file: __file,
      index: _index,
      action: _action
    })

  const handleAddRecipientItem = () => {
    addRecipient()
  }

  const handleRemoveRecipientItem = (_index) => {
    removeRecipient(_index)
  }

  // TODO - Upgrade Inputs to seamlessly use hook control
  const onChangeToken = (_field) => (_token) => {
    handleChangeToken(_field, _token?.value)
  }

  // TODO - Upgrade Inputs to seamlessly use hook control
  const onChangeTextInput = (_field) => (_value) => {
    setValue(_field, _value)
  }
  // TODO - Upgrade Inputs to seamlessly use hook control
  const onChangeChartOfAccount = (_account, _index) => {
    setValue(`recipients.${_index}.chartOfAccountId`, _account.value)
  }

  const handlePreviewFile = (_uploadedFilename) => {
    triggerPreviewFile(_uploadedFilename)
  }
  const handleDownloadFile = (_uploadedFilename) => {
    triggerDownloadFile(_uploadedFilename)
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

  const tagsHandler = useMemo(
    () => ({
      options: tagOptions,
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
          {paymentStep === 'create' ? 'Add the payments you want to make' : 'Add the payments you want to make'} (
          {watch('recipients')?.length ?? 0})
        </Typography>
        <div className="flex items-center gap-3">
          <Button
            data-tip="import-csv-disabled"
            data-for="import-csv-disabled"
            variant="grey"
            height={40}
            onClick={onClickUploadCSV}
            disabled={!Object.keys(currencyMapById)?.length}
            label="+ Add from CSV"
          />
          {!Object.keys(currencyMapById)?.length && (
            <ReactTooltip
              id="import-csv-disabled"
              borderColor="#eaeaec"
              border
              place="bottom"
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              <Typography>Syncing cryptocurrency data</Typography>
            </ReactTooltip>
          )}
          {!isPlanExpired && (
            <>
              <Button
                data-tip="import-drafts-disabled"
                data-for="import-drafts-disabled"
                variant="grey"
                height={40}
                onClick={onClickImportDrafts}
                disabled={!Object.keys(currencyMapById)?.length}
                label="+ Add from Drafts"
              />
              {!Object.keys(currencyMapById)?.length && (
                <ReactTooltip
                  id="import-drafts-disabled"
                  borderColor="#eaeaec"
                  border
                  place="bottom"
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg"
                >
                  <Typography>Syncing cryptocurrency data</Typography>
                </ReactTooltip>
              )}
            </>
          )}
        </div>
      </div>
      {uniqueValidationErrorFields.size > 0 && (
        <FormGlobalError classNames="mt-4">
          <Typography variant="body2" classNames="!text-[#C61616]">
            We have found some error(s) in the below payments. Please resolve them to proceed.
          </Typography>
          <ul className="pl-6">
            {Array.from(uniqueValidationErrorFields).map((recipientErrorField: any, index) => (
              <li key={index} className="list-disc text-[#C61616]">
                <Typography variant="body2" classNames="!text-[#C61616]">
                  {`${errorMessageMap[recipientErrorField]}`}
                </Typography>
              </li>
            ))}
          </ul>
        </FormGlobalError>
      )}

      <div className="  rounded-2xl mt-5">
        {watch('recipients')?.map((item, index) => {
          const chartOfAccount = chartOfAccountMap[item?.chartOfAccountId]
          const chartOfAccountOption = {
            value: item?.chartOfAccountId ?? null,
            label: chartOfAccount
              ? `${chartOfAccount?.code ? `${chartOfAccount.code} - ` : ''} ${chartOfAccount?.name}`
              : 'No Account'
          }
          const sourceWallet = walletMapById[watch('sourceWalletId')]

          if (sourceWallet?.sourceType === 'eth' && watch('recipients').length === 1) {
            const previousToken = currencyMapById[watch('recipients')[0]?.tokenId]
            if (previousToken.symbol === 'USDT') {
              dispatch(setIsEoaTransfer(true))
            } else if (isEoaTransfer) {
              dispatch(setIsEoaTransfer(false))
            }
          }

          const token = currencyMapById[item?.tokenId]

          const tokenOption = {
            value: token?.publicId,
            label: token?.symbol,
            src: token?.image?.thumb
          }
          // TODO - Legacy stuff to remove should be a map or the PaymentLine select should just work like a normal one >.<
          const tempContact = contactOptions.find(
            (contact) => contact.value?.toLowerCase() === item?.walletAddress?.toLowerCase()
          )

          let result = null
          if (!tempContact && item?.walletAddress) {
            result = {
              address: item?.walletAddress,
              value: item?.walletAddress,
              label: item?.walletAddress,
              isUnknown: true,
              chainId: 'ethereum',
              metadata: null,
              src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/ethereum.png',
              supportedBlockchains: ['ethereum']
            }
          } else if (tempContact) {
            result = tempContact
          }

          return (
            <PaymentLineItemV2
              key={index}
              index={index}
              errors={formState?.errors?.recipients?.[index]}
              disabled={Boolean(item?.draftMetadata?.id && item?.draftMetadata?.isImported)}
              accountOptions={chartOfAccountsOptions}
              contactOptions={contactOptions}
              tokenOptions={tokenOptions}
              onCopyItem={handleCopyRecipientRow}
              onRemoveItem={handleRemoveRecipientItem}
              onInputChange={handleChangeInput}
              onContactChange={handleSelectContact}
              onTokenChange={onChangeToken(`recipients.${index}.tokenId`)}
              onAmountChange={onChangeTextInput(`recipients.${index}.amount`)}
              onAccountChange={onChangeChartOfAccount}
              onNoteChange={onChangeTextInput(`recipients.${index}.note`)}
              onFileChange={onClickAddNewFile}
              account={chartOfAccountOption}
              contact={result}
              token={tokenOption}
              files={item?.files}
              isAddRecipientDisabled={isEoaTransfer}
              amount={item?.amount}
              note={item?.note}
              draftStatus={item?.draftMetadata?.status}
              removeDisabled={false}
              onSaveContact={onClickAddNewContact}
              onCreateRecipient={onCreateRecipient}
              onPreviewFile={handlePreviewFile}
              onDownloadFile={handleDownloadFile}
              totalRecipients={watch('recipients')?.length}
              annotations={item?.annotations}
              tagsHandler={tagsHandler}
            />
          )
        })}
        <div className="flex gap-4 pl-8 pt-2 items-center">
          <button
            type="button"
            data-tip="usdt-disabled-btn"
            data-for="usdt-disabled-btn"
            disabled={isEoaTransfer}
            onClick={handleAddRecipientItem}
            className="font-inter text-dashboard-main font-medium text-xs text-right px-3 py-[7px] border border-dashboard-border-200 rounded"
          >
            + Add another payment
          </button>
          {isEoaTransfer && (
            <ReactTooltip
              id="usdt-disabled-btn"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="right"
              className="!opacity-100 !rounded-lg !text-xs"
            >
              USDT transfers using an EOA wallet can only be done one at a time. To perform a batch transfer with USDT,
              please use a Safe wallet.
            </ReactTooltip>
          )}
        </div>
      </div>
    </div>
  )
}
export default Recipients
