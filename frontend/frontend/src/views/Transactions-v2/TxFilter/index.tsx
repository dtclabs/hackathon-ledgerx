import { CategoryType } from '@/api-v2/categories-api'
import { ITxFitlerParams, TxType } from '@/api-v2/financial-tx-api'
import { GroupDropdown } from '@/components-v2/GroupDropDown'
import { IOption } from '@/components-v2/GroupDropDown/GroupDropdown'
import { SideModal } from '@/components-v2/SideModal'
import { useToken } from '@/hooks/useToken'
import { useAppSelector } from '@/state'
import { toShort } from '@/utils/toShort'
import { format } from 'date-fns'
import React, { useMemo, useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import ReactTooltip from 'react-tooltip'
import CheckBoxFilter from './CheckBoxFilter'
import DateRangeFilter, { IDateRange } from './DateRangeFilter'
import MultipleDropDown from './MultipleDropDown'
import ValueRangeFilter from './ValueRangeFilter'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { toast } from 'react-toastify'
import _ from 'lodash'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import RequestLogoIcon from '@/public/svg/logos/request-logo.svg'
import Image from 'next/legacy/image'
import { Badge2 } from '@/components-v2/molecules/Badge'
import LinkIcon from '@/public/svg/icons/link-icon.svg'
import { useGetAssetCryptocurrenciesQuery } from '@/api-v2/assets-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import Typography from '@/components-v2/atoms/Typography'
import ToggleFillter from './ToggleFillter'
import { OrgIntegration } from '@/slice/org-integration/org-integration-slice'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'

interface ITxFilter {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  filters: ITxFitlerParams
  setFilters: (filters: ITxFitlerParams) => void
  walletList: any[]
  contactList: any[]
  walletOptions: any[]
  chartOfAccountsList: any[]
  activitiesOptions: any[]
  setPage: (page: number) => void
  accountingIntegration: OrgIntegration
  tagOptions: any[]
}

const exportFilterOptions = [
  { label: 'Yes', value: ['exported'] },
  { label: 'No', value: ['exporting', 'unexported', 'failed'] }
]

const TxFilter: React.FC<ITxFilter> = ({
  setShowModal,
  showModal,
  filters,
  setFilters,
  walletList,
  contactList,
  chartOfAccountsList,
  walletOptions,
  activitiesOptions,
  setPage,
  accountingIntegration,
  tagOptions
}) => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))
  const { ...methods } = useFormContext()
  const organizationId = useOrganizationId()

  const { orgSuportedToken } = useToken(
    // TODO: DEPRECATE AFTER MULTICHAIN IS LIVE
    selectedChain?.id,
    walletList?.map((item) => item.id)
  )

  const { data: assetCryto } = useGetAssetCryptocurrenciesQuery(
    {
      orgId: organizationId,
      blockchainIds: []
    },
    { skip: !organizationId }
  )

  const cryptocurrenciesOptions = useMemo(
    () =>
      assetCryto?.length > 0
        ? assetCryto?.map((item) => ({
            id: item.publicId,
            value: item.publicId,
            name: item.name,
            symbol: item.symbol,
            image: item.image,
            isVerified: item.isVerified
          }))
        : [],
    [assetCryto]
  )

  const [isClear, setIsClear] = useState(false)

  // <--- Transform data
  const types = useMemo(
    () =>
      Object.keys(TxType).map((item) => ({
        value: TxType[item],
        label: TxType[item].replace('_', ' ')
      })),
    []
  )

  const parsedAddressList = useMemo(() => {
    const parsedWallets =
      walletList?.map((wallet) => ({
        value: wallet.address,
        name: wallet.name,
        address: wallet.address,
        chain: 'Ethereum'
      })) || []
    const parsedContacts = []
    contactList?.forEach((contact) => {
      contact.recipientAddresses.forEach((address) => {
        parsedContacts.push({
          value: address.address,
          name: contact.contactName,
          address: address.address,
          chain: address.blockchainId
        })
      })
    })
    return [...parsedWallets, ...parsedContacts]
  }, [contactList, walletList])

  const chartOfAccounts = useMemo(
    () =>
      chartOfAccountsList
        .filter((item) => item?.options)
        .map((item) => ({
          groupLabel: item.label,
          options: item.options
        })),
    [chartOfAccountsList]
  )

  //  Transform data --->

  const assetElement = (asset) => (
    <div className="flex items-center justify-between w-full pr-2">
      <div className="flex items-center gap-2">
        <img src={asset.image.small} alt="token" width={16} height={16} />
        <Typography color="dark" variant="body2">
          {asset.name}
        </Typography>
      </div>
      <div>
        <div data-tip={asset.value} data-for={asset.value} className="text-sm text-dashboard-main leading-4">
          {toShort(asset.tokenAddress, 5, 4)}
        </div>
        <ReactTooltip
          id={asset.value}
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg"
        >
          {asset.tokenAddress}
        </ReactTooltip>
      </div>
    </div>
  )

  const addressElement = (address) => (
    <div className="flex items-center justify-between w-full pr-2 truncate">
      <div className="flex flex-col gap-[2px] text-left truncate">
        <Typography color="primary" variant="body2" styleVariant="medium" classNames="truncate">
          {address.name}
        </Typography>
        <div
          data-tip={address.value}
          data-for={address.value}
          className="text-xs text-dashboard-sub leading-4 font-normal w-fit"
        >
          {toShort(address.address, 5, 4)}
        </div>
      </div>
      <div className="flex">
        <Typography classNames="!text-dashboard-sub capitalize" variant="caption">
          {address.chain}
        </Typography>
      </div>
      <ReactTooltip
        id={address.value}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        className="!opacity-100 !rounded-lg"
      >
        {address.address}
      </ReactTooltip>
    </div>
  )

  const tagsElement = (tag) => (
    <Typography color="primary" variant="body2" styleVariant="medium" classNames="truncate">
      {tag.label}
    </Typography>
  )

  const handleChangeDate = (date: IDateRange) => {
    if (date.startDate && date.endDate) {
      methods.setValue('startTime', date.startDate)
      methods.setValue('endTime', date.endDate)
    }
  }

  const handleSelectWallets = (walletAddresses: IOption[]) => {
    methods.setValue(
      'walletAddresses',
      walletAddresses.map((item) => item.value)
    )
  }

  const handleSelectCategories = (category: IOption[]) => {
    methods.setValue(
      'correspondingChartOfAccountIds',
      category.map((item) => item.value)
    )
  }

  const onSubmit = (data: ITxFitlerParams) => {
    setPage(0)
    setShowModal(false)
    setFilters({
      ...filters,
      ...data,
      startTime: data?.startTime ? format(new Date(data?.startTime), 'yyyy-MM-dd') : '',
      endTime: data?.endTime ? format(new Date(data?.endTime), 'yyyy-MM-dd') : ''
    })
  }

  const handleClear = () => {
    setPage(0)
    toast.success('Filter cleared')
    setFilters({
      ...filters,
      walletAddresses: [],
      startTime: null,
      endTime: null,
      activities: [],
      childTypes: [],
      fromAddresses: [],
      toAddresses: [],
      annotations: [],
      assetIds: [],
      toFiatAmount: '',
      fromFiatAmount: '',
      categories: [],
      correspondingChartOfAccountIds: [],
      exportStatuses: [],
      invoices: []
    })
    methods.reset({
      walletAddresses: [],
      startTime: null,
      endTime: null,
      activities: [],
      childTypes: [],
      fromAddresses: [],
      toAddresses: [],
      annotations: [],
      assetIds: [],
      toFiatAmount: '',
      fromFiatAmount: '',
      categories: [],
      correspondingChartOfAccountIds: [],
      exportStatuses: [],
      invoices: []
    })
    setIsClear(true)
  }

  useEffect(() => {
    if (isClear) {
      setIsClear(false)
    }
  }, [isClear])

  return (
    <SideModal
      title="Filter"
      setShowModal={setShowModal}
      showModal={showModal}
      primaryCTA={{ onClick: methods.handleSubmit(onSubmit) }}
      secondaryCTA={{ onClick: handleClear }}
    >
      {accountingIntegration?.integrationName && (
        <div className="flex flex-col gap-4">
          <div className="text-sm font-semibold leading-4 flex items-center gap-2">
            <Image
              src={
                accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroLogoIcon
              }
              alt="Integration Logo"
              width={20}
              height={20}
            />
            <Typography>Exported to</Typography>
            <Badge2 variant="rounded" color="success">
              <Badge2.Icon icon={LinkIcon} />
              <Badge2.Label>
                {accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}
              </Badge2.Label>
            </Badge2>
          </div>

          <CheckBoxFilter
            name="exportStatuses"
            options={exportFilterOptions}
            isReset={!showModal || isClear}
            selection={
              !filters?.exportStatuses?.length
                ? []
                : exportFilterOptions.filter((item) => _.difference(filters?.exportStatuses, item.value).length === 0)
            }
            isSignleSelect
          />
        </div>
      )}
      {isFeatureEnabledForThisEnv && (
        <div className={`flex flex-col gap-4 ${accountingIntegration?.integrationName && 'mt-7'}`}>
          <div className="text-sm font-semibold leading-4 flex items-center gap-2">
            <Image src={RequestLogoIcon} width={20} height={20} />
            <p>Invoice available</p>
            <ToggleFillter
              name="invoices"
              value="not_null"
              isReset={!showModal || isClear}
              selection={filters?.invoices?.[0]}
            />
          </div>
        </div>
      )}
      {/* Wallet */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Wallets
        </Typography>
        <GroupDropdown
          options={walletOptions}
          name="walletAddresses"
          title="Wallet"
          selection={
            filters?.walletAddresses?.map((item) => ({
              value: item,
              label: item
            })) || []
          }
          setSelection={handleSelectWallets}
          widthBtn="w-full"
          dropdownWidth="w-full"
          isReset={!showModal || isClear}
          dropdownHeight="max-h-[320px]"
        />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Date Range
        </Typography>
        <DateRangeFilter
          selection={{
            startDate: filters?.startTime ? new Date(filters?.startTime) : null,
            endDate: filters?.endTime ? new Date(filters?.endTime) : null
          }}
          setSelection={handleChangeDate}
          widthBtn="w-full"
          dropdownWidth="w-full"
          isReset={!showModal || isClear}
          onClear={() => {
            methods.setValue('startTime', null)
            methods.setValue('endTime', null)
          }}
        />
      </div>

      {/* Activities */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Activities
        </Typography>
        <CheckBoxFilter
          name="activities"
          options={activitiesOptions}
          isReset={!showModal || isClear}
          selection={
            filters?.activities?.map((item) => ({
              value: item,
              label: item
            })) || []
          }
        />
      </div>

      {/* Type */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Transaction Types
        </Typography>
        <CheckBoxFilter
          name="childTypes"
          options={types}
          isReset={!showModal || isClear}
          selection={
            filters?.childTypes?.map((item) => ({
              value: item,
              label: item
            })) || []
          }
        />
      </div>

      {/* From */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          From
        </Typography>
        <MultipleDropDown
          options={parsedAddressList}
          name="fromAddresses"
          title="Wallet/Address"
          suffix="Wallets/Addresses"
          selection={
            filters?.fromAddresses?.map((item) => ({
              value: item
            })) || []
          }
          setSelection={(fromAddresses) => {
            methods.setValue(
              'fromAddresses',
              fromAddresses.map((item) => item.value)
            )
          }}
          widthBtn="w-full"
          dropdownWidth="w-full"
          element={addressElement}
          isReset={!showModal || isClear}
          dropdownHeight="max-h-[280px]"
          onClear={() => {
            methods.setValue('fromAddresses', null)
          }}
        />
      </div>

      {/* To */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          To
        </Typography>
        <MultipleDropDown
          options={parsedAddressList}
          name="toAddresses"
          title="Wallet/Address"
          suffix="Wallets/Addresses"
          selection={
            filters?.toAddresses?.map((item) => ({
              value: item
            })) || []
          }
          setSelection={(toAddresses) => {
            methods.setValue(
              'toAddresses',
              toAddresses.map((item) => item.value)
            )
          }}
          widthBtn="w-full"
          dropdownWidth="w-full"
          element={addressElement}
          isReset={!showModal || isClear}
          dropdownHeight="max-h-[280px]"
          onClear={() => {
            methods.setValue('toAddresses', null)
          }}
        />
      </div>
      {/* Tags */}
      {isAnnotationEnabled && (
        <div className="flex flex-col gap-4 mt-8">
          <Typography styleVariant="semibold" variant="body2">
            Tags
          </Typography>
          <MultipleDropDown
            options={tagOptions}
            name="annotations"
            title="Tag"
            selection={
              filters?.annotations?.map((item) => ({
                value: item
              })) || []
            }
            setSelection={(_tags) => {
              methods.setValue(
                'annotations',
                _tags.map((item) => item.value)
              )
            }}
            widthBtn="w-full"
            dropdownWidth="w-full"
            element={tagsElement}
            isReset={!showModal || isClear}
            dropdownHeight="max-h-[280px]"
            onClear={() => {
              methods.setValue('annotations', null)
            }}
          />
        </div>
      )}
      {/* Assets */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Assets
        </Typography>
        <MultipleDropDown
          options={isFeatureEnabledForThisEnv ? cryptocurrenciesOptions : _.uniqBy(orgSuportedToken, 'id')}
          // options={orgSuportedToken}
          name="assetIds"
          title="Asset"
          selection={
            filters?.assetIds?.map((item) => ({
              value: item
            })) || []
          }
          setSelection={(assetIds) => {
            methods.setValue(
              'assetIds',
              assetIds.map((item) => item.value)
            )
          }}
          widthBtn="w-full"
          dropdownWidth="w-full"
          element={assetElement}
          isReset={!showModal || isClear}
          dropdownHeight="max-h-[320px]"
          onClear={() => {
            methods.setValue('assetIds', null)
          }}
        />
      </div>

      {/* Value Range */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Transaction Value Range
        </Typography>
        <ValueRangeFilter
          selection={{
            fromFiatAmount: filters?.fromFiatAmount,
            toFiatAmount: filters?.toFiatAmount
          }}
          isReset={!showModal || isClear}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-4 mt-8">
        <Typography styleVariant="semibold" variant="body2">
          Chart of accounts
        </Typography>
        <GroupDropdown
          options={chartOfAccounts}
          title="Account"
          name="correspondingChartOfAccountIds"
          selection={
            (filters?.correspondingChartOfAccountIds?.length > 0 &&
              (filters?.correspondingChartOfAccountIds as any[])?.map((item) => ({
                value: item,
                label: item
              }))) ||
            []
          }
          setSelection={handleSelectCategories}
          widthBtn="w-full"
          dropdownWidth="w-full"
          isReset={!showModal || isClear}
          position="top"
          dropdownHeight="max-h-[320px]"
        />
      </div>
    </SideModal>
  )
}

export default TxFilter
