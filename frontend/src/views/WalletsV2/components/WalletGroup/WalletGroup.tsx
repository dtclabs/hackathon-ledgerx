import { useDeleteWalletGroupMutation } from '@/api-v2/wallet-group-api'
import { Button, Input } from '@/components-v2'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useOrganizationId } from '@/utils/getOrganizationId'
import React, { useState, useEffect, useMemo } from 'react'
import ReactTooltip from 'react-tooltip'
import CreateGroupModal from '../CreateGroupModal/CreateGroupModal'
import { log } from '@/utils-v2/logger'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import MultiSelectCheckboxTab from '@/components-v2/atoms/MultiSelectCheckboxTab'
import allChainsSvg from '@/public/svg/allChains.svg'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import MoneyIcon from '@/public/svg/MoneyCircle.svg'
import Typography from '@/components-v2/atoms/Typography'

interface IWalletGroup {
  data: any
  supportedChains: any[]
  groupChainsFilter: string[]
  areAllChainsSelected: boolean
  handleChainfilter: (chain) => void
  handleAllChainSelect: () => void
  handleChangeSearch: (search) => void
}

const WalletGroup: React.FC<IWalletGroup> = ({
  data,
  supportedChains,
  groupChainsFilter,
  handleChainfilter,
  handleAllChainSelect,
  areAllChainsSelected,
  handleChangeSearch
}) => {
  const [deleteWalletGroup, deleteWalletGroupResult] = useDeleteWalletGroupMutation()

  const organizationId = useOrganizationId()
  const showBanner = useAppSelector(showBannerSelector)

  const [selectedGroup, setSelectedGroup] = useState<any>()
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!showEdit) {
      setSelectedGroup(null)
    }
  }, [showEdit])

  useEffect(() => {
    if (!showDelete) {
      setSelectedGroup(null)
    }
  }, [showDelete])

  useEffect(() => {
    if (deleteWalletGroupResult.isSuccess) {
      setShowSuccessModal(true)
      setShowDelete(false)
    }
    if (deleteWalletGroupResult.isError) {
      setShowErrorModal(true)
      setErrorMessage(deleteWalletGroupResult?.error?.data?.message)
      setShowDelete(false)
      log.error(
        `${deleteWalletGroupResult?.error?.status} API Error while deleting wallet group`,
        [`${deleteWalletGroupResult?.error?.status} API Error while deleting wallet group`],
        {
          actualErrorObject: deleteWalletGroupResult?.error
        },
        `${window.location.pathname}`
      )
    }
  }, [deleteWalletGroupResult])

  const handleDelete = () => {
    if (selectedGroup) {
      deleteWalletGroup({
        payload: {
          id: selectedGroup.id
        },
        orgId: organizationId
      })
    }
  }
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-x-3">
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
              checked={groupChainsFilter.includes(chain.id) && !areAllChainsSelected}
              onChange={() => handleChainfilter(chain.id)}
              checkboxGroupName="chainsFilter"
              id={chain.id}
              key={chain.id}
            />
          ))}
        </div>
        <div className="laptop:w-1/3 w-1/4">
          <Input
            placeholder="Search by wallet group name"
            id="wallet-search"
            onChange={handleChangeSearch}
            isSearch
            classNames="h-[36px] text-sm"
          />
        </div>
      </div>
      <div className="font-inter border border-dashboard-border rounded-lg overflow-auto scrollbar w-full">
        <div className="min-w-fit">
          <div className="flex items-center bg-grey-100 text-grey-700 text-xs leading-[18px] font-semibold border-b">
            <Typography variant="caption" color="secondary" classNames="py-[13px] pl-4 min-w-[150px] w-1/4">
              Name
            </Typography>
            <Typography variant="caption" color="secondary" classNames="py-[13px] pl-4 min-w-[150px] w-1/4">
              # Wallet
            </Typography>
            <Typography variant="caption" color="secondary" classNames="py-[13px] pl-4 min-w-[150px] w-1/4">
              Chains
            </Typography>
            <Typography variant="caption" color="secondary" classNames="py-[13px] pl-4 min-w-[150px] w-1/4">
              Action
            </Typography>
          </div>
          <div className={`${showBanner ? 'h-[calc(100vh-438px)]' : 'h-[calc(100vh-370px)]'} overflow-auto scrollbar`}>
            {(data &&
              data.length > 0 &&
              data.map((item) => {
                const groupChainMap = supportedChains
                  .filter((supportedChain) => item?.supportedBlockchains.includes(supportedChain.id))
                  .map((chain) => ({
                    ...chain,
                    isGrayedOut: groupChainsFilter?.length > 0 ? !groupChainsFilter.includes(chain.id) : false
                  }))

                return (
                  item && (
                    <div key={item?.id} className="flex items-center text-sm font-medium leading-[18px] border-b">
                      <Typography classNames="py-[13px] pl-4 min-w-[150px] w-1/4">{item?.name}</Typography>
                      <Typography classNames="py-[13px] pl-4 min-w-[150px] w-1/4">{item?.walletsSize}</Typography>
                      <div className="py-[13px] pl-4 min-w-[150px] w-1/4">
                        <ChainList chains={groupChainMap} />
                      </div>
                      <div className="py-[13px] pl-4 min-w-[150px] w-1/4 flex gap-4">
                        <Button
                          color="white"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedGroup(item)
                            setShowEdit(true)
                          }}
                        >
                          Edit
                        </Button>
                        {data.length > 1 && (
                          <div data-tip={`delete-group-${item.id}`} data-for={`delete-group-${item.id}`}>
                            <Button
                              color="white"
                              className="text-error-700 disabled:opacity-40"
                              disabled={item?.walletsSize > 0}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedGroup(item)
                                setShowDelete(true)
                              }}
                            >
                              Delete
                            </Button>
                            {item?.walletsSize > 0 && (
                              <ReactTooltip
                                id={`delete-group-${item.id}`}
                                borderColor="#eaeaec"
                                border
                                backgroundColor="white"
                                textColor="#111111"
                                effect="solid"
                                place="top"
                                className="!opacity-100 !rounded-lg !text-xs max-w-[240px]"
                              >
                                Please move out all the wallets from this group before deleting.
                              </ReactTooltip>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )
              })) || (
              <div className="h-[348px] w-full flex justify-center items-center">
                <EmptyData>
                  <EmptyData.Icon icon={MoneyIcon} />
                  <EmptyData.Title>No wallet groups found for the applied filters</EmptyData.Title>
                </EmptyData>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDelete && (
        <NotificationPopUp
          title="Delete Wallet Group?"
          description={`You are deleting Group ${selectedGroup && selectedGroup.name}. This action cannot be undone.`}
          type="custom"
          image="/svg/warningBig.svg"
          option
          setShowModal={setShowDelete}
          showModal={showDelete}
          declineText="No, Don’t Delete"
          acceptText="Yes, Delete"
          onClose={() => setShowDelete(false)}
          onAccept={handleDelete}
        />
      )}
      {showSuccessModal && (
        <NotificationPopUp
          title="Successfully delete wallet group"
          type="success"
          setShowModal={setShowSuccessModal}
          showModal={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
          }}
        />
      )}

      <NotificationPopUp
        acceptText="Dismiss"
        title="Unable to Delete Wallet Group"
        description={errorMessage}
        type="error"
        setShowModal={setShowErrorModal}
        showModal={showErrorModal}
        onClose={() => {
          setShowErrorModal(false)
        }}
      />

      <CreateGroupModal
        groups={data}
        setShowModal={setShowEdit}
        showModal={showEdit}
        selectedGroup={selectedGroup}
        action="Edit"
      />
    </div>
  )
}

export default WalletGroup
