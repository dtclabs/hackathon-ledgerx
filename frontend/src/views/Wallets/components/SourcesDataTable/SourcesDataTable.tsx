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
import { IWalletParams } from '@/slice/wallets/wallet-types'

const assetElement = (asset) => (
  <div className="flex items-center justify-between w-full pr-2">
    <div className="flex items-center gap-2">
      <img src={asset.image.small} alt="token" width={16} height={16} />
      <div className="text-sm text-dashboard-main leading-4">{asset.name}</div>
      {asset.isVerified && <Image src={Verified} alt="verified" />}
    </div>
    <div>
      <div data-tip={asset.value} data-for={asset.value} className="text-xs text-dashboard-sub leading-4">
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

const walletGroupElement = (walletGroup) => (
  <div className="text-sm text-dashboard-main leading-4">{walletGroup.label}</div>
)

const SourcesDataTable: React.FC<IBalanceAllocationProps> = ({
  data,
  token,
  emptyState,
  onChangeSearch,
  textSearch,
  onResetSearch,
  page,
  size,
  filter,
  tokensData,
  setSize,
  setPage,
  setFilter,
  totalItems,
  totalPages,
  groupsData,
  balanceDirection,
  onChangeDirection
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
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="w-1/5">
          <Input
            placeholder="Search by wallet name or address"
            id="wallet-search"
            onChange={onChangeSearch}
            isSearch
            classNames="h-[34px] text-sm"
          />
        </div>
        <div className="w-2/5 flex gap-3 min-w-[512px]">
          <div className="w-full min-w-[250px]">
            <MultipleDropDown
              className="h-[36px]"
              options={tokensData}
              name="assetIds"
              title="Asset"
              selection={
                filter?.assetIds?.map((item) => ({
                  value: item
                })) || []
              }
              setSelection={handleSelectAssets}
              widthBtn="w-full"
              dropdownWidth="w-full"
              element={assetElement}
              isReset
              applyable
              onApply={methods.handleSubmit(handleApply)}
              dropdownHeight="max-h-[320px]"
              onClear={() => {
                setPage(0)
                methods.reset({ ...filter, assetIds: [] })
                setFilter({
                  ...filter,
                  assetIds: []
                })
              }}
            />
          </div>
          <div className="w-full min-w-[250px]">
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
      </div>
      {data && data.length > 0 ? (
        <>
          <div className="font-inter border border-dashboard-border rounded-lg overflow-auto scrollbar w-full">
            <div className="min-w-fit">
              <div className="flex items-center bg-grey-100 text-grey-700 text-xs leading-[18px] font-semibold border-b border-dashboard-border">
                <div className="py-[13px] pl-4 min-w-[150px] w-[25%] macbock:w-[20%] macbock:min-w-[130px]">Name</div>
                <div className="py-[13px] pl-4 min-w-[120px] w-[21%] flex items-center gap-2">
                  <p>Balance</p>
                  {data && data.length > 0 && (
                    <Image
                      src={Direction}
                      onClick={onChangeDirection}
                      className={`${balanceDirection && 'rotate-180'} cursor-pointer`}
                    />
                  )}
                </div>
                <div className="py-[13px] pl-4 min-w-[140px] w-[17%] macbock:w-[12%] macbock:min-w-[120px]">
                  Chain/Type
                </div>
                <div className="py-[13px] pl-4 min-w-[140px] w-[17%]"># Assets</div>
                <div className="py-[13px] pl-4 min-w-[160px] w-[30%] flex items-center gap-2">
                  <p>Wallet Group</p>
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
                    <p className="font-inter font-medium text-xs">
                      Use Wallet Groups to group together the cost basis of your assets
                    </p>
                  </ReactTooltip>
                </div>
              </div>
              <div
                className={`${showBanner ? 'h-[calc(100vh-486px)]' : 'h-[calc(100vh-418px)]'} overflow-auto scroollbar`}
              >
                {data.map(
                  (item, index) =>
                    item && <WalletRow key={item.id} data={item} lastRow={index === size} groupsData={groupsData} />
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
        <div className="h-[348px] w-full flex justify-center items-center">{emptyState}</div>
      )}
    </div>
  )
}

export default SourcesDataTable
