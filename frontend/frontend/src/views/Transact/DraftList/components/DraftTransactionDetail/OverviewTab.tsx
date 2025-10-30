import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import { CurrencyType, IPayment, PaymentStatus } from '@/api-v2/payment-api'
import { Divider } from '@/components-v2/Divider'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import { FiatCurrencyDisplay } from '@/components-v2/molecules/FiatCurrencyDisplay'
import PaymentContactSingleValue from '@/components-v2/molecules/PaymentLineItem/PaymentContactSingleValue'
import PaymentFileUpload from '@/components-v2/molecules/PaymentLineItem/PaymentFileUpload/PaymentFileUpload'
import { paymentAccountStyle } from '@/components-v2/molecules/PaymentLineItem/PaymentLineItem.style'
import { TagManagementPopup } from '@/components-v2/molecules/TagManagementPopup'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { EPlacement } from '@/components/DropDown/DropDown'
import SelectCustom from '@/components/SelectItem/SelectCustom'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import ContactIcon from '@/public/svg/icons/contact-unknown-avatar.svg'
import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useAppSelector } from '@/state'
import { findMatchingAddress } from '@/utils/isExistedRecipient'
import { ITagHandler } from '@/views/Transactions-v2/interface'
import Avvvatars from 'avvvatars-react'
import Image from 'next/legacy/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import ReactTooltip from 'react-tooltip'
import { IDraftDetailForm } from '../../DraftTransactionListView'
import { recipientSelectorStyle } from '../../copy'
import { hasReviewer } from '../DraftTransactionRow/DraftTransactionRow'
import { getCurrencyImage } from '@/views/CreateDraftPayment/hooks/useDraftForm/useDraftForm'
import RecipientBankAccountLabel from '@/views/CreateDraftPayment/FiatPayment/RecipientBankAccountLabel'
import RecipientDropdownLabel from '@/views/MakePayment/components/custom-dropdown/RecipientDropdownLabel'

interface IOverviewProps {
  data: IPayment
  settings: any
  annotations: { value: string; label: string }[]
  assetOptions: { value: string; label: string; src: any }[]
  currencyOptions: { value: string; label: string; src: any }[]
  bankAccountOptions: any[]
  accountOptions: any
  recipientOptions: any[]
  reviewerOptions: { value: string; label: string }[]
  recipients: any
  wallets: any
  selectedChain: any
  tagsHandler: ITagHandler
  onSaveContact: (address: string) => void
  setHasChanges: (changes: boolean) => void
  cryptocurrencyPrice: number | null
}

