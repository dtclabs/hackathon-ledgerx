import { useMemo, FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import FeesSection from '../../components/FeesSection'
import WalletSection from '../../components/WalletSection'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import MoneyIcon from '@/public/svg/icons/blue-icon-money.svg'
import TextField from '@/components/TextField/TextField'
import { debounce } from 'lodash'
import { Pagination } from '@/components-v2/molecules/Pagination'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'

interface IProps {
  parsedChartOfAccounts: any
  handleChangeAccount: any
  wallets: any
  parsedWalletChartOfAccountsMapping: any
  handleOpenCustomMappingModal: any
  parsedAssets: any
  handleBulkChangeAccount: any
  handleRemoveMapping: any
  setSelectedMapping: any
  walletCryptocurrenciesLoading: any
  isWalletsLoading: any
  handleRedirectToWallets: any
}

const WalletAssets: FC<IProps> = ({
  parsedChartOfAccounts,
  handleChangeAccount,
  wallets,
  parsedWalletChartOfAccountsMapping,
  handleOpenCustomMappingModal,
  parsedAssets,
  handleBulkChangeAccount,
  handleRemoveMapping,
  setSelectedMapping,
  walletCryptocurrenciesLoading,
  isWalletsLoading,
  handleRedirectToWallets
}) => {
  const chartOfAccounts = useAppSelector(chartOfAccountsSelector)
  const [search, setSearch] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState<number>(10) // setting default items per page 5
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(null)
  const [pageData, setPageData] = useState([]) // setting paginated data from all the data received from server
  const showBanner = useAppSelector(showBannerSelector)
  const handleOnChangeSearch = (e: any) => {
    setSearch(e?.target?.value)
    setCurrentPage(1)
  }

  const filteredWalletIds = useMemo(
    () =>
      wallets?.items
        .filter(
          (wallet) =>
            wallet?.name.toLowerCase().includes(search.toLowerCase()) ||
            wallet?.address.toLowerCase().includes(search.toLowerCase())
        )
        .map((wallet) => wallet.id),
    [search, wallets?.items]
  )
  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  function onChangePageSizeHandler(e) {
    setItemsPerPage(e.target.value)
    setCurrentPage(1)
  }
  function onClickFirstPageHandler() {
    setCurrentPage(1)
  }
  function onClickLastPageHandler() {
    setCurrentPage(totalPages)
  }

  function onPageChangePageHandler(page: number) {
    setCurrentPage(page)
  }

  const defaultPageSizeOptions = [5, 10, 20]
  useEffect(() => {
    const mapWalletToData =
      Object.entries(parsedWalletChartOfAccountsMapping).length > 0
        ? Object.entries(parsedWalletChartOfAccountsMapping).filter(([id, objects]) => filteredWalletIds?.includes(id))
        : []
    setTotalPages(Math.ceil(mapWalletToData.length / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const newData = mapWalletToData.slice(startIndex, endIndex)
    setPageData(newData)
  }, [currentPage, parsedWalletChartOfAccountsMapping, itemsPerPage, search, filteredWalletIds])

  const renderWalletMapping = useMemo(
    () =>
      pageData
        .filter(([key, data]: [string, any]) => filteredWalletIds?.length && filteredWalletIds?.includes(key))
        .map(([key, data]: [string, any]) => {
          const mappedAssets = {}
          const mappedIds = {}
          const childData = {}
          const defaultData = data.find((item) => !item.cryptocurrencyId)
          const wallet = wallets?.items?.find((item) => item.id === key)

          data
            .filter((item) => item.id !== defaultData.id)
            .forEach((item) => {
              if (childData[item?.chartOfAccount?.id]) {
                childData[item?.chartOfAccount?.id].push(item)
              } else {
                childData[item?.chartOfAccount?.id] = [item]
              }

              if (mappedIds[item?.chartOfAccount?.id]) {
                mappedIds[item?.chartOfAccount?.id].push(item.id)
              } else {
                mappedIds[item?.chartOfAccount?.id] = [item.id]
              }

              if (mappedAssets[item?.chartOfAccount?.id]) {
                mappedAssets[item?.chartOfAccount?.id].push(item?.cryptocurrencyId)
              } else {
                mappedAssets[item?.chartOfAccount?.id] = [item?.cryptocurrencyId]
              }
            })

          return (
            <div key={`group-mapping-${defaultData?.id}`} className="flex flex-col gap-4">
              <FeesSection
                key={defaultData.id}
                title={wallet?.name || 'Wallet'}
                subtitle="All assets in this wallet will be mapped to this account by default, unless mapped otherwise."
                options={parsedChartOfAccounts}
                onChangeAccount={handleChangeAccount}
                account={defaultData?.chartOfAccount?.id}
                selectedAccountOption={chartOfAccounts?.find(
                  (account) => account.value === defaultData?.chartOfAccount?.id
                )}
                mapping={{
                  id: defaultData?.id,
                  type: defaultData?.type
                }}
                onClickMapping={() => {
                  setSelectedMapping({
                    ...defaultData,
                    chartOfAccount: null,
                    mappedAssets
                  })
                  handleOpenCustomMappingModal()
                }}
                resolveMapping
                disableMapping={!defaultData?.chartOfAccount || !parsedAssets?.[wallet?.id]?.length}
                tooltipCopy={!parsedAssets?.[wallet?.id]?.length ? 'This wallet does not have any asset' : ''}
              />
              {Object.entries(childData).map(([chartOfAccountId, childValue]: [string, any]) => (
                <WalletSection
                  key={`${chartOfAccountId}-${childValue[0].id}`}
                  options={parsedChartOfAccounts}
                  mappedAssets={parsedAssets?.[wallet?.id]?.filter((asset) =>
                    mappedAssets[chartOfAccountId].includes(asset.id)
                  )}
                  selectedAccountOption={chartOfAccounts?.find(
                    (account) => account.value === childValue[0]?.chartOfAccount?.id
                  )}
                  mappingIds={mappedIds[chartOfAccountId]}
                  account={childValue[0]?.chartOfAccount?.id}
                  onChangeAccount={handleBulkChangeAccount}
                  onClickMapping={() => {
                    setSelectedMapping({
                      ...childValue[0],
                      assets: parsedAssets?.[wallet?.id]?.filter((item) =>
                        mappedAssets[chartOfAccountId].includes(item.id)
                      ),
                      mappedAssets
                    })
                    handleOpenCustomMappingModal()
                  }}
                  onRemoveMapping={handleRemoveMapping}
                />
              ))}
            </div>
          )
        }),
    [pageData, wallets?.items, search, parsedChartOfAccounts, parsedAssets]
  )

  return (
    <div className="overflow-x-hidden overflow-y-auto ">
      <div className="pr-14 pt-6">
        {wallets?.items?.length > 0 && (
          <div className="mb-6 pl-4">
            <TextField
              name="search"
              placeholder="Search by wallet name, address..."
              onChange={debounce(handleOnChangeSearch, 300)}
            />
          </div>
        )}
        <div
          className={`flex flex-col gap-8 pl-14 ${
            showBanner ? 'h-[calc(100vh-444px)]' : 'h-[calc(100vh-376px)]'
          } overflow-y-auto`}
        >
          {wallets?.items?.length === 0 || !filteredWalletIds?.length || !wallets || walletCryptocurrenciesLoading ? (
            <div className="pt-6">
              <EmptyData loading={isWalletsLoading || walletCryptocurrenciesLoading}>
                <EmptyData.Icon icon={MoneyIcon} />
                <EmptyData.Title>No Wallets Found</EmptyData.Title>
                {!wallets?.items?.length && (
                  <EmptyData.Subtitle>Import some wallets so you can map your assets</EmptyData.Subtitle>
                )}
                {!wallets?.items?.length && <EmptyData.CTA label="Import Wallet" onClick={handleRedirectToWallets} />}
              </EmptyData>
            </div>
          ) : (
            renderWalletMapping
          )}
        </div>
      </div>
      <div className=" pt-4">
        {Object.entries(pageData).length > 0 ? (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage - 1}
            currentPageSize={itemsPerPage}
            onPageChange={onPageChangePageHandler}
            onClickPreviousPage={prevPage}
            onClickNextPage={nextPage}
            onClickFirstPage={onClickFirstPageHandler}
            onClickLastPage={onClickLastPageHandler}
            canPreviousPage={currentPage !== 1}
            canNextPage={totalPages !== currentPage}
            pageSizeOptions={defaultPageSizeOptions}
            onChangePageSize={onChangePageSizeHandler}
          />
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default WalletAssets
