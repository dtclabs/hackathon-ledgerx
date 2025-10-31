/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable quotes */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable arrow-body-style */
/* eslint-disable react/button-has-type */
/* eslint-disable prefer-template */
/* eslint-disable react/no-unstable-nested-components */

import { FC, useMemo, useState } from 'react'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { capitalize } from 'lodash'
import { toast } from 'react-toastify'
import { Button } from '@/components-v2'
import ButtonV2 from '@/components-v2/atoms/Button'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import XeroIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import RequestIcon from '@/public/svg/icons/request-circle-icon.svg'

import WarningIcon from '@/public/svg/icons/error-icon-outlined.svg'

import ArrowGreen from '@/public/svg/icons/arrow-green.svg'
import ArrowRed from '@/public/svg/icons/arrow-red.svg'
import ContactIconSmall from '@/public/svg/icons/contact-icon-small.svg'
import WalletIconSmall from '@/public/svg/icons/wallet-icon-small.svg'
import ProxyIcon from '@/public/svg/icons/proxy-icon.svg'
import Checkbox from '@/components/Checkbox/Checkbox'
import SelectDropdown from '@/components-v2/Select/Select'
import { currencyToWord, numToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { useAppSelector } from '@/state'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { scrollbarSelect } from '@/constants/styles'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { CURRENCY_RELATED_CONSTANTS, isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import Typography from '@/components-v2/atoms/Typography'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import FormatCoAOptionLabel from './FormatCoAOptionLabel'
import ReactTooltip from 'react-tooltip'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { useLazyGetFinancialTransactionDefaultMappingQuery } from '@/api-v2/financial-tx-api'
import { getDefaultMappingOptions } from './txGrid.utils'
import { ITagHandler, MAX_DISPLAY_TAGS, TransactionTableColumn } from '../interface'
import { TagManagementPopup } from '@/components-v2/molecules/TagManagementPopup'
import { IAnnotation, ITag } from '@/slice/tags/tag-type'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

const capitalizeFirst = (_str) => _str.charAt(0).toUpperCase() + _str.slice(1)

interface ITxGridData {
  id: string
  financialTransactionParent: {
    activity: string
    hash: string
    exportStatus: string
    invoices: any[]
  }
  hash: string
  blockchainId: string
  valueTimestamp: string
  fiatCurrency: string
  type: string
  direction: 'incoming' | 'outgoing'
  toAddress: string
  gainLoss: string
  fromAddress: string
  fiatAmount: string
  correspondingChartOfAccount: any
  isCorrespondingChartOfAccountChangeable: boolean
  category: {
    id: string
    name: string
    type: string
  }
  status: string
  cryptocurrencyAmount: string
  fromContact: {
    name: string
    type: string
  }
  toContact: {
    name: string
    type: string
  }
  cryptocurrency: {
    addresses: any
    symbol: string
    image: {
      small
    }
  }
  typeDetail: {
    value: string
    label: string
  }
  proxyAddress: string
  annotations: IAnnotation[]
}

interface ITxGridTableRow {
  data: ITxGridData
  onClickRow: any
  handleOnClickAddContact: any
  onClickChangeCategory: any
  onClickCheckbox: any
  isChecked: any
  batchSize?: number
  isChild?: boolean
  chartOfAccounts?: any
  isIgnored?: boolean
  parentHash?: string
  onHoverParent?: (hash: string) => void
  isLastRow: boolean
  tabelRef: any
  onRetryExport: () => void
  txnTableColumns: any
  tagsHandler: ITagHandler
  tags: ITag[]
  onInitTempTags: (txnId, tags) => void
}

export const handleOnClickExternal = (hash, blockExplorer) => (e) => {
  e.stopPropagation()
  window.open(`${blockExplorer}tx/${hash}`, '_blank')
}

export const handleCopyMessage = (_dataToCopy) => (e) => {
  e.stopPropagation()
  toast.success('Copied successfully', {
    position: 'top-right',
    pauseOnHover: false
  })
  navigator.clipboard.writeText(_dataToCopy)
}

// TODO: Abstract to a utility
const truncateText = (text, length) => {
  if (!text) {
    return ''
  }
  if (text.length <= length) {
    return text
  }

  return text.substr(0, length) + '\u2026'
}

const TxGridTableRow: FC<ITxGridTableRow> = ({
  onClickRow,
  data,
  batchSize,
  handleOnClickAddContact,
  onClickCheckbox,
  onClickChangeCategory,
  chartOfAccounts,
  isChecked,
  isChild,
  isIgnored,
  parentHash,
  onHoverParent,
  isLastRow,
  tabelRef,
  onRetryExport,
  txnTableColumns,
  tagsHandler,
  tags,
  onInitTempTags
}) => {
  const router = useRouter()
  // const [tags, setTags] = useState(data?.annotations || [])
  const { tab } = router.query
  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))

  const organizationId = useOrganizationId()
  const selectedChain = useAppSelector(selectedChainSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const importedChartOfAccounts = useAppSelector(chartOfAccountsSelector)
  const isWalletsSyncing = useAppSelector((state) => state.wallets.isSyncing)

  const fromImageIcon = data.fromContact?.type === 'contact' ? ContactIconSmall : WalletIconSmall
  const toImageIcon = data.toContact?.type === 'contact' ? ContactIconSmall : WalletIconSmall
  const isPositive = parseFloat(parseFloat(data.gainLoss).toFixed(2)) > 0
  const isZero = data.gainLoss === '0'

  const decimal = useMemo(() => {
    return data?.cryptocurrency?.addresses?.find((address) => address.blockchainId === selectedChain?.id)?.decimal || 8
  }, [data?.cryptocurrency?.addresses, selectedChain?.id])

  const {
    timezone: timeZonesetting,
    country: countrySetting,
    fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)

  const [getDefaultMapping, { data: defaultMapping, isFetching }] = useLazyGetFinancialTransactionDefaultMappingQuery()

  const handleChangeCategory = (_category) => {
    onClickChangeCategory({ tx: data, category: _category })
  }

  const getFiatAmount = () => {
    if (!isZero) {
      const fiatCurrency = data.gainLoss.replace('-', '')
      return data.gainLoss
        ? `${fiatCurrencySetting?.symbol}${currencyToWord(
            fiatCurrency,
            CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
            countrySetting?.iso,
            2
          )} ${data.fiatCurrency.toUpperCase()}`
        : '-'
    }

    return (
      <span className="text-[#000000]">{`${fiatCurrencySetting?.symbol} 0.00 ${data.fiatCurrency.toUpperCase()}`}</span>
    )
  }

  const getFormattedTime = () => {
    const formattedTimeString = formatTimeBasedonUTCOffset(
      data.valueTimestamp,
      timeZonesetting?.utcOffset || 480,
      countrySetting?.iso || 'SG'
    )

    const formattedDate = formattedTimeString.split(', ')[0]
    const formattedTime = formattedTimeString.split(', ')[1]

    return (
      <>
        <p>{formattedDate}</p>
        <p className="font-inter text-[12px] leading-[14px] text-[#777675] mt-[2px]">{formattedTime}</p>
      </>
    )
  }

  const chartOfAccountsOptions = useMemo(() => {
    return getDefaultMappingOptions(chartOfAccounts, defaultMapping)
  }, [defaultMapping, chartOfAccounts])

  // Placeholder open modal for Invoice button (reusing tag modal for demo)
  const handleOpenTagsModal = () => {
    // no-op in demo; existing tag modal logic will intercept via renderButton path if wired
  }

  const renderButton = (onClick) => (
    <ButtonV2
      height={24}
      variant="ghost"
      classNames="font-medium py-1 px-[5px] rounded"
      leadingIcon={<Image src={AddIcon} width={12} height={12} />}
      onClick={(e) => {
        onInitTempTags(data?.id, data?.annotations)
        onClick(e)
      }}
    />
  )

  const tagsSelection = useMemo(
    () => (
      <div aria-hidden className="flex w-full justify-center " onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="px-3 py-1 h-8 rounded bg-neutral-100 hover:bg-neutral-200 text-[#2D2D2C] text-xs font-medium border border-[#E5E5E5]"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenTagsModal()
          }}
        >
          + Invoice
        </button>
      </div>
    ),
    [handleOpenTagsModal]
  )

  return (
    <tr
      onClick={onClickRow(data)}
      className={`hover:bg-gray-50 cursor-pointer ${
        data?.financialTransactionParent?.hash === parentHash && 'bg-gray-100'
      }`}
      style={{
        borderBottom: !isLastRow && '1px solid #CECECC',
        color: '#2D2D2C',
        fontWeight: 300,
        opacity: data.status === 'ignored' && tab !== 'ignored' ? 0.2 : 1,
        height: '60px'
      }}
    >
      {isChild ? null : (
        <td
          id={TransactionTableColumn.ACTIVITY}
          style={{
            // borderRight: '1px solid #CECECC',
            opacity: tab !== 'ignored' && isIgnored ? 0.2 : 1,
            backgroundColor: 'white',
            width: 72
          }}
          onMouseEnter={() => {
            onHoverParent(data?.financialTransactionParent?.hash)
          }}
          onMouseLeave={() => {
            onHoverParent('')
          }}
          rowSpan={batchSize}
        >
          <div className="flex justify-center flex-col items-center gap-1 p-2">
            <div className="flex">
              {data?.financialTransactionParent?.exportStatus === 'exported' && accountingIntegration?.integrationName && (
                <>
                  <Image
                    data-tip={`exported-xero-${data.financialTransactionParent.hash}`}
                    data-for={`exported-xero-${data.financialTransactionParent.hash}`}
                    src={
                      accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroIcon
                    }
                    height={16}
                    width={16}
                  />
                  <ReactTooltip
                    id={`exported-xero-${data.financialTransactionParent.hash}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg "
                  >
                    <p className="text-xs text-neutral-900 font-normal">
                      Exported to{' '}
                      {accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}.
                    </p>
                  </ReactTooltip>
                </>
              )}
              {data?.financialTransactionParent?.exportStatus === 'failed' && (
                <>
                  <Image
                    data-tip={`failed-to-generate-${data.financialTransactionParent.hash}`}
                    data-for={`failed-to-generate-${data.financialTransactionParent.hash}`}
                    src={WarningIcon}
                    height={16}
                    width={16}
                  />
                  <ReactTooltip
                    id={`failed-to-generate-${data.financialTransactionParent.hash}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg !flex items-center"
                    // delayHide={50}
                    // clickable
                  >
                    <p className="w-[270px] text-xs text-neutral-900 font-normal">
                      Failed to export. You may try again or contact us if this has happened more than once.
                    </p>
                    {/* <Button
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRetryExport()
                    }}
                  >
                    Try again
                  </Button> */}
                  </ReactTooltip>
                </>
              )}
              {data?.financialTransactionParent?.invoices?.length > 0 && (
                <>
                  <Image
                    data-tip={`imported-invoices-${data.financialTransactionParent.hash}`}
                    data-for={`imported-invoices-${data.financialTransactionParent.hash}`}
                    src={RequestIcon}
                    alt="request-icon"
                    height={16}
                    width={16}
                  />
                  <ReactTooltip
                    id={`imported-invoices-${data.financialTransactionParent.hash}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg !flex items-center"
                  >
                    <p className=" text-xs text-neutral-900 font-normal">Invoice imported from Request.</p>
                  </ReactTooltip>
                </>
              )}
            </div>
            {capitalizeFirst(data.financialTransactionParent.activity)}
            <button
              type="button"
              onClick={handleOnClickExternal(
                data.hash,
                supportedChains?.find((chain) => chain.id === data.blockchainId)?.blockExplorer
              )}
            >
              <SVGIcon name="ExternalLinkIcon" width={12} height={12} />
            </button>
          </div>
        </td>
      )}
      <td
        onClick={(e) => e.stopPropagation()}
        id="checkbox"
        className="py-3 cursor-default"
        style={{ borderRight: '1px solid #CECECC' }}
      >
        <div
          onClick={onClickCheckbox(data)}
          className="flex justify-center flex-col items-center gap-2 px-4 cursor-pointer"
        >
          <Checkbox
            disabled={data.status === 'ignored' && tab !== 'ignored'}
            onClick={onClickCheckbox(data)}
            onChange={(e) => e.stopPropagation()}
            isChecked={data.status === 'ignored' && tab !== 'ignored' ? false : Boolean(isChecked)}
            className="cursor-pointer relative w-4 h-4"
            classNameCheckbox="rounded accent-dashboard-main flex-shrink-0 w-4 h-4"
          />
        </div>
      </td>
      {/* DATE */}
      {txnTableColumns[TransactionTableColumn.DATE] && (
        <td id={TransactionTableColumn.DATE} className="py-3 pl-2">
          {getFormattedTime()}
        </td>
      )}
      {/* TYPE */}
      {txnTableColumns[TransactionTableColumn.TYPE] && (
        <td id={TransactionTableColumn.TYPE} className="pl-2 py-3">
          <div className="flex flex-col">
            <Typography variant="caption">{data?.typeDetail?.label}</Typography>
            {isFeatureEnabledForThisEnv && (
              <Tooltip
                arrow={false}
                position={ETooltipPosition.TOP}
                className="mb-[18px]"
                shortText={
                  <div className="flex items-center gap-x-1">
                    <Image
                      src={supportedChains?.filter((chain) => chain.id === data.blockchainId)[0]?.imageUrl}
                      width={12}
                      height={12}
                      className="rounded"
                    />
                    <p className="text-grey-700 font-inter text-[10px] font-medium">
                      {truncateText(supportedChains?.filter((chain) => chain.id === data.blockchainId)[0]?.name, 12)}
                    </p>
                  </div>
                }
                text={
                  <div className="flex items-center">
                    <p className="text-grey-700 font-inter text-[10px] font-medium">
                      {supportedChains?.filter((chain) => chain.id === data.blockchainId)[0]?.name}
                    </p>
                  </div>
                }
              />
            )}
          </div>
        </td>
      )}
      {/* FROM/TO */}
      {txnTableColumns[TransactionTableColumn.FROM_TO] && (
        <td id={TransactionTableColumn.FROM_TO} className="pl-2 py-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <p>from: </p>
              {data.fromContact?.name ? (
                <Tooltip
                  arrow={false}
                  position={ETooltipPosition.TOP}
                  className="mb-[18px]"
                  delayHide={50}
                  shortText={<p className="flex flex-row font-medium">{truncateText(data.fromContact?.name, 12)}</p>}
                  text={
                    <div className="flex flex-row items-center p-2 cursor-default min-w-max" style={{ fontSize: 14 }}>
                      <Image src={fromImageIcon} width={16} height={16} />
                      <div style={{ color: '#344054', fontWeight: 600, marginLeft: 2 }}>
                        {' '}
                        {capitalize(data.fromContact?.type)}{' '}
                      </div>
                      <div
                        className="ml-2 mr-2"
                        style={{ height: '18px', border: '1px solid #CECECC', transform: 'rotate(180deg)' }}
                      />
                      <div style={{ color: '#344054' }}>{data.fromContact?.name}</div>
                      <div
                        className="ml-2 mr-2"
                        style={{ height: '18px', border: '1px solid #CECECC', transform: 'rotate(180deg)' }}
                      />
                      {data?.fromAddress && (
                        <WalletAddress split={5} address={data.fromAddress} color="dark" styleVariant="medium">
                          <WalletAddress.Link address={data.fromAddress} options={supportedChains} />
                          <WalletAddress.Copy address={data.fromAddress} />
                        </WalletAddress>
                      )}
                    </div>
                  }
                />
              ) : (
                <div className="flex flex-row items-center">
                  <Tooltip
                    arrow={false}
                    position={ETooltipPosition.TOP}
                    className="mb-[18px]"
                    delayHide={50}
                    shortText={
                      <WalletAddress
                        split={5}
                        address={data.fromAddress}
                        variant="caption"
                        color="dark"
                        styleVariant="medium"
                      />
                    }
                    text={
                      <div className="flex flex-row items-center gap-4 px-2 py-[2px] cursor-default">
                        <div style={{ color: '#344054' }} className="text-sm ">
                          Unknown Address
                        </div>{' '}
                        <Button
                          size="sm"
                          color="tertiary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOnClickAddContact(data.fromAddress)
                          }}
                        >
                          Add To Contacts
                        </Button>
                      </div>
                    }
                  />
                  {data?.fromAddress && (
                    <div className="flex items-center gap-[6px]">
                      <WalletAddress.Link address={data.fromAddress} options={supportedChains} />
                      <WalletAddress.Copy address={data.fromAddress} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <p className="">to: </p>
              {data.proxyAddress ? (
                <Tooltip
                  arrow={false}
                  delayHide={50}
                  position={ETooltipPosition.TOP}
                  className="mb-[18px]"
                  shortText={
                    <div className="flex items-center h-6">
                      <Image
                        src={ProxyIcon}
                        width={16}
                        height={16}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`${selectedChain.blockExplorer}/address/${data?.proxyAddress}`, '_blank')
                        }}
                      />
                    </div>
                  }
                  text={
                    <div className="flex flex-row items-center p-2 cursor-default min-w-max" style={{ fontSize: 14 }}>
                      <Image src={ProxyIcon} width={20} />
                      <div style={{ color: '#344054', fontWeight: 600 }}> {capitalize('Proxy Contract')} </div>
                      <div
                        className="ml-2 mr-2"
                        style={{ height: '18px', border: '1px solid #CECECC', transform: 'rotate(180deg)' }}
                      />
                      <WalletAddress split={5} address={data.proxyAddress} color="dark" styleVariant="medium">
                        <WalletAddress.Link address={data.proxyAddress} options={supportedChains} />
                        <WalletAddress.Copy address={data.proxyAddress} />
                      </WalletAddress>
                    </div>
                  }
                />
              ) : null}
              {data.toContact?.name ? (
                <Tooltip
                  arrow={false}
                  position={ETooltipPosition.TOP}
                  delayHide={50}
                  className="mb-[18px]"
                  shortText={<div className="flex flex-row font-medium">{truncateText(data.toContact?.name, 12)}</div>}
                  text={
                    <div className="flex flex-row items-center p-2 cursor-default min-w-max" style={{ fontSize: 14 }}>
                      <Image src={toImageIcon} width={20} />
                      <div style={{ color: '#344054', fontWeight: 600 }}> {capitalize(data.toContact?.type)} </div>
                      <div
                        className="ml-2 mr-2"
                        style={{ height: '18px', border: '1px solid #CECECC', transform: 'rotate(180deg)' }}
                      />
                      <div style={{ color: '#344054' }}>{data.toContact?.name}</div>
                      <div
                        className="ml-2 mr-2"
                        style={{ height: '18px', border: '1px solid #CECECC', transform: 'rotate(180deg)' }}
                      />
                      <WalletAddress split={5} address={data.toAddress} color="dark" styleVariant="medium">
                        <WalletAddress.Link address={data.toAddress} options={supportedChains} />
                        <WalletAddress.Copy address={data.toAddress} />
                      </WalletAddress>
                    </div>
                  }
                />
              ) : (
                <div className="flex flex-row items-center">
                  {data.toAddress ? (
                    <>
                      <Tooltip
                        arrow={false}
                        delayHide={50}
                        position={ETooltipPosition.TOP}
                        className="mb-[18px]"
                        shortText={
                          <WalletAddress
                            split={5}
                            address={data.toAddress}
                            variant="caption"
                            color="dark"
                            styleVariant="medium"
                          />
                        }
                        text={
                          <div className="flex flex-row items-center gap-4 px-2 py-[2px] cursor-default">
                            <div style={{ color: '#344054' }} className="text-sm ">
                              Unknown Address
                            </div>{' '}
                            <Button
                              size="md"
                              color="tertiary"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOnClickAddContact(data.toAddress)
                              }}
                            >
                              Add To Contacts
                            </Button>
                          </div>
                        }
                      />
                      <div className="flex items-center gap-[6px]">
                        <WalletAddress.Link address={data.toAddress} options={supportedChains} />
                        <WalletAddress.Copy address={data.toAddress} />
                      </div>
                    </>
                  ) : (
                    <p className="pl-1">-</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </td>
      )}
      {/* IN */}
      {txnTableColumns[TransactionTableColumn.IN] && (
        <td id={TransactionTableColumn.IN} className="pl-2 py-3">
          {data.direction === 'incoming' ? (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              className="bottom-8"
              shortText={
                <>
                  <div className="flex flex-row items-center gap-2 text-[#0BA740] mb-[2px]">
                    <img alt="" src={data.cryptocurrency?.image?.small} width={14} height={14} />
                    {`${numToWord(data.cryptocurrencyAmount, CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 5)} ${
                      data.cryptocurrency?.symbol
                    }`}
                  </div>
                  <div className="text-[#777675]">
                    {data.status === 'syncing' || isWalletsSyncing ? (
                      <div className="pl-1">
                        <div className="skeleton skeleton-text mt-1" style={{ width: 30 }} />
                      </div>
                    ) : data.direction === 'incoming' && data.fiatCurrency ? (
                      `~ ${fiatCurrencySetting?.symbol}${currencyToWord(
                        data.fiatAmount,
                        CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                        countrySetting?.iso,
                        2
                      )} ${data.fiatCurrency?.toUpperCase()}`
                    ) : (
                      '-'
                    )}
                  </div>
                </>
              }
              text={
                data.status !== 'syncing' &&
                !isWalletsSyncing && (
                  <div className="text-sm p-2 text-[#0BA740]">
                    <p>{`${numToWord(data.cryptocurrencyAmount, countrySetting?.iso, decimal)} ${
                      data.cryptocurrency?.symbol
                    }`}</p>
                    <p className="text-[#777675] mt-[0.25rem]">{`${
                      fiatCurrencySetting?.symbol
                    }${formatNumberWithCommasBasedOnLocale(
                      data.fiatAmount,
                      countrySetting?.iso
                    )} ${data.fiatCurrency.toUpperCase()}`}</p>
                  </div>
                )
              }
            />
          ) : (
            <p className="pl-1">-</p>
          )}
        </td>
      )}
      {/* OUT */}
      {txnTableColumns[TransactionTableColumn.OUT] && (
        <td id={TransactionTableColumn.OUT} className="pl-2 py-3">
          {data.direction === 'outgoing' ? (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              className="bottom-8"
              shortText={
                <>
                  <div className="flex flex-row items-center gap-2 text-[#B41414] mb-[2px]">
                    <img alt="" src={data.cryptocurrency?.image.small} width={14} height={14} />
                    {`${numToWord(data.cryptocurrencyAmount, CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 5)} ${
                      data.cryptocurrency?.symbol
                    }`}
                  </div>
                  <div className="text-[#777675]">
                    {data.status === 'syncing' || isWalletsSyncing ? (
                      <div className="pl-1">
                        <div className="skeleton skeleton-text mt-1" style={{ width: 30 }} />
                      </div>
                    ) : data.fiatAmount ? (
                      `${fiatCurrencySetting?.symbol}${currencyToWord(
                        data.fiatAmount,
                        CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                        countrySetting?.iso,
                        2
                      )} ${data.fiatCurrency.toUpperCase()}`
                    ) : (
                      '-'
                    )}
                  </div>
                </>
              }
              text={
                data.status !== 'syncing' &&
                !isWalletsSyncing && (
                  <div className="text-sm p-2 text-[#B41414]">
                    <p>{`${numToWord(data.cryptocurrencyAmount, countrySetting?.iso, decimal)} ${
                      data.cryptocurrency?.symbol
                    }`}</p>
                    <p className="text-[#777675] mt-[0.25rem]">{`${
                      fiatCurrencySetting?.symbol
                    }${formatNumberWithCommasBasedOnLocale(
                      data.fiatAmount,
                      countrySetting?.iso
                    )} ${data.fiatCurrency.toUpperCase()}`}</p>
                  </div>
                )
              }
            />
          ) : (
            <p className="pl-1">-</p>
          )}
        </td>
      )}
      {/* GAIN_LOSS */}
      {txnTableColumns[TransactionTableColumn.GAIN_LOSS] && (
        <td
          id={TransactionTableColumn.GAIN_LOSS}
          className={`pl-2 py-3 ${
            data.status === 'syncing' || isWalletsSyncing ? '' : isPositive ? 'text-[#0BA740]' : 'text-[#B41414]'
          }`}
        >
          {data.gainLoss !== null ? (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              shortText={
                <div
                  className={`${
                    data.status === 'syncing' || isWalletsSyncing
                      ? ''
                      : isPositive
                      ? 'text-[#0BA740]'
                      : 'text-[#B41414]'
                  }`}
                >
                  {data.status === 'syncing' || isWalletsSyncing ? (
                    <div className="flex items-center flex-row pr-5 ">
                      <div className=" skeleton skeleton-text" />
                    </div>
                  ) : data.gainLoss === null ? null : (
                    <div className="flex items-center flex-row gap-1">
                      {!isZero && <Image src={isPositive ? ArrowGreen : ArrowRed} height={15} width={15} />}
                      {getFiatAmount()}
                    </div>
                  )}
                </div>
              }
              text={
                data.status !== 'syncing' &&
                !isWalletsSyncing &&
                data.gainLoss !== null &&
                data.gainLoss.toString().length > 8 && (
                  <div
                    className={`${
                      data.status === 'syncing' ? '' : isPositive ? 'text-[#0BA740]' : 'text-[#B41414]'
                    } p-2 text-sm`}
                  >
                    {`${currencyToWord(
                      data?.gainLoss,
                      CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                      countrySetting?.iso,
                      2
                    )} ${data.fiatCurrency.toUpperCase()}`}
                  </div>
                )
              }
            />
          ) : (
            <p className="pl-1">-</p>
          )}
        </td>
      )}
      {/* TAGS */}
      {txnTableColumns[TransactionTableColumn.TAGS] && isAnnotationEnabled && (
        <td
          id={TransactionTableColumn.TAGS}
          className={`py-3 pl-2 w-[200px] border-l-[1px] border-[#CECECC] ${
            data?.annotations?.length > 1 && 'w-[200px]'
          }`}
        >
          {tagsSelection}
        </td>
      )}
      {/* ACCOUNT */}
      {txnTableColumns[TransactionTableColumn.ACCOUNT] && (
        <td onClick={(e) => e.stopPropagation()} id={TransactionTableColumn.ACCOUNT} className="py-3 pl-2">
          <SelectDropdown
            data-tip={`tx-account-${data.id}`}
            data-for={`tx-account-${data.id}`}
            disableIndicator
            isSearchable
            menuIsOpen={isFetching ? false : undefined}
            onClick={(e) => {
              getDefaultMapping({ id: data.id, orgId: organizationId })
            }}
            styles={customCategoryStyles}
            className="w-[170px] 3xl:w-[150px]"
            onChange={handleChangeCategory}
            tabelRef={tabelRef}
            formatOptionLabel={FormatCoAOptionLabel}
            name="account"
            defaultValue={
              importedChartOfAccounts?.find((account) => account.value === data.correspondingChartOfAccount?.id) ?? {
                value: '',
                label: 'Select account'
              }
            }
            options={chartOfAccountsOptions}
            value={
              importedChartOfAccounts?.find((account) => account.value === data.correspondingChartOfAccount?.id) ?? {
                value: '',
                label: 'Select account'
              }
            }
          />
        </td>
      )}
    </tr>
  )
}

export const customCategoryStyles = {
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    color: '#2D2D2C',
    borderColor: !state.selectProps?.value?.value ? '#ed903c' : '#CECECC',
    minHeight: '34px',
    height: '34px',
    boxShadow: state.isFocused ? null : null,
    opacity: state.isDisabled ? 0.4 : 1
  }),
  option: (provided, { isFocused, isSelected, isDisabled, value }) => ({
    ...provided,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: isSelected ? '#F2F4F7' : isFocused ? '#F9FAFB' : '',
    color: '#2D2D2C',
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: value ? 400 : 600,
    cursor: 'pointer'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    height: '30px',
    padding: '0 6px'
  }),

  input: (provided, state) => ({
    ...provided,
    margin: '0px'
  }),
  indicatorSeparator: (state) => ({
    display: 'none'
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '32px'
  }),
  singleValue: (provided, state) => ({
    ...provided,
    top: 0,
    color: state.selectProps.value.value || state.selectProps.value.value === null ? '#2d2d2c' : '#b5b5b3',
    transform: 'none',
    paddingLeft: 4,
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    display: 'flex',
    gap: 4
  }),
  groupHeading: (provided) => ({
    ...provided,
    background: '#CECECC',
    padding: '4px 8px',
    color: '#2D2D2C',
    fontSize: 10,
    fontWeight: 550
  }),
  group: (provided) => ({
    ...provided,
    padding: '2px 0'
  }),
  menuList: (provided) => ({
    ...provided,
    ...scrollbarSelect,
    maxHeight: '180px'
  })
}

export default TxGridTableRow
