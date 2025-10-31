/* eslint-disable react/no-array-index-key */
import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { selectChartOfAccountsMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { selectOrganizationPlanActive } from '@/slice/subscription/subscription-selectors'
import { useCreateTagMutation, useDeleteTagMutation, useUpdateTagMutation } from '@/slice/tags/tags-api'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import FiatPaymentLineItem from '@/views/CreateDraftPayment/FiatPayment/FiatPaymentLineItem'
import { getCurrencyImage } from '@/views/CreateDraftPayment/hooks/useDraftForm/useDraftForm'
import useCreatePayment from '@/views/Transfer/hooks/useCreatePayment'
import useFiatPaymentLogicForm from '@/views/Transfer/hooks/useFiatPaymentForm/useFiatPaymentLogicForm'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'
import ReactTooltip from 'react-tooltip'

interface IPaymentRecipientProps {
  bankAccountOptions: any[]
  bankAccountLoading: boolean
  onClickImportDrafts: () => void
}

const Recipients: FC<IPaymentRecipientProps> = ({ bankAccountLoading, bankAccountOptions, onClickImportDrafts }) => {
  const router = useRouter()
  const isPlanExpired = useAppSelector(selectOrganizationPlanActive)
  const chartOfAccountMap = useAppSelector(selectChartOfAccountsMap)
  const organizationId = useOrganizationId()

  const {
    getValues,
    setValue,
    formState,
    watch,
    addRecipient,
    handleCopyRecipientRow,
    removeRecipient,
    handleChangeToken,
    handleOnClickFile,
    handleSelectContact
  } = useFiatPaymentLogicForm()

  const { chartOfAccountsOptions, currenciesOptions, purposeOfTransferOptions, tagOptions } = useCreatePayment({
    selectedSourceId: watch('sourceWalletId')
  })

  const [triggerPreviewFile] = useLazyPreviewFileQuery()
  const [triggerDownloadFile] = useLazyDownloadTxFileQuery()

  const [createTag, createTagRes] = useCreateTagMutation()
  const [deleteTag] = useDeleteTagMutation()
  const [updateTag, updateTagRes] = useUpdateTagMutation()

  const handlePreviewFile = (_uploadedFilename) => {
    triggerPreviewFile(_uploadedFilename)
  }
  const handleDownloadFile = (_uploadedFilename) => {
    triggerDownloadFile(_uploadedFilename)
  }
  const onChangeToken = (_field) => (_token) => {
    handleChangeToken(_field, _token?.value)
  }
  const onChangeTextInput = (_field) => (_value) => {
    setValue(_field, _value)
  }
  const onChangeChartOfAccount = (_account, _index) => {
    setValue(`recipients.${_index}.chartOfAccountId`, _account.value)
  }
  const onChangePurposeOfTransfer = (_purposeOfTransfer, _index) => {
    setValue(`recipients.${_index}.purposeOfTransfer`, _purposeOfTransfer.value)
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

  const handleCreateRecipient = () => {
    router.push(`/${organizationId}/contacts/create/individual`)
  }

  return (
    <div className="w-full text-dashboard-main">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="subtitle1">Add the payments you want to make</Typography>
        <div className="flex items-center gap-3">
          {!isPlanExpired && (
            <>
              <Button
                variant="grey"
                data-tip="import-drafts-disabled"
                data-for="import-drafts-disabled"
                height={40}
                onClick={onClickImportDrafts}
                label="+ Add from Drafts"
                disabled={!currenciesOptions?.length}
              />
              {!currenciesOptions?.length && (
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
                  <Typography>Some currency data is loading</Typography>
                </ReactTooltip>
              )}
            </>
          )}
        </div>
      </div>
      {/* {uniqueValidationErrorFields.size > 0 && (
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
      )} */}

      <div className="w-full text-dashboard-main mt-5">
        {watch('recipients')?.map((item, index) => {
          const tokenOption = currenciesOptions.find((token) => token.value === item?.tokenId)

          const chartOfAccount = chartOfAccountMap[item?.chartOfAccountId]
          const chartOfAccountOption = {
            value: item?.chartOfAccountId ?? null,
            label: chartOfAccount
              ? `${chartOfAccount?.code ? `${chartOfAccount.code} - ` : ''} ${chartOfAccount?.name}`
              : 'No Account'
          }

          const purposeOfTransfer =
            purposeOfTransferOptions?.find((purpose) => purpose.value === item?.purposeOfTransfer)?.value ?? ''
          return (
            <FiatPaymentLineItem
              disabled={Boolean(item?.draftMetadata?.id && item?.draftMetadata?.isImported)}
              index={index}
              key={index}
              isLoading={bankAccountLoading}
              token={tokenOption || { value: 'SGD', label: 'SGD', src: getCurrencyImage('SGD') }}
              files={item?.files}
              annotations={item?.annotations}
              amount={item?.amount}
              note={item?.note}
              removeDisabled={false}
              purposeOfTransferOptions={purposeOfTransferOptions}
              accountOptions={chartOfAccountsOptions}
              contactOptions={bankAccountOptions}
              tokenOptions={currenciesOptions}
              errors={formState.errors?.recipients?.[index]}
              onCopyItem={handleCopyRecipientRow}
              onRemoveItem={removeRecipient}
              onContactChange={handleSelectContact}
              onTokenChange={onChangeToken(`recipients.${index}.tokenId`)}
              onAmountChange={onChangeTextInput(`recipients.${index}.amount`)}
              onAccountChange={onChangeChartOfAccount}
              onPurposeTransferChange={onChangePurposeOfTransfer}
              onNoteChange={onChangeTextInput(`recipients.${index}.note`)}
              onFileChange={handleOnClickFile}
              account={chartOfAccountOption}
              purposeTransfer={purposeOfTransfer}
              contact={item?.bankAccount}
              totalRecipients={watch('recipients')?.length}
              onCreateRecipient={handleCreateRecipient}
              tagsHandler={tagsHandler}
              onDownloadFile={handleDownloadFile}
              onPreviewFile={handlePreviewFile}
              draftStatus={item?.draftMetadata?.status}
            />
          )
        })}
        <div className="flex gap-4 pl-8 pt-2 items-center">
          <button
            type="button"
            onClick={() => {
              addRecipient()
            }}
            className="font-inter text-dashboard-main font-medium text-xs text-right px-3 py-[7px] border border-dashboard-border-200 rounded"
          >
            + Add another payment
          </button>
        </div>
      </div>
    </div>
  )
}
export default Recipients