const OverviewTab: React.FC<IOverviewProps> = ({
  data,
  settings,
  recipients,
  annotations,
  wallets,
  tagsHandler,
  assetOptions,
  bankAccountOptions,
  currencyOptions,
  selectedChain,
  accountOptions,
  reviewerOptions,
  recipientOptions,
  onSaveContact,
  setHasChanges,
  cryptocurrencyPrice
}) => {
  const selectRef = useRef(null)

  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))

  const { formState, watch, setValue, control, trigger } = useFormContext<IDraftDetailForm>()
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const [triggerDownload] = useLazyDownloadTxFileQuery()
  const [triggerPreviewFile] = useLazyPreviewFileQuery()

  const setChanged = () => {
    setHasChanges(true)
  }
  const handleManualOpen = () => {
    setIsContactMenuOpen(!isContactMenuOpen)
  }
  const handleChangeToken = (_token) => {
    setValue('token', _token)
  }

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
  const handleChangeInput = (_value, _action) => {
    if (_action.action === 'input-change') {
      if (_value) {
        const isAddressPartOfRecipients = findMatchingAddress(recipients, _value)
        const isAddressPartOfWallets = wallets.find((wallet) => wallet.address.toLowerCase() === _value.toLowerCase())

        if (isAddressPartOfRecipients || isAddressPartOfWallets) {
          if (isAddressPartOfRecipients) {
            const { recipient } = isAddressPartOfRecipients
            setValue('recipient', {
              address: _value,
              value: _value,
              label: recipient?.organizationName || recipient?.contactName,
              chainId: selectedChain?.id,
              isUnknown: false,
              metadata: {
                id: recipient.recipientAddresses.find(
                  (recipientObj) => recipientObj.address?.toLowerCase() === _value?.toLowerCase()
                )?.publicId,
                type: 'recipient_address'
              }
            })
          } else if (isAddressPartOfWallets) {
            setValue('recipient', {
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
          setValue('recipient', {
            address: _value,
            value: _value,
            label: '',
            chainId: selectedChain?.id,
            isUnknown: true,
            metadata: null
          })
          setChanged()
        }
      } else {
        setValue('recipient', null)
      }
    }
  }

  const handleChangeFile = (_file, _action) => {
    const getCurrentFiles = watch('files') ?? []
    if (_action === 'add') {
      setValue('files', [...getCurrentFiles, _file])
      trigger('files')
    } else if (_action === 'remove') {
      setValue(
        'files',
        getCurrentFiles.filter((file) => file.name !== _file.name)
      )
      trigger('files')
    }
  }

  const triggerButton = (onOpen) => (
    <Button
      buttonRef={selectRef}
      height={24}
      variant="ghost"
      label="Add Tag"
      classNames="font-medium !text-xs py-3 px-[10px]"
      leadingIcon={<Image src={AddIcon} width={12} height={12} />}
      onClick={onOpen}
    />
  )

  const tagsSelection = useMemo(
    () => (
      <div className="flex flex-wrap gap-1">
        <TagManagementPopup
          position="top"
          options={tagsHandler.options}
          placement={EPlacement.TOPRIGHT}
          tags={annotations || []}
          onChange={(tag) => {
            tagsHandler.onAttachAnnotation(tag)
          }}
          onClear={(tag) => {
            tagsHandler.onDeleteAnnotation(tag)
          }}
          onCreate={(tag) => {
            tagsHandler.onCreate(tag)
          }}
          onDelete={tagsHandler.onDelete}
          onEdit={tagsHandler.onUpdate}
          triggerButton={triggerButton}
        />
        {annotations?.length > 0 ? (
          <>
            {annotations.map((tag) => (
              <TagItem
                key={tag.value}
                tag={tag}
                onClear={(_tag) => {
                  tagsHandler.onDeleteAnnotation(_tag)
                }}
              />
            ))}
          </>
        ) : null}
      </div>
    ),
    [annotations, tagsHandler?.options]
  )

  const renderCurrencyOptions = useMemo(() => {
    if (data?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <SelectCustom
          className="flex items-center justify-between min-w-[120px] bg-[#FBFAFA] px-[10px] py-2 rounded border border-color-[#F1F1EF] focus:outline-none leading-5"
          name="token"
          placeholder="Search"
          token={watch('token') || currencyOptions?.find((asset) => asset.label?.toLowerCase() === 'SGD')}
          optionList={currencyOptions}
          noOptionsMessage={() => 'No currency found.'}
          onChangeToken={(value) => {
            handleChangeToken(value)
            setChanged()
          }}
          disabled
          setValue={() => null}
        />
      )
    }
    return (
      <SelectCustom
        className="flex items-center justify-between min-w-[120px] bg-[#FBFAFA] px-[10px] py-2 rounded border border-color-[#F1F1EF] focus:outline-none leading-5"
        name="token"
        placeholder="Search"
        token={watch('token') || assetOptions?.find((asset) => asset.label?.toLowerCase() === 'eth')}
        optionList={assetOptions}
        noOptionsMessage={() => 'No tokens found.'}
        onChangeToken={(value) => {
          handleChangeToken(value)
          setChanged()
        }}
        setValue={() => null}
      />
    )
  }, [assetOptions, currencyOptions, watch('token')])

  return (
    <div className="pt-4">
      <div className="flex flex-col grow">
        <section className="flex flex-col gap-2 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Recipient
          </Typography>
          {![PaymentStatus.INVALID, PaymentStatus.CREATED].includes(data?.status) ? (
            <div className="flex items-center gap-2 h-10">
              {data?.destinationName && data?.destinationMetadata?.id ? (
                <Avvvatars value={data.destinationName} size={24} />
              ) : (
                <Image src={ContactIcon} alt="contact-icon" height={24} width={24} />
              )}
              <Typography classNames="truncate max-w-[calc(100%-110px)]" color="dark">
                {data?.destinationName ?? 'Unknown'}
              </Typography>
              <DividerVertical space="mx-0" height="h-5" />
              {data?.destinationCurrencyType === CurrencyType.FIAT ? (
                <Typography color="secondary" classNames="truncate">
                  {data?.destinationMetadata?.bankName}-{data?.destinationMetadata?.accountNumberLast4}
                </Typography>
              ) : (
                <WalletAddress address={data?.destinationAddress}>
                  <WalletAddress.Link address={data?.destinationAddress} isMultiple={false} />
                  <WalletAddress.Copy address={data?.destinationAddress} />
                </WalletAddress>
              )}
            </div>
          ) : (
            <>
              {data?.destinationCurrencyType === CurrencyType.FIAT ? (
                <SelectItem
                  name="recipient"
                  control={control}
                  customStyles={recipientSelectorStyle}
                  placeholder="Search or Enter recipient bank account"
                  options={bankAccountOptions}
                  formatOptionLabel={RecipientBankAccountLabel}
                  components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null
                  }}
                  noOptionsMessage={() => 'No recipient found.'}
                  isInvalid={!!formState?.errors?.recipient}
                  manualOpen
                  onToggle={handleManualOpen}
                  menuIsOpen={isContactMenuOpen}
                  onMenuClose={() => setIsContactMenuOpen(false)}
                  isSearchable
                />
              ) : (
                <SelectItem
                  name="recipient"
                  control={control}
                  customStyles={recipientSelectorStyle}
                  placeholder="Search or Enter recipient address"
                  options={recipientOptions}
                  formatOptionLabel={(props) => RecipientDropdownLabel(props)}
                  components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: () => null,
                    SingleValue: (props) => PaymentContactSingleValue(props, onSaveContact)
                  }}
                  onInputChange={(value, action) => {
                    handleChangeInput(value, action)
                    setChanged()
                  }}
                  noOptionsMessage={() => 'No recipient found.'}
                  isInvalid={!!formState?.errors?.recipient}
                  manualOpen
                  onToggle={handleManualOpen}
                  menuIsOpen={isContactMenuOpen}
                  onMenuClose={() => setIsContactMenuOpen(false)}
                  isSearchable
                />
              )}
              {formState?.errors?.recipient && (
                <HelperText
                  className="text-error-500 flex gap-2 items-start text-sm"
                  img={ErrorCircleIcon}
                  helperText={formState?.errors?.recipient.message}
                />
              )}
            </>
          )}
        </section>
        <section className={`flex flex-col gap-2 ${hasReviewer(data?.status) && 'mb-6'} `}>
          <Typography styleVariant="semibold" color="secondary">
            Amount
          </Typography>
          {data?.status === PaymentStatus.CREATED ? (
            <>
              <div
                className={`flex gap-4 border items-center rounded h-full flex-1 ${
                  formState?.errors?.amount || formState?.errors?.token
                    ? 'border-error-500'
                    : 'border-dashboard-border-200'
                } bg-white`}
              >
                <div className="ml-[3px] my-[3px] min-w-[130px]">{renderCurrencyOptions}</div>
                <TextField
                  name="amount"
                  control={control}
                  placeholder="Amount"
                  classNameInput="bg-transparent focus:outline-none text-sm text-dashboard-main placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter leading-5 "
                />
              </div>
              {formState?.errors?.amount && (
                <HelperText
                  className="text-error-500 flex gap-2 items-start text-sm"
                  img={ErrorCircleIcon}
                  helperText={formState?.errors?.amount?.message}
                />
              )}
              {data?.destinationCurrencyType !== CurrencyType.FIAT && (
                <div className="w-fit" data-tip="draft-fiat-display" data-for="draft-fiat-display">
                  <FiatCurrencyDisplay
                    iso={settings?.country?.iso}
                    textColor="primary"
                    currencyCode={settings?.fiatCurrency?.code}
                    currencySymbol={settings?.fiatCurrency?.symbol}
                    fiatAmount={String(
                      Boolean(cryptocurrencyPrice) && Boolean(watch('amount'))
                        ? cryptocurrencyPrice * parseFloat(watch('amount'))
                        : 0
                    )}
                  />
                  <ReactTooltip
                    id="draft-fiat-display"
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="right"
                    className="!opacity-100 !rounded-lg !text-xs"
                  >
                    <FiatCurrencyDisplay
                      iso={settings?.country?.iso}
                      textColor="primary"
                      currencyCode={settings?.fiatCurrency?.code}
                      currencySymbol={settings?.fiatCurrency?.symbol}
                      fiatAmount={String(
                        Boolean(cryptocurrencyPrice) && Boolean(watch('amount'))
                          ? cryptocurrencyPrice * parseFloat(watch('amount'))
                          : 0
                      )}
                      displayRaw
                    />
                  </ReactTooltip>
                </div>
              )}
            </>
          ) : (
            <CryptoFiatInfoDisplay
              classNames="flex gap-2 w-fit"
              iso={settings?.country?.iso}
              cryptocurrency={
                data?.destinationCurrencyType === CurrencyType.FIAT
                  ? {
                      image: getCurrencyImage(data?.destinationCurrency?.code),
                      amount: data?.destinationAmount || '0',
                      symbol: data?.destinationCurrency?.code
                    }
                  : {
                      image: data?.destinationCurrency?.image?.small,
                      amount: data?.destinationAmount || '0',
                      symbol: data?.destinationCurrency?.symbol
                    }
              }
              fiatcurrency={
                data?.destinationCurrencyType !== CurrencyType.FIAT && {
                  iso: settings?.country?.iso,
                  currencyCode: settings?.fiatCurrency?.code,
                  currencySymbol: settings?.fiatCurrency?.symbol,
                  fiatAmount: String(
                    Boolean(cryptocurrencyPrice) && Boolean(watch('amount'))
                      ? cryptocurrencyPrice * parseFloat(watch('amount'))
                      : 0
                  ),
                  color: 'secondary'
                }
              }
            />
          )}
        </section>
        {hasReviewer(data?.status) && (
          <section className="flex flex-row justify-between items-center">
            <Typography styleVariant="semibold" color="secondary" classNames="flex-1">
              Assigned Reviewer
            </Typography>
            <div className="flex-1">
              {data?.status === PaymentStatus.CREATED ? (
                <SelectItem
                  name="reviewer"
                  isSearchable
                  control={control}
                  options={reviewerOptions}
                  placeholder="Select Reviewer"
                  customStyles={paymentAccountStyle}
                  components={{ IndicatorSeparator: () => null }}
                />
              ) : (
                <Typography color="black" classNames="">
                  {data?.reviewer?.account?.name || 'Anyone can Review'}
                </Typography>
              )}
            </div>
          </section>
        )}
        <Divider />
        <Typography styleVariant="semibold" color="black" classNames="mb-6 my-2">
          Additional Information
        </Typography>
        <section className="flex flex-row justify-between items-center mb-6">
          <Typography styleVariant="semibold" color="secondary" classNames="flex-1">
            Account
          </Typography>
          <div className="flex-1">
            <SelectItem
              name="account"
              isSearchable
              control={control}
              options={[{ value: null, label: 'No Account' }, ...accountOptions]}
              placeholder="Select Account"
              customStyles={paymentAccountStyle}
              components={{ IndicatorSeparator: () => null }}
            />
          </div>
        </section>
        <section className="flex flex-col gap-2 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Notes
          </Typography>
          <TextField
            control={control}
            name="notes"
            multiline
            rows={3}
            classNameInput="focus:outline-none scrollbar border border-[#EAECF0] p-4 text-sm text-dash placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter rounded-lg disabled:bg-transparent focus:shadow-textFieldRecipient"
          />
        </section>
        <section className="flex flex-col gap-2 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Files
          </Typography>
          <PaymentFileUpload
            onChangeFile={(file, index, action) => {
              handleChangeFile(file, action)
              setChanged()
            }}
            onPreview={handlePreviewFile}
            onDownload={handleDownloadFile}
            files={watch('files')}
          />
          {formState?.errors?.files && (
            <HelperText
              className="text-error-500 flex gap-2 items-start text-xs"
              img={ErrorCircleIcon}
              helperText={formState?.errors?.files?.message}
            />
          )}
        </section>
        {isAnnotationEnabled && (
          <section className="flex flex-col gap-2 mb-6">
            <Typography styleVariant="semibold" color="secondary">
              Tags
            </Typography>
            {tagsSelection}
          </section>
        )}
      </div>
    </div>
  )
}

export default OverviewTab
