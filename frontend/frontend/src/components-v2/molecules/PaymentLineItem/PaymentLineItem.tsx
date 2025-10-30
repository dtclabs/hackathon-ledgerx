import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import SelectCustom from '@/components/SelectItem/SelectCustom'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import CopyIcon from '@/public/svg/action-icon/copy-light.svg'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import MenuSelectRecipient from '@/views/MakePayment/components/custom-dropdown/MenuSelectRecipient'
import RecipientDropdownLabel from '@/views/MakePayment/components/custom-dropdown/RecipientDropdownLabel'
import DraftStatusPill from '@/views/MakePayment2/components/DraftStatusPill/DraftStatusPill'
import MenuCategory from '@/views/TransferApp/components/ReactSelectComponents/MenuCategory'
import Image from 'next/legacy/image'
import React, { useState } from 'react'
import { InputActionMeta } from 'react-select'
import PaymentContactSingleValue from './PaymentContactSingleValue'
import PaymentFileUpload from './PaymentFileUpload/PaymentFileUpload'
import { paymentAccountStyle, paymentContactStyle } from './PaymentLineItem.style'
import { IPaymentLineItem } from './PaymentLineItem.type'

const PaymentLineItem: React.FC<IPaymentLineItem> = ({
  index,
  errors,
  disabled,
  contact,
  token,
  amount,
  account,
  note,
  files,
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
  onTokenChange,
  onSaveContact,
  onInputChange,
  onCopyItem,
  onRemoveItem,
  onCreateRecipient,
  onDownloadFile,
  onPreviewFile,
  totalRecipients
}) => {
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)

  const handleManualOpen = () => {
    if (!disabled) setIsContactMenuOpen(!isContactMenuOpen)
  }

  return (
    <div className="flex flex-row gap-4">
      <Typography variant="subtitle2" classNames={`${index !== 0 ? 'mt-6' : 'mt-1'}`}>
        {index + 1}.
      </Typography>
      <div className={`bg-[#F9FAFB] rounded flex w-full flex-row gap-2 p-4 mb-2 ${index !== 0 ? 'pt-5 mt-5' : ''}`}>
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-row gap-4">
            {/* Contact section */}
            <div className="basis-1/2">
              <SelectItem
                name={`recipients.${index}.walletAddress`}
                customStyles={paymentContactStyle(disabled)}
                placeholder="Search or Enter recipient address"
                options={contactOptions}
                formatOptionLabel={RecipientDropdownLabel}
                components={{
                  IndicatorSeparator: () => null,
                  DropdownIndicator: () => null,
                  Menu: (props) => MenuSelectRecipient(props, onCreateRecipient),
                  SingleValue: (props) => PaymentContactSingleValue(props, (_address) => onSaveContact(_address, index))
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
              {errors?.walletAddress && <HelperText img={ErrorCircleIcon} helperText={errors?.walletAddress.message} />}
            </div>
            {/* Token & amount section */}
            <div className="basis-1/2">
              <div className="flex items-center gap-3">
                <div
                  className={`flex gap-4 border items-center rounded h-full flex-1 ${
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
                <Button
                  variant="grey"
                  classNames="!border-blanca-400 px-4 !bg-transparent"
                  height={48}
                  trailingIcon={<Image src={CopyIcon} width={16} height={16} alt="copy-icon" />}
                  onClick={() => onCopyItem(index)}
                />
                <Button
                  variant="grey"
                  classNames="!border-blanca-400 px-4 !bg-transparent"
                  disabled={removeDisabled || totalRecipients === 1}
                  height={48}
                  trailingIcon={<Image src={DeleteIcon} alt="document" width={16} height={16} />}
                  onClick={() => onRemoveItem(index)}
                />
              </div>
              {errors?.amount && <HelperText img={ErrorCircleIcon} helperText={errors?.amount?.message} />}
              {errors?.token && <HelperText img={ErrorCircleIcon} helperText={errors?.token.message} />}
            </div>
          </div>

          <div className="flex flex-row items-baseline gap-4 -mt-2">
            <div className="min-w-[20%]">
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
            </div>
            <div className="min-w-[28%]">
              {/* Note */}
              <TextField
                name={`recipients.${index}.note`}
                placeholder="Note"
                disabled={disabled}
                value={note}
                extendInputClassName="h-[40px] disabled:bg-[#F2F4F7]"
                onChange={(e) => onNoteChange(e.target.value, index)}
              />
            </div>
            {/* Files */}
            <div className="flex-1 flex justify-between items-start">
              <div className="flex items-center flex-row gap-2">
                <PaymentFileUpload
                  index={index}
                  files={files}
                  onChangeFile={onFileChange}
                  disabled={disabled}
                  errors={errors?.files?.message || errors?.s3Files?.message || ''}
                  onDownload={onDownloadFile}
                  onPreview={onPreviewFile}
                />
              </div>
              {draftStatus && (
                <div className="mt-2">
                  <DraftStatusPill status={draftStatus} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentLineItem
