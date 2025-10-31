/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useMemo } from 'react'
import ListAssets from '../ListAssets/ListAssets'
import SelectGroup from '../SelectGroup/SelectGroup'
import Image from 'next/legacy/image'
import flagIcon from '@/public/svg/RedFlag.svg'
import MoreAction from '@/public/svg/MoreAction.svg'
import DropDown from '@/components/DropDown/DropDown'
import ListChains from '../ListAssets/ListChains/ListChains'
import { useUpdateWalletMutation } from '@/slice/wallets/wallet-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import ReactTooltip from 'react-tooltip'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useAppSelector } from '@/state'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import TokenList from '@/components-v2/molecules/TokenList/TokenList'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import Typography from '@/components-v2/atoms/Typography'
import { QrCode } from 'lucide-react'

interface IWalletRow {
  data: any
  chainData: any
  lastRow: boolean
  groupsData: any[]
  filterChains: string[]
}

const WalletRow: React.FC<IWalletRow> = ({ data, chainData, lastRow, groupsData, filterChains }) => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [editWallet, editWalletResult] = useUpdateWalletMutation()
  const [error, setError] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const orgSettings = useAppSelector(orgSettingsSelector)
  const { checkWalletSync } = useWalletSync({
    organisationId: organizationId
  })
  const handleChangeGroup = (group: any) => {
    if (group.id !== data.group.id) {
      editWallet({
        orgId: organizationId,
        payload: { name: data.name, flagged: data.flag, walletGroupId: group.id },
        id: data.id
      })
      checkWalletSync()
    }
  }

  const walletChainMap = useMemo(
    () =>
      data?.chains
        ?.map((item) => ({
          ...item,
          isGrayedOut: filterChains?.length > 0 ? !filterChains.includes(item.id) : false
        }))
        .sort((chain) => (chain.isGrayedOut ? -1 : 1)),
    [data?.chains, filterChains]
  )

  useEffect(() => {
    if (editWalletResult.isError && editWalletResult.error.status === 500) {
      // setError(editWalletResult.error.data.message)
      // setShowErrorModal(true)
      toast.error(editWalletResult.error.data.message)
    } else if (editWalletResult.isError && editWalletResult.error.status !== 500) {
      toast.error('Sorry, an error has occured')
    }

    if (editWalletResult.isSuccess) {
      toast.success('Wallet has been updated')
    }
  }, [editWalletResult.isError, editWalletResult.isSuccess])

  return (
    <div
      // aria-hidden
      // onClick={() => {
      //   router.push(`/${organizationId}/wallets/${data?.id}`)
      // }}
      className={`flex items-center text-sm font-medium ${
        !lastRow && 'border-b border-[#CECECC]'
      } hover:bg-gray-50 hover:cursor-pointer`}
    >
      {/* Name */}
      <div className="py-[13px] pl-4 min-w-[150px] macbock:w-[20%] macbock:min-w-[130px] w-[25%]">
        <Typography classNames="flex gap-2" color="primary" variant="body1">
          {data.flag && <Image src={flagIcon} />}
          <Typography classNames={`${data.flag ? 'w-[calc(100%-30px)]' : 'w-full'} truncate`}>{data.title}</Typography>
        </Typography>
        <div className="flex items-center">
          <WalletAddress split={5} address={data?.address} variant="caption">
            <WalletAddress.Link address={data?.address} options={walletChainMap} />
            <WalletAddress.Copy address={data?.address} />
            <QrCode className="w-4 h-4 !text-[#858585]" />
          </WalletAddress>
        </div>
      </div>
      {/* Balance */}
      {isWalletSyncing ? (
        <div className="py-[13px] pl-4 min-w-[120px] w-[21%]">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <div className="py-[13px] pl-4 min-w-[120px] w-[21%]">
          <Typography color="primary" variant="body2" classNames="!font-normal">
            {orgSettings?.fiatCurrency?.symbol}
            {/* {data.price} {orgSettings?.fiatCurrency?.code} */}
            {data.price} USD
          </Typography>
        </div>
      )}
      {/* Chain/Type */}
      <Typography
        color="secondary"
        variant="caption"
        classNames="py-[13px] pl-4 min-w-[140px] w-[17%] macbock:w-[12%] macbock:min-w-[120px]"
      >
        <img src="/svg/sample-token/Solana.svg" alt="solana" width={18} height={18} />
        <Typography color="secondary" variant="caption" classNames="!text-normal mt-1">
          EOA Wallet
        </Typography>
      </Typography>
      {isWalletSyncing ? (
        <div className="py-[13px] pl-4 min-w-[140px] w-[17%] macbock:w-[12%] macbock:min-w-[120px]">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <div className="py-[13px] pl-4 min-w-[140px] w-[17%] macbock:w-[12%] macbock:min-w-[120px]">
          <ChainList chains={walletChainMap} />
          {/* <Typography color="secondary" variant="caption">
            {data.type}
          </Typography> */}
        </div>
      )}
      {/* Assets */}
      {/* {isWalletSyncing ? (
        <div className="py-[13px] pl-4 min-w-[140px] w-[17%]">
          <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
        </div>
      ) : (
        <div className="py-[13px] pl-4 min-w-[140px] w-[17%]">
          <TokenList
            tokens={
              data?.assets?.map((asset) => ({
                id: asset.publicId,
                imageUrl: asset.imageUrl || '',
                name: asset.symbol
              })) || []
            }
            id={data?.id}
          />
        </div>
      )} */}
      {/* Group Name */}
      <div className="py-[13px] pl-4 min-w-[140px] w-[25%]">
        <SelectGroup
          maxWidth="max-w-[230px]"
          groupList={groupsData}
          onSelect={handleChangeGroup}
          group={data.group || { id: 'default', name: 'Default Group' }}
          className="!rounded-lg"
        />
      </div>
      {/* Actions */}
      <div className="flex items-center min-w-[50px] w-[5%] justify-end pr-3">
        <DropDown
          isShowDropDown={isShowDropDown}
          setIsShowDropDown={setIsShowDropDown}
          triggerButton={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsShowDropDown(!isShowDropDown)
              }}
              className="px-[10px] py-[6px] flex items-center rounded-full hover:bg-dashboard-background"
            >
              <Image src={MoreAction} />
            </button>
          }
        >
          <div className="w-[120px] flex flex-col">
            <button
              type="button"
              onClick={data.onEditButton}
              className="px-3 py-2 flex items-center hover:bg-dashboard-background"
            >
              Edit
            </button>
            <div data-tip="deleteWallet" data-for="deleteWallet">
              <button
                disabled={isWalletSyncing}
                type="button"
                onClick={data.onButtonClick}
                className="px-3 py-2 flex items-center hover:bg-dashboard-background text-[#B41414] disabled:opacity-25 disabled:cursor-not-allowed disabled:bg-white w-full"
              >
                Delete
              </button>
              {/* eslint-disable prefer-template */}
              {isWalletSyncing && (
                <ReactTooltip
                  id="deleteWallet"
                  place="top"
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg !text-xs max-w-[244px]"
                >
                  We are syncing transactions data. You will be able to delete a wallet after the sync is completed.
                </ReactTooltip>
              )}
            </div>
          </div>
        </DropDown>
      </div>
      {showErrorModal && (
        <NotificationPopUp
          acceptText="Dismiss"
          title="Unable to Edit Source of Fund"
          description={error}
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setError('')
            setShowErrorModal(false)
          }}
        />
      )}
    </div>
  )
}

export default WalletRow
