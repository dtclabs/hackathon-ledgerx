import { useState, useMemo, useEffect } from 'react'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { CustomMappingModal } from './components/CustomMappingModal'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import TabItem from '@/components/TabsComponent/TabItem'
import { DefaultTransactionsTabs } from './Tabs/DefaultTransactions'
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import { useAppSelector } from '@/state'
import { selectAvailableAccounts } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import {
  ChartOfAccountMappingType,
  useFakeBulkCreateChartOfAccountsMappingMutation,
  useFakeBulkDeleteChartOfAccountsMappingMutation,
  useFakeBulkEditChartOfAccountsMappingMutation,
  useFakeBulkUpdateChartOfAccountsMappingMutation,
  useGetChartOfAccountsMappingQuery,
  useLazyGetChartOfAccountsMappingCountQuery,
  useUpdateChartOfAccountMappingMutation
} from '@/api-v2/chart-of-accounts-mapping'
import { useLazyGetContactsQuery } from '@/slice/contacts/contacts-api'
import { toast } from 'react-toastify'
import _ from 'lodash'
import { useGetWalletCryptocurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import { WalletAssetsTab } from './Tabs/WalletsAssets'
import { ContactsTab } from './Tabs/Contacts'
import Typography from '@/components-v2/atoms/Typography'
import { MappingUpdateConfirmModal } from './components/MappingUpdateConfirmModal'

const DefaultMappingView = () => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const availableAccounts = useAppSelector(selectAvailableAccounts)
  const supportedChains = useAppSelector(supportedChainsSelector)

  const customMappingModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const mappingUpdateConfirmModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const [activeTab, setActiveTab] = useState<string>('defaults')
  const [selectedMapping, setSelectedMapping] = useState(null)
  const [tempMapping, setTempMapping] = useState<{
    id: string
    isOverwrite?: boolean
    numberOfMappedTxns: number
    data: { value: string; label: string; id: string; name: string; code: string }
  }>(null)

  const { data: coa } = useGetChartOfAccountsQuery(
    { organizationId, params: { status: ['ACTIVE'] } },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const { data: wallets, isLoading: isWalletsLoading } = useGetWalletsQuery(
    {
      orgId: organizationId,
      params: { size: 999 }
    },
    { skip: !organizationId }
  )

  const { data: chartOfAccountsMapping, refetch } = useGetChartOfAccountsMappingQuery(
    {
      organizationId,
      params: {
        chartOfAccountIds: ['']
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const { data: walletCryptocurrencies, isLoading: walletCryptocurrenciesLoading } = useGetWalletCryptocurrenciesQuery(
    {
      organizationId,
      blockchainIds: supportedChains?.map((item) => item.id),
      walletIds: wallets?.items?.map((item) => item.id)
    },
    { skip: !organizationId || !wallets?.items?.length || !supportedChains?.length }
  )

  const [getMappingCount, { isLoading }] = useLazyGetChartOfAccountsMappingCountQuery()

  const [triggerUpdateCoAMapping, updateCoAMappingResponse] = useUpdateChartOfAccountMappingMutation()
  const [triggerBulkCreateMapping, bulkCreateMappingResponse] = useFakeBulkCreateChartOfAccountsMappingMutation()
  const [triggerBulkUpdateMapping, bulkUpdateMappingResponse] = useFakeBulkUpdateChartOfAccountsMappingMutation()
  const [triggerBulkDeleteMapping, bulkDeleteMappingResponse] = useFakeBulkDeleteChartOfAccountsMappingMutation()
  const [triggerBulkEditMapping, bulkEditMappingResponse] = useFakeBulkEditChartOfAccountsMappingMutation()
  const [triggerContactsRefetch, contactsApi] = useLazyGetContactsQuery()

  // Parsed data
  const parsedChartOfAccounts = useMemo(() => {
    const MAPPED_CHART_OF_ACCOUNTS = {}
    if (chartOfAccountsMapping?.length > 0) {
      chartOfAccountsMapping.forEach((accountMapping) => {
        if (accountMapping?.chartOfAccount) {
          MAPPED_CHART_OF_ACCOUNTS[accountMapping?.chartOfAccount.id] = {
            ...accountMapping
          }
        }
      })
    }

    const groupedAccounts = {}
    availableAccounts?.forEach((item) => {
      const mappedAccount = MAPPED_CHART_OF_ACCOUNTS[item.id]

      if (mappedAccount) {
        groupedAccounts[item.type.toUpperCase().trim()] = groupedAccounts[item.type.toUpperCase().trim()]
          ? [
              ...groupedAccounts[item.type.toUpperCase().trim()],
              {
                ...item,
                value: item.id,
                label: item.label,
                code: item.code,
                name: item.name,
                relatedMapping: { id: mappedAccount?.id, type: mappedAccount?.type }
              }
            ]
          : [
              {
                ...item,
                value: item.id,
                label: item.label,
                code: item.code,
                name: item.name,
                relatedMapping: { id: mappedAccount?.id, type: mappedAccount?.type }
              }
            ]
      } else {
        groupedAccounts[item.type.toUpperCase().trim()] = groupedAccounts[item.type.toUpperCase().trim()]
          ? [
              ...groupedAccounts[item.type.toUpperCase().trim()],
              {
                ...item,
                value: item.id,
                label: item.label,
                code: item.code,
                name: item.name
              }
            ]
          : [
              {
                ...item,
                value: item.id,
                label: item.label,
                code: item.code,
                name: item.name
              }
            ]
      }
    })

    const accountOptions = Object.entries(groupedAccounts)
      .map(([key, options]) => ({
        label: key,
        options
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return accountOptions
  }, [availableAccounts, chartOfAccountsMapping])

  const parsedAssets = useMemo(() => {
    const parsedData = {}
    if (walletCryptocurrencies) {
      Object.entries(walletCryptocurrencies).forEach(([key, assets]: any) => {
        const uniqAssets = _.uniqBy(assets, 'publicId')
        parsedData[key] = uniqAssets?.length
          ? uniqAssets.map((asset: any) => ({
              id: asset.publicId,
              symbol: asset.symbol,
              image: asset.image.small
            }))
          : []
      })
    }
    return parsedData
  }, [walletCryptocurrencies])

  const parsedWalletChartOfAccountsMapping = useMemo(() => {
    const groupedData = {}
    const filteredData = chartOfAccountsMapping?.filter((item) => item.type === 'wallet') ?? []
    for (const data of filteredData) {
      if (groupedData[data.walletId]) {
        groupedData[data.walletId].push(data)
      } else {
        groupedData[data.walletId] = [data]
      }
    }
    return groupedData
  }, [chartOfAccountsMapping])

  useEffect(() => {
    if (organizationId) {
      triggerContactsRefetch({ orgId: organizationId, params: { size: 999999 } })
    }
  }, [organizationId])

  // Handle errors toast
  useEffect(() => {
    if (updateCoAMappingResponse.isSuccess) {
      mappingUpdateConfirmModalProvider.methods.setIsOpen(false)
      toast.success(
        tempMapping?.isOverwrite
          ? 'Successfully updated mapping. Existing transactions are being updated.'
          : 'Successfully updated mapping',
        { position: 'top-right' }
      )
      setTempMapping(null)
    } else if (updateCoAMappingResponse.isError) {
      mappingUpdateConfirmModalProvider.methods.setIsOpen(false)
      toast.error(updateCoAMappingResponse?.error?.data?.message, { position: 'top-right' })
      setTempMapping(null)
    }
  }, [updateCoAMappingResponse])

  useEffect(() => {
    if (bulkCreateMappingResponse.isSuccess) {
      toast.success('Successfully added custom mapping', { position: 'top-right' })
    } else if (bulkCreateMappingResponse.isError) {
      toast.error(bulkCreateMappingResponse?.error, { position: 'top-right' })
    }
  }, [bulkCreateMappingResponse])

  useEffect(() => {
    if (bulkEditMappingResponse.isSuccess) {
      toast.success('Successfully edited custom mapping', { position: 'top-right' })
    } else if (bulkEditMappingResponse.isError) {
      toast.error(bulkEditMappingResponse?.error, { position: 'top-right' })
    }
  }, [bulkEditMappingResponse])

  useEffect(() => {
    if (bulkUpdateMappingResponse.isSuccess) {
      toast.success('Successfully updated custom mapping', { position: 'top-right' })
    } else if (bulkUpdateMappingResponse.isError) {
      toast.error(bulkUpdateMappingResponse?.error, { position: 'top-right' })
    }
  }, [bulkUpdateMappingResponse])

  useEffect(() => {
    if (bulkDeleteMappingResponse.isSuccess) {
      toast.success('Successfully removed custom mapping', { position: 'top-right' })
    } else if (bulkDeleteMappingResponse.isError) {
      toast.error(bulkDeleteMappingResponse?.error, { position: 'top-right' })
    }
  }, [bulkDeleteMappingResponse])

  // function
  const handleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleOpenCustomMappingModal = () => {
    customMappingModalProvider.methods.setIsOpen(true)
  }

  const handleRedirectToWallets = () => {
    router.push(`/${organizationId}/wallets`)
  }

  const handleChangeAccount = async (id, _data) => {
    const { data: numberOfMappedTxns, isSuccess } = await getMappingCount({ organizationId, id })
    if (numberOfMappedTxns > 0 && isSuccess) {
      setTempMapping({
        id,
        numberOfMappedTxns,
        data: _data
      })
      mappingUpdateConfirmModalProvider.methods.setIsOpen(true)
    } else {
      handleChangeSingleAccount(id, _data)
    }
  }

  const handleChangeSingleAccount = (id, _data, toOverwriteManualData = false) => {
    triggerUpdateCoAMapping({
      organizationId,
      id,
      body: {
        chartOfAccountId: _data.value ?? 'null',
        toOverwriteManualData
      },
      params: {
        chartOfAccountIds: ['']
      },
      optimisticAccount: { id: _data?.id, name: _data?.name, code: _data?.code }
    })
  }

  const handleOverrideMapping = () => {
    handleChangeSingleAccount(tempMapping.id, tempMapping.data, true)
    setTempMapping({ ...tempMapping, isOverwrite: true })
  }

  const handleUpdateWithoutOverride = () => {
    handleChangeSingleAccount(tempMapping.id, tempMapping.data)
  }

  const handleBulkCreateMapping = (_asset, _account) => {
    const parsedData = _asset?.map((asset) => ({
      cryptocurrencyId: asset.id,
      chartOfAccountId: _account?.value,
      type: ChartOfAccountMappingType.WALLET,
      walletId: selectedMapping?.walletId
    }))
    triggerBulkCreateMapping({
      organizationId,
      data: parsedData
    })
  }

  const tabCount = useMemo(() => {
    const recipientMap = {}
    const tabCountMap = {
      defaults: 0,
      wallets: 0,
      contacts: 0
    }

    tabCountMap.wallets = wallets?.totalItems
    chartOfAccountsMapping?.forEach((item) => {
      if (item?.type === 'recipient') {
        // @ts-ignore
        recipientMap[item.recipientId] = true
      } else if (item?.type !== 'wallet') {
        tabCountMap.defaults += 1
      }
    })
    tabCountMap.contacts = Object.keys(recipientMap).length
    return tabCountMap
  }, [wallets?.totalItems, chartOfAccountsMapping])

  const defaultMappingTabs = [
    {
      key: 'defaults',
      name: 'Defaults',
      active: true,
      count: tabCount.defaults
    },
    {
      key: 'wallets',
      name: 'Wallets & Assets',
      active: false,
      count: tabCount.wallets
    },
    {
      key: 'contacts',
      name: 'Contacts',
      active: false,
      count: tabCount.contacts
    }
  ]

  const handleBulkChangeAccount = (ids: string[], _data) => {
    triggerBulkUpdateMapping({
      organizationId,
      ids,
      params: {
        chartOfAccountIds: ['']
      },
      chartOfAccountId: _data?.id,
      optimisticAccount: { id: _data?.id, name: _data?.name, code: _data?.code }
    })
  }

  const handleRemoveMapping = (ids: string[]) => {
    triggerBulkDeleteMapping({
      organizationId,
      data: ids
    })
  }

  const handleCustomMapping = (_assets, _account, previousState) => {
    const mappedData = []

    const addedAssets = _.differenceWith(_assets, previousState.assets, _.isEqual)
    const removedAssetIds = _.differenceWith(previousState.assets, _assets, _.isEqual).map((item) => item.id)
    const updatedAssetIds = _.intersectionWith(_assets, previousState.assets, _.isEqual).map((item) => item.id)

    if (addedAssets?.length) {
      addedAssets.forEach((asset) => {
        mappedData.push({
          action: 'add',
          body: {
            cryptocurrencyId: asset.id,
            chartOfAccountId: _account?.value,
            type: ChartOfAccountMappingType.WALLET,
            walletId: selectedMapping?.walletId
          }
        })
      })
    }
    if (removedAssetIds?.length) {
      parsedWalletChartOfAccountsMapping?.[selectedMapping?.walletId]
        ?.filter((item) => removedAssetIds.includes(item.cryptocurrencyId))
        .forEach((item) => {
          mappedData.push({
            action: 'remove',
            body: {
              id: item.id
            }
          })
        })
    }
    if (updatedAssetIds?.length && _account.value !== previousState?.accountId) {
      parsedWalletChartOfAccountsMapping?.[selectedMapping?.walletId]
        ?.filter((item) => updatedAssetIds.includes(item.cryptocurrencyId))
        .forEach((item) => {
          mappedData.push({
            action: 'edit',
            body: {
              id: item.id,
              chartOfAccountId: _account.value
            }
          })
        })
    }
    triggerBulkEditMapping({ organizationId, data: mappedData })
  }

  return (
    <>
      <Header>
        <Header.Left>
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] p-[0.5rem]"
              leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
              onClick={() => router.back()}
            />

            <div className="pl-5">
              <Header.Left.Title>Account Rules</Header.Left.Title>
              <Typography color="secondary" variant="body1">
                Automate the tagging of your transactions for easy reconciliation.
              </Typography>
            </div>
          </div>
        </Header.Left>
      </Header>

      <View.Content>
        <div className="overflow-x-hidden">
          <UnderlineTabs
            tabs={defaultMappingTabs}
            active={activeTab}
            setActive={handleChangeTab}
            classNameBtn="font-semibold text-sm px-6 py-[10px]"
            wrapperClassName="border-b-[1px] border-grey-200 mx-6"
          >
            <TabItem key="defaults">
              <DefaultTransactionsTabs
                parsedChartOfAccounts={parsedChartOfAccounts}
                handleChangeAccount={handleChangeAccount}
                chartOfAccountsMapping={chartOfAccountsMapping}
              />
            </TabItem>
            <TabItem key="wallets">
              <WalletAssetsTab
                setSelectedMapping={setSelectedMapping}
                walletCryptocurrenciesLoading={walletCryptocurrenciesLoading}
                wallets={wallets}
                parsedWalletChartOfAccountsMapping={parsedWalletChartOfAccountsMapping}
                isWalletsLoading={isWalletsLoading}
                parsedAssets={parsedAssets}
                parsedChartOfAccounts={parsedChartOfAccounts}
                handleRedirectToWallets={handleRedirectToWallets}
                handleRemoveMapping={handleRemoveMapping}
                handleOpenCustomMappingModal={handleOpenCustomMappingModal}
                handleBulkChangeAccount={handleBulkChangeAccount}
                handleChangeAccount={handleChangeAccount}
              />
            </TabItem>
            <TabItem key="contacts">
              <ContactsTab
                contacts={contactsApi?.data?.items}
                isLoading={contactsApi?.isLoading}
                organizationId={organizationId}
                parsedChartOfAccounts={parsedChartOfAccounts}
                onChangeAccount={handleChangeAccount}
                chartOfAccountsMapping={chartOfAccountsMapping}
              />
            </TabItem>
          </UnderlineTabs>
        </div>
      </View.Content>
      <CustomMappingModal
        provider={customMappingModalProvider}
        assets={parsedAssets?.[selectedMapping?.walletId]}
        options={parsedChartOfAccounts}
        mappedAssets={selectedMapping?.mappedAssets}
        previousState={{
          assets: selectedMapping?.assets,
          account: availableAccounts?.find((account) => account.id === selectedMapping?.chartOfAccount?.id)
        }}
        onConfirm={selectedMapping?.assets?.length ? handleCustomMapping : handleBulkCreateMapping}
        importedAccount={availableAccounts}
      />
      <MappingUpdateConfirmModal
        numOfTxns={tempMapping?.numberOfMappedTxns}
        provider={mappingUpdateConfirmModalProvider}
        onConfirm={handleOverrideMapping}
        onCancel={handleUpdateWithoutOverride}
      />
    </>
  )
}

export default DefaultMappingView
