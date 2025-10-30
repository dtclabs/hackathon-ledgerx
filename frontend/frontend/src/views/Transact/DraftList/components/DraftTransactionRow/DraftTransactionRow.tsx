/* eslint-disable arrow-body-style */
import { CurrencyType, IPayment, PaymentStatus } from '@/api-v2/payment-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import { FiatCurrencyDisplay } from '@/components-v2/molecules/FiatCurrencyDisplay'
import { BaseDropdown } from '@/components-v2/molecules/Forms/Dropdowns/BaseDropdown'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import SelectCustom from '@/components/SelectItem/SelectCustom'
import TextField from '@/components/TextField/TextField'
import { useDebounce } from '@/hooks/useDebounce'
import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip'
import MoreActions from './MoreActions'
import { useAppSelector } from '@/state'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { contactsSelector } from '@/slice/contacts/contacts-slice'
import { getCurrencyImage } from '@/views/CreateDraftPayment/hooks/useDraftForm/useDraftForm'
import { selectVerifiedCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { fiatCurrenciesMapSelector } from '@/slice/orgSettings/orgSettings-slice'

interface IDraftTxnRowProps {
  item: IPayment
  settings?: any
  chartOfAccountsMap: any
  reviewers: any
  isSidepanelOpen: boolean
  isFetchingCryptocurrencyPrices: boolean
  onClickUpdateReviewer?: (id: string, item: IPayment) => void
  onClickAddContact: (address: string) => void
  isLoading?: boolean
  action: {
    lineCTA: { label: string; onClick: (data: any) => void }
    moreActions: { label: string; onClick: (data: any) => void }[]
  }
  cryptocurrencyPrices: any
  assetOptions?: any[]
  currencyOptions?: any[]
  onUpdateAmount?: (_value: { tokenId?: string; amount?: string }, _payment: IPayment) => void
  paymentStatus?: PaymentStatus
  amount?: string
  setAmount?: (id: string, amount: string) => void
}
export const hasReviewer = (status: PaymentStatus) =>
  [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.INVALID].includes(status)

export const hasReviewerColumn = (status: PaymentStatus) =>
  [PaymentStatus.CREATED, PaymentStatus.PENDING, PaymentStatus.APPROVED].includes(status)

const DraftTransactionRow: React.FC<IDraftTxnRowProps> = ({
  item,
  settings,
  onClickAddContact,
  action,
  isLoading,
  chartOfAccountsMap,
  reviewers = [],
  onClickUpdateReviewer,
  isFetchingCryptocurrencyPrices,
  cryptocurrencyPrices,
  assetOptions,
  currencyOptions,
  isSidepanelOpen,
  onUpdateAmount,
  amount,
  setAmount
}) => {
  const initRef = useRef(true)
  const recipients = useAppSelector(contactsSelector)
  const wallets = useAppSelector(walletsSelector)
  const verifiedCryptoCurrencyMap = useAppSelector(selectVerifiedCryptocurrencyMap)
  const fiatCurrenciesMap = useAppSelector(fiatCurrenciesMapSelector)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string>('')
  const { debouncedValue: updatedAmount } = useDebounce(amount, 300)

  useEffect(() => {
    if (!isLoading) {
      setLoading(false)
    }
  }, [isLoading])

  useEffect(() => {
    // TODO - TEMP FIX
    if (!isSidepanelOpen) {
      setLoading(false)
    }
  }, [isSidepanelOpen])

  useEffect(() => {
    if (setAmount && initRef.current) {
      setErrors('')
      setAmount(item.id, item?.destinationAmount)
    }
  }, [item?.destinationAmount])

  const fiatAmount = useMemo(() => {
    const tokenFiatAmount =
      item?.destinationCurrencyType === CurrencyType.FIAT ? 0 : cryptocurrencyPrices[item?.destinationCurrency?.symbol]
    return parseFloat(tokenFiatAmount) * parseFloat(item?.destinationAmount)
  }, [item?.destinationAmount, item?.destinationCurrency?.symbol, cryptocurrencyPrices])

  const contactName = useMemo(() => {
    if (item.destinationMetadata?.type === 'wallet') {
      const walletContact = wallets?.find((wallet) => wallet.id === item.destinationMetadata.id)
      return walletContact?.name
    }
    if (item.destinationMetadata?.type === 'recipient_address') {
      const recipientContact = recipients?.find((recipient) =>
        recipient?.recipientAddresses?.find((address) => address.publicId === item.destinationMetadata.id)
      )
      return recipientContact?.type === 'individual'
        ? recipientContact?.contactName
        : recipientContact?.organizationName
    }
    return item?.destinationName
  }, [item.destinationMetadata, recipients, wallets])

  const handleOnClickUpdateReviewer = (_value: any) => {
    if (onClickUpdateReviewer) {
      onClickUpdateReviewer(_value, item)
    }
  }
  const handleChangeToken = (_token) => {
    onUpdateAmount(
      {
        amount: item.destinationAmount,
        tokenId: _token.value
      },
      item
    )
  }

  const handleChangeAmount = (value) => {
    const tokenId =
      item.destinationCurrencyType === CurrencyType.FIAT
        ? item?.destinationCurrency?.code
        : verifiedCryptoCurrencyMap[item.destinationCurrency?.symbol?.toLowerCase()]?.publicId
    if (Number(value) <= 0) {
      setErrors('Amount must be greater than 0.')
    } else if (Number.isNaN(Number(value))) {
      setErrors('Please enter a valid amount.')
    } else {
      onUpdateAmount(
        {
          amount: value,
          tokenId
        },
        item
      )
      setErrors('')
    }
  }

  const handleClickRowCTA = () => {
    if (Number(item.destinationAmount) <= 0 && item.status === PaymentStatus.CREATED) {
      setErrors('Amount must be greater than 0.')
      toast.error('There was an error submitting for review. Amount must be greater than 0.')
      return
    }
    if (Number.isNaN(Number(item.destinationAmount)) && item.status === PaymentStatus.CREATED) {
      setErrors('Please enter a valid amount.')
      toast.error('There was an error submitting for review. Please enter a valid amount.')
      return
    }
    setLoading(true)
    action.lineCTA.onClick(item)
  }

  useEffect(() => {
    if (!initRef.current) handleChangeAmount(updatedAmount)
  }, [updatedAmount])

  const renderRecipient = useMemo(() => {
    if (item?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <>
          <ProfileInfoDisplay.Info.Name color="primary" styleVariant="regular" classNames="truncate">
            {contactName || item?.destinationName}
          </ProfileInfoDisplay.Info.Name>
          <ProfileInfoDisplay.Info.Name
            data-tip={`full-bank-info-${item?.id}`}
            data-for={`full-bank-info-${item?.id}`}
            color="secondary"
            classNames="truncate"
            variant="caption"
          >
            {item?.destinationMetadata?.bankName}-{item?.destinationMetadata?.accountNumberLast4}
          </ProfileInfoDisplay.Info.Name>
          <ReactTooltip
            id={`full-bank-info-${item?.id}`}
            borderColor="#eaeaec"
            border
            place="bottom"
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            <Typography>
              {item?.destinationMetadata?.bankName}-{item?.destinationMetadata?.accountNumberLast4}
            </Typography>
          </ReactTooltip>
        </>
      )
    }
    return item?.destinationName && item?.destinationMetadata?.id ? (
      <>
        <ProfileInfoDisplay.Info.Name color="primary" styleVariant="regular" classNames="truncate">
          {contactName || item?.destinationName}
        </ProfileInfoDisplay.Info.Name>
        <ProfileInfoDisplay.Info.Address address={item?.destinationAddress} color="secondary" variant="caption" />
      </>
    ) : (
      <>
        <div className="flex flex-row items-center">
          <div data-tip={`add-contact-${item?.id}`} data-for={`add-contact-${item?.id}`}>
            <WalletAddress split={4} address={item.destinationAddress} color="primary" styleVariant="regular" />
            <ReactTooltip
              id={`add-contact-${item?.id}`}
              borderColor="#eaeaec"
              border
              delayHide={100}
              clickable
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              <div className="flex flex-row items-center gap-4 px-2 py-[2px] cursor-default">
                <div style={{ color: '#344054' }} className="text-sm ">
                  Unknown Address
                </div>
                <Button
                  label="Add To Contacts"
                  height={32}
                  variant="grey"
                  color="tertiary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClickAddContact(item.destinationAddress)
                  }}
                />
              </div>
            </ReactTooltip>
          </div>
          <div className="flex items-center gap-[6px]">
            <WalletAddress.Link address={item.destinationAddress} isMultiple={false} />
            <WalletAddress.Copy address={item.destinationAddress} />
          </div>
        </div>
        <ProfileInfoDisplay.Info.Name color="secondary" classNames="truncate" variant="caption">
          {item?.destinationName || 'Unknown'}
        </ProfileInfoDisplay.Info.Name>
      </>
    )
  }, [
    item?.destinationMetadata,
    item?.destinationName,
    item?.destinationCurrencyType,
    item?.destinationAddress,
    contactName,
    item?.destinationName
  ])

  const renderCurrencyOptions = useMemo(() => {
    if (item?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <SelectCustom
          className="flex items-center justify-between min-w-[100px] bg-[#FBFAFA] px-2 py-1 rounded border border-color-[#F1F1EF] focus:outline-none leading-5"
          name="token"
          placeholder="Search"
          token={
            currencyOptions?.find(
              (asset) => asset.label?.toLowerCase() === item?.destinationCurrency?.code?.toLowerCase()
            ) || currencyOptions?.find((asset) => asset.label?.toLowerCase() === 'SGD')
          }
          optionList={currencyOptions}
          noOptionsMessage={() => 'No currency found.'}
          onChangeToken={(value) => {
            handleChangeToken(value)
          }}
          disabled
          setValue={() => null}
        />
      )
    }

    return (
      <SelectCustom
        className="flex items-center justify-between min-w-[110px] bg-[#FBFAFA] px-2 py-1 rounded border border-color-[#F1F1EF] focus:outline-none leading-5"
        name="token"
        placeholder="Search"
        token={
          assetOptions?.find(
            (asset) => asset.label?.toLowerCase() === item?.destinationCurrency?.symbol?.toLowerCase()
          ) || assetOptions?.find((asset) => asset.label?.toLowerCase() === 'eth')
        }
        optionList={assetOptions}
        noOptionsMessage={() => 'No tokens found.'}
        onChangeToken={(value) => {
          handleChangeToken(value)
        }}
        setValue={() => null}
      />
    )
  }, [item?.destinationCurrencyType, assetOptions, currencyOptions, item?.destinationCurrency])

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="px-[12px] py-[14px] truncate">
        <ProfileInfoDisplay>
          <ProfileInfoDisplay.Avatar name={item?.destinationMetadata?.id && item?.destinationName} />
          <ProfileInfoDisplay.Info classNames="w-[calc(100%-32px)] truncate">{renderRecipient}</ProfileInfoDisplay.Info>
        </ProfileInfoDisplay>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="px-[12px] py-[14px] ">
        {item?.status === PaymentStatus.CREATED ? (
          <>
            <div
              aria-hidden
              onClick={(e) => e.stopPropagation()}
              className={`flex gap-2 border items-center rounded h-full flex-1 ${
                errors ? 'border-error-500' : 'border-dashboard-border-200'
              } bg-white`}
            >
              <div className="ml-[3px] my-[3px] min-w-[110px]">{renderCurrencyOptions}</div>
              <TextField
                name="amount"
                value={amount || ''}
                onChange={(e) => {
                  setAmount(item.id, e.target.value)
                  initRef.current = false
                }}
                placeholder="Amount"
                classNameInput={`bg-transparent focus:outline-none text-sm text-dashboard-main placeholder:text-[#98A2B3] placeholder:leading-5 font-inter leading-5 ${
                  errors ? 'w-[calc(100%-140px)]' : 'w-full'
                }`}
              />
              {errors && (
                <div
                  className="mr-2 flex items-center"
                  data-tip={`draft-amount-error-${item?.id}`}
                  data-for={`draft-amount-error-${item?.id}`}
                >
                  <Image src={ErrorCircleIcon} alt="warning" width={14} height={14} />
                  <ReactTooltip
                    id={`draft-amount-error-${item?.id}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="!opacity-100 !rounded-lg !text-error-500"
                  >
                    {errors}
                  </ReactTooltip>
                </div>
              )}
            </div>
            {item?.destinationCurrency?.symbol && (
              <div
                className="w-fit pt-[2px]"
                data-tip={`draft-fiat-display-${item?.id}`}
                data-for={`draft-fiat-display-${item?.id}`}
              >
                {isFetchingCryptocurrencyPrices ? (
                  <SkeletonLoader variant="rounded" height={12} width={80} />
                ) : Number.isNaN(Number(fiatAmount)) ? (
                  <Typography color="secondary">-</Typography>
                ) : (
                  item?.destinationCurrencyType !== CurrencyType.FIAT && ( // hide it until the fiat currency API is ready
                    <FiatCurrencyDisplay
                      iso={settings?.country?.iso}
                      textColor="secondary"
                      variant="caption"
                      currencyCode={settings?.fiatCurrency?.code}
                      currencySymbol={settings?.fiatCurrency?.symbol}
                      fiatAmount={fiatAmount?.toString()}
                    />
                  )
                )}
                {!Number.isNaN(Number(fiatAmount)) && (
                  <ReactTooltip
                    id={`draft-fiat-display-${item?.id}`}
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
                      fiatAmount={fiatAmount?.toString()}
                      displayRaw
                    />
                  </ReactTooltip>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="w-[120px]">
            <CryptoFiatInfoDisplay
              id={item.id}
              classNames="w-fit"
              iso={settings?.country?.iso}
              cryptocurrency={
                item?.destinationCurrencyType === CurrencyType.FIAT
                  ? {
                      image: getCurrencyImage(item?.destinationCurrency?.code),
                      amount: item?.destinationAmount || '0',
                      symbol: item?.destinationCurrency?.code
                    }
                  : {
                      image: item?.destinationCurrency?.image?.small,
                      amount: item?.destinationAmount || '0',
                      symbol: item?.destinationCurrency?.symbol
                    }
              }
              isCalculatingFiat={item.destinationAmount && Number.isNaN(Number(fiatAmount))}
              fiatcurrency={
                // hide it until the fiat currency API is ready
                item?.destinationCurrencyType !== CurrencyType.FIAT && {
                  iso: settings?.country?.iso,
                  currencyCode: settings?.fiatCurrency?.code,
                  currencySymbol: settings?.fiatCurrency?.symbol,
                  fiatAmount: item?.destinationAmount ? fiatAmount?.toString() : '0',
                  color: 'secondary'
                }
              }
            />
          </div>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="px-[12px] py-[14px]">
        {item?.chartOfAccount && chartOfAccountsMap[item?.chartOfAccount?.id] ? (
          <Typography color="primary" variant="body2" classNames="truncate">
            {chartOfAccountsMap[item?.chartOfAccount?.id]?.code
              ? `${chartOfAccountsMap[item?.chartOfAccount?.id]?.code} - ${
                  chartOfAccountsMap[item?.chartOfAccount?.id]?.name
                }`
              : chartOfAccountsMap[item?.chartOfAccount?.id]?.name}
          </Typography>
        ) : (
          <Typography color="tertiary" variant="body2">
            No account
          </Typography>
        )}
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="px-[12px] py-[14px]">
        <div className="flex flex-col justify-center">
          <Typography color="primary" variant="body2">
            {format(new Date(item.createdAt), 'dd MMM yyyy')}
          </Typography>
          <Typography variant="caption" classNames="mt-1" color="secondary">
            {format(new Date(item.createdAt), 'hh:mm a')}
          </Typography>
        </div>
      </BaseTable.Body.Row.Cell>
      {item?.status === PaymentStatus.FAILED && (
        <BaseTable.Body.Row.Cell extendedClass="px-[12px] py-[14px]">
          <div className="flex flex-col justify-center">
            <Typography color="primary" variant="body2">
              {format(new Date(item.failedAt), 'dd MMM yyyy')}
            </Typography>
            <Typography variant="caption" classNames="mt-1" color="secondary">
              {format(new Date(item.failedAt), 'hh:mm a')}
            </Typography>
          </div>
        </BaseTable.Body.Row.Cell>
      )}
      {hasReviewerColumn(item?.status) && (
        <BaseTable.Body.Row.Cell
          extendedClass="px-[12px] py-[14px]"
          onClick={(e) => item?.status === PaymentStatus.CREATED && e.stopPropagation()}
        >
          {item?.status === PaymentStatus.CREATED ? (
            <BaseDropdown
              size="sm"
              // @ts-ignore
              defaultValue={
                item?.reviewer
                  ? { value: null, label: item?.reviewer?.account?.name || 'Anyone can review' }
                  : { value: null, label: 'Anyone can review' }
              }
              value={
                item?.reviewer
                  ? { value: null, label: item?.reviewer?.account?.name || 'Anyone can review' }
                  : { value: null, label: 'Anyone can review' }
              }
              showCaret
              onChange={handleOnClickUpdateReviewer}
              components={{
                IndicatorSeparator: null
              }}
              customStyles={{ indicatorStyles: '!bg-white' }}
              options={[{ value: null, label: 'Anyone can review' }, ...reviewers]}
            />
          ) : (
            item?.reviewer?.account?.name || 'Anyone can review'
          )}
        </BaseTable.Body.Row.Cell>
      )}
      <BaseTable.Body.Row.Cell extendedClass="pl-[12px] py-[14px] pr-0">
        <div className="flex flex-row gap-2">
          <Button
            variant="ghost"
            disabled={loading}
            label={action ? action.lineCTA.label : '-'}
            height={32}
            classNames="px-3 !text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation()
              if (errors) {
                toast.error(`There was an error submitting for review. ${errors}`)
              } else {
                handleClickRowCTA()
              }
            }}
          />
          <div className="min-w-[28px] w-[5%]">
            <MoreActions rowData={item} actions={action?.moreActions} />
          </div>
        </div>
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default DraftTransactionRow
