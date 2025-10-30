import { useGetChainsQuery } from '@/api-v2/chain-api'
import React from 'react'
import { IBalanceAllocationProps } from '../AddWallet/types'
import WalletRow from '../WalletRow/WalletRow'
import Tooltip from '@/public/svg/Info.svg'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import { TablePagination } from '@/components/TablePagination'
import { Input } from '@/components-v2'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import MultipleDropDown from '@/views/Transactions-v2/TxFilter/MultipleDropDown'
import { toShort } from '@/utils/toShort'
import { useFormContext } from 'react-hook-form'
import { IOption } from '@/components-v2/GroupDropDown/GroupDropdown'
import Verified from '@/public/svg/icons/verified-icon.svg'
import { Pagination } from '@/components-v2/Pagination-v2'
import Direction from '@/public/svg/Direction.svg'
import MultiSelectCheckboxTab from '@/components-v2/atoms/MultiSelectCheckboxTab'
import allChainsSvg from '@/public/svg/allChains.svg'
import Typography from '@/components-v2/atoms/Typography'
import { IWalletParams } from '@/slice/wallets/wallet-types'

const assetElement = (asset) => (
  <div className="flex items-center justify-between w-full pr-2">
    <Typography classNames="flex items-center gap-2">
      <img src={asset.image.small} alt="token" width={16} height={16} />
      <Typography variant="body2" color="dark">
        {asset.name}
      </Typography>
      {asset.isVerified && <Image src={Verified} alt="verified" />}
    </Typography>
    <div>
      <Typography data-tip={asset.value} data-for={asset.value} variant="caption" classNames="!text-dashboard-sub">
        {toShort(asset.tokenAddress, 5, 4)}
      </Typography>
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

const walletGroupElement = (walletGroup) => (
  <Typography variant="body2" color="dark">
    {walletGroup.label}
  </Typography>
)

const SourcesDataTable: React.FC<IBalanceAllocationProps> = ({
  data,
  emptyState,
  onChangeSearch,
  page,
  size,
  filter,
  setSize,
  setPage,
  setFilter,
  totalPages,
  groupsData,
  balanceDirection,
  onChangeDirection,
  supportedChains,
  handleChainfilter,
  handleAllChainSelect,
  areAllChainsSelected,
  hideSupportedChains
}) => {
  const showBanner = useAppSelector(showBannerSelector)
  const { ...methods } = useFormContext<IWalletParams>()

  const handleSelectAssets = (assets: IOption[]) => {
    methods.setValue(
      'assetIds',
      assets.map((item) => item.value)
    )
  }
  const handleSelectWalletGroups = (walletGroup: IOption[]) => {
    methods.setValue(
      'walletGroupIds',
      walletGroup.map((item) => item.value)
    )
  }
  const handleApply = (value) => {
    setPage(0)
    setFilter({
      ...filter,
      ...value
    })
  }

  return (
    <div className="mt-4">
      {!hideSupportedChains && (
        <div className="flex mb-3 gap-x-3">
          <MultiSelectCheckboxTab
            label="All Chains"
            imageUrl={allChainsSvg}
            id="allChainsFilter"
            onChange={handleAllChainSelect}
            checked={areAllChainsSelected}
            checkboxGroupName="chainsFilter"
          />
          {supportedChains?.map((chain) => (
            <MultiSelectCheckboxTab
              label={chain.name}
              imageUrl={chain.imageUrl}
              checked={filter.blockchainIds.includes(chain.id) && !areAllChainsSelected}
              onChange={() => handleChainfilter(chain.id)}
              checkboxGroupName="chainsFilter"
              id={chain.id}
              key={chain.id}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mb-3 sm:flex-col sm:gap-2">
        <div className="laptop:w-1/3 w-1/4 sm:w-full">
          <Input
            placeholder="Search by wallet name or address"
            id="wallet-search"
            onChange={onChangeSearch}
            isSearch
            classNames="h-[34px] text-sm"
          />
        </div>
        <div className="w-full max-w-[250px] sm:w-full sm:max-w-full">
          <MultipleDropDown
            className="h-[36px]"
            options={groupsData?.map((item) => ({
              label: item.name,
              value: item.id,
              name: item.name
            }))}
            name="walletGroupIds"
            title="Wallet Group"
            selection={
              filter?.walletGroupIds?.map((item) => ({
                value: item
              })) || []
            }
            setSelection={handleSelectWalletGroups}
            widthBtn="w-full"
            dropdownWidth="w-full"
            element={walletGroupElement}
            isReset
            applyable
            onApply={methods.handleSubmit(handleApply)}
            dropdownHeight="max-h-[320px]"
            onClear={() => {
              setPage(0)
              methods.reset({ ...filter, walletGroupIds: [] })
              setFilter({
                ...filter,
                walletGroupIds: []
              })
            }}
          />
        </div>
      </div>
      {data && data.length > 0 ? (
        <>
          <div className="font-inter border border-[#CECECC] rounded-lg overflow-auto scrollbar w-full">
            <div className="min-w-fit">
              <div className="flex items-center bg-grey-100 text-grey-700 text-xs leading-[18px] font-semibold border-b border-[#CECECC]">
                <Typography
                  color="secondary"
                  variant="caption"
                  classNames="py-[13px] pl-4 min-w-[150px] w-[25%] macbock:w-[20%] macbock:min-w-[130px]"
                >
                  Name
                </Typography>
                <div className="py-[13px] pl-4 min-w-[120px] w-[21%] flex items-center gap-2">
                  <Typography color="secondary" variant="caption">
                    Balance
                  </Typography>
                  {data && data.length > 0 && (
                    <Image
                      src={Direction}
                      onClick={onChangeDirection}
                      className={`${balanceDirection && 'rotate-180'} cursor-pointer`}
                    />
                  )}
                </div>

                <Typography
                  color="secondary"
                  variant="caption"
                  classNames="py-[13px] pl-4 min-w-[140px] w-[17%] macbock:w-[12%] macbock:min-w-[120px]"
                >
                  Chain/Type
                </Typography>

                <Typography
                  color="secondary"
                  variant="caption"
                  classNames="py-[13px] pl-4 min-w-[140px] w-[17%] macbock:w-[12%] macbock:min-w-[120px]"
                >
                  #Token
                </Typography>

                <div className="py-[13px] pl-4 min-w-[160px] w-[30%] flex items-center gap-2">
                  <Typography color="secondary" variant="caption">
                    Wallet Group
                  </Typography>
                  <Image src={Tooltip} data-for="hearder-wallet-group" data-tip="hearder-wallet-group" />
                  <ReactTooltip
                    id="hearder-wallet-group"
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="!opacity-100 !rounded-lg max-w-[260px]"
                  >
                    <Typography variant="caption" styleVariant="medium">
                      Use Wallet Groups to group together the cost basis of your assets
                    </Typography>
                  </ReactTooltip>
                </div>
              </div>
              <div
                className={`${showBanner ? 'h-[calc(100vh-528px)]' : 'h-[calc(100vh-460px)]'} overflow-auto scroollbar`}
              >
                {data.map(
                  (item, index) =>
                    item && (
                      <WalletRow
                        key={item.id}
                        data={item}
                        chainData={supportedChains}
                        lastRow={index === size}
                        groupsData={groupsData}
                        filterChains={filter.blockchainIds}
                      />
                    )
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-center mt-4">
            <Pagination
              totalPages={Number(totalPages)}
              currentPage={page + 1}
              rowsPerPage={Number(size)}
              onSelectPage={(selectedPage) => {
                setPage(selectedPage)
              }}
              onPageChange={(currentPage: number, pageDirection: 'forward' | 'back') => {
                if (pageDirection === 'forward') {
                  setPage(currentPage + 1)
                } else {
                  setPage(currentPage - 1)
                }
              }}
              rowsPerPageOptions={[5, 10, 20]}
              onRowsPerPageChange={(row) => {
                setSize(row)
              }}
            />
          </div>
        </>
      ) : (
        <Typography classNames="h-[348px] w-full flex justify-center items-center">{emptyState}</Typography>
      )}
    </div>
  )
}

export default SourcesDataTable
