import { FormField } from '@/components-v2/FormField'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import SelectCustom from '@/components/SelectItem/SelectCustom'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import TextField from '@/components/TextField/TextField'
import CopyIcon from '@/public/svg/action-icon/copy-light.svg'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import ErrorIcon from '@/public/svg/light-warning-icon.svg'
import MenuSelectRecipient from '@/views/MakePayment/components/custom-dropdown/MenuSelectRecipient'
import RecipientDropdownLabel from '@/views/MakePayment/components/custom-dropdown/RecipientDropdownLabel'
import MenuCategory from '@/views/TransferApp/components/ReactSelectComponents/MenuCategory'
import Image from 'next/legacy/image'
import React, { useMemo, useState } from 'react'
import { InputActionMeta } from 'react-select'
import ReactTooltip from 'react-tooltip'
import PaymentContactSingleValue from '../PaymentLineItem/PaymentContactSingleValue'
import { paymentAccountStyle, paymentContactStyle } from '../PaymentLineItem/PaymentLineItem.style'
import { TagManagementPopup } from '../TagManagementPopup'
import TagItem from '../TagManagementPopup/TagItem'
import PaymentFileUpload from './PaymentFileUploadV2/PaymentFileUploadV2'
import { IPaymentLineItem } from './PaymentLineItem.type'
import { useAppSelector } from '@/state'
import { selectChainIcons } from '@/slice/chains/chain-selectors'

const PaymentLineItemV2: React.FC<IPaymentLineItem> = ({
  index,
  errors,
  disabled,
  contact,
  token,
  amount,
  account,
  note,
  files,
  annotations,
  draftStatus,
  removeDisabled,
  accountOptions,
  contactOptions,
  tokenOptions,
  onAccountChange,
  onAmountChange,
  onContactChange,
  onNoteChange,
  onFileChange,
  onPreviewFile,
  onDownloadFile,
  onTokenChange,
  onSaveContact,
  onInputChange,
  onCopyItem,
  onRemoveItem,
  onCreateRecipient,
  totalRecipients,
  tagsHandler
}) => {
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const chainIcons = useAppSelector(selectChainIcons)


  const handleManualOpen = () => {
    if (!disabled) setIsContactMenuOpen(!isContactMenuOpen)
  }
  const renderTagsButton = (onClick) => (
    <Button
      onClick={onClick}
      type="button"
      disabled={disabled}
      leadingIcon={<Image src={AddIcon} alt="add-icon" height={20} width={20} />}
      variant="grey"
      height={40}
      classNames="disabled:bg-[#F2F4F7]"
    />
  )

  const tagsSelection = useMemo(
    () => (
      <div className="flex items-center w-full border-grey-200 border rounded">
        <div
          data-tip={`tags-payment-${index}`}
          data-for={`tags-payment-${index}`}
          className="h-10 w-full px-4 flex items-center cursor-default"
        >
          <Typography styleVariant="medium">{`${annotations?.length || 0} ${
            annotations?.length > 1 ? 'tags' : 'tag'
          }`}</Typography>
        </div>
        <TagManagementPopup
          options={tagsHandler.options}
          tags={annotations || []}
          onChange={(_tag) => {
            tagsHandler.onAttachAnnotation(_tag, index)
          }}
          onClear={(_tag) => {
            tagsHandler.onDeleteAnnotation(_tag, index)
          }}
          onCreate={(_tagName) => {
            tagsHandler.onCreate(_tagName, index)
          }}
          onDelete={tagsHandler.onDelete}
          onEdit={tagsHandler.onUpdate}
          triggerButton={renderTagsButton}
        />
        {annotations?.length > 0 && (
          <ReactTooltip
            id={`tags-payment-${index}`}
            borderColor="#eaeaec"
            border
            delayHide={500}
            delayShow={250}
            delayUpdate={500}
            place="bottom"
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg max-w-[220px] !px-3"
          >
            <div className="flex flex-wrap gap-2">
              {annotations?.map((tag) => (
                <TagItem
                  key={tag.value}
                  tag={tag}
                  clearable={!disabled}
                  onClear={(_tag) => {
                    tagsHandler.onDeleteAnnotation(_tag, index)
                  }}
                />
              ))}
            </div>
          </ReactTooltip>
        )}
      </div>
    ),
    [annotations, tagsHandler?.options, disabled]
  )

  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col gap-2">
        <Typography variant="subtitle2" classNames={`${index !== 0 ? 'mt-6' : 'mt-1'}`}>
          {index + 1}.
        </Typography>
        <Button
          variant="transparent"
          classNames="!border-0 px-1 py-1"
          height={24}
          trailingIcon={<Image src={CopyIcon} width={16} height={16} alt="copy-icon" />}
          onClick={() => onCopyItem(index)}
        />
        <Button
          variant="transparent"
          classNames="!border-0 px-1 py-1"
          disabled={removeDisabled || totalRecipients === 1}
          height={24}
          trailingIcon={<Image src={DeleteIcon} alt="document" width={16} height={16} />}
          onClick={() => onRemoveItem(index)}
        />
      </div>
      <div
        className={`bg-[#F9FAFB] rounded-lg border border-neutral-100 w-full p-4 mb-2 ${
          index !== 0 ? 'pt-5 mt-5' : ''
        }`}
      >
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-row gap-3">
            {/* Contact section */}
            <div className="basis-1/2">
              <FormField label="Recipient" isRequired error={errors?.walletAddress?.message}>
                <SelectItem
                  name={`recipients.${index}.walletAddress`}
                  customStyles={paymentContactStyle(disabled)}
                  placeholder="Search or Enter recipient address"
                  options={contactOptions}
                  formatOptionLabel={(props) => RecipientDropdownLabel(props, chainIcons)}
                  components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,
                    Menu: (props) => MenuSelectRecipient(props, onCreateRecipient),
                    SingleValue: (props) =>
                      PaymentContactSingleValue(props, (_address) => onSaveContact(_address, index))
                  }}
                  onInputChange={(value: string, action: InputActionMeta) => onInputChange(value, action, index)}
                  onChange={(_contact) => onContactChange(_contact, index)}
                  noOptionsMessage={() => 'No recipient found.'}
                  value={contact}
                  isInvalid={errors?.walletAddress}
                  manualOpen
                  onToggle={handleManualOpen}
                  menuIsOpen={isContactMenuOpen}
                  onMenuClose={() => setIsContactMenuOpen(false)}
                  isSearchable={!disabled}
                />
              </FormField>
            </div>
            {/* Token & amount section */}
            <div className="basis-1/2">
              <FormField label="Amount" isRequired error={errors?.amount?.message}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex gap-2 border items-center rounded h-full flex-1 ${
                      errors?.amount || errors?.token ? 'border-error-500' : 'border-dashboard-border-200'
                    } ${draftStatus ? 'bg-[#F2F4F7]' : 'bg-white'}`}
                  >
                    <div className="ml-[3px] my-[3px] min-w-[130px]">
                      <SelectCustom
                        index={index}
                        name="token"
                        placeholder="Search"
                        optionList={tokenOptions}
                        noOptionsMessage={() => 'No tokens found.'}
                        onChangeToken={(_token) => onTokenChange(_token, index)}
                        setValue={() => null}
                        token={token}
                        disabled={disabled}
                      />
                    </div>
                    <TextField
                      name={`recipients.${index}.amount`}
                      value={amount}
                      placeholder="Amount"
                      classNameInput="bg-transparent focus:outline-none text-sm text-dashboard-main placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter leading-5 "
                      onChange={(e) => onAmountChange(e.target.value, index)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </FormField>
              {(errors?.token || errors?.tokenId) && (
                <div className="text-xs font-normal flex items-center text-error-500 mt-1 mx-1">
                  <div className="mr-2 flex items-center">
                    <Image src={ErrorIcon} alt="warning" width={11} height={11} />
                  </div>
                  {errors?.token?.message || errors?.tokenId?.message}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row items-baseline gap-3 -mt-2">
            <div className="basis-1/4 min-w-[120px]">
              <FormField label="Account">
                {/* Account */}
                <SelectItem
                  name={`recipients.${index}.chartOfAccounts`}
                  isSearchable
                  value={account}
                  /* @ts-ignore */
                  options={accountOptions}
                  disabled={disabled}
                  placeholder="Select Account"
                  customStyles={paymentAccountStyle}
                  onChange={(_account) => onAccountChange(_account, index)}
                  components={{ Menu: MenuCategory, IndicatorSeparator: () => null }}
                />
              </FormField>
            </div>
            <div className="basis-1/4">
              {/* Note */}
              <FormField label="Note">
                <TextField
                  name={`recipients.${index}.note`}
                  placeholder="Note"
                  disabled={disabled}
                  value={note}
                  extendInputClassName="h-[40px] disabled:bg-[#F2F4F7]"
                  onChange={(e) => onNoteChange(e.target.value, index)}
                />
              </FormField>
            </div>
            {/* Files */}
            <div className="basis-1/4 min-w-[100px]">
              <FormField label="Files">
                <PaymentFileUpload
                  index={index}
                  files={files}
                  onChangeFile={onFileChange}
                  disabled={disabled}
                  onPreview={onPreviewFile}
                  onDownload={onDownloadFile}
                  errors={errors?.files?.message || errors?.s3Files?.message || ''}
                />
              </FormField>
            </div>
            <div className="basis-1/4">
              {/* Tag */}
              <FormField label="Tag">{tagsSelection}</FormField>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentLineItemV2
