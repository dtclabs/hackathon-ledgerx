import { FC, useState, useRef, useEffect, Dispatch, SetStateAction, useMemo } from 'react'
import { format } from 'date-fns'
import { ethers } from 'ethers'
import Avvvatars from 'avvvatars-react'
import { toast } from 'react-toastify'
import userIcon from '@/public/svg/Users.svg'
import { useRouter } from 'next/router'
import { Button } from '@/components-v2/Button'
import { useGetMembersQuery, useActivateMemberMutation } from '@/api-v2/members-api'
import { WarningModal } from '@/components/Modals/WarningModal'
import parseAddress from '@/utils/parseWalletAddress'
import { Input } from '@/components-v2'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import MembersLoading from '../MembersLoading'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'

const COLUMNS = [
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Role',
    accessor: 'role'
  },
  {
    Header: 'Date Added',
    accessor: 'createdAt'
  },
  // {
  //   Header: 'Last Active',
  //   accessor: 'lastActive'
  // },
  {
    Header: 'Actions',
    accessor: 'actions'
  }
]

interface IProps {
  setDeactivatedCount: Dispatch<SetStateAction<number>>
}

const ActiveMembersTab: FC<IProps> = ({ setDeactivatedCount }) => {
  const router = useRouter()
  const userId = useRef(null)
  const userName = useRef(null)
  const userRole = useRef(null)
  const isBannerShown = useAppSelector(showBannerSelector)

  const { organizationId = '' } = router.query
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
  const [textSearch, setTextSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const { debouncedValue: search } = useDebounce(textSearch, 300)
  const { data, isLoading, isUninitialized } = useGetMembersQuery(
    {
      orgId: String(organizationId),
      params: { state: 'deactivated', search, page, size }
    },
    { skip: !organizationId }
  )
  const [activateMemberApi, activateMemberApiResult] = useActivateMemberMutation()

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0)
    setTextSearch(e.target.value)
  }

  useEffect(() => {
    if (activateMemberApiResult.isSuccess) {
      toast.success(`${userName.current ?? 'The member'} is now active`)
      userId.current = null
      userName.current = null
      userRole.current = null

      setIsActivateModalOpen(false)
    }
  }, [activateMemberApiResult])

  useEffect(() => {
    if (data?.data) {
      setDeactivatedCount(data?.data?.totalItems)
    }
  }, [data?.data?.totalItems, setDeactivatedCount])

  const deactivateTableData = useMemo(() => data?.data?.items, [data?.data?.items])

  const onClickActivate = (_row) => () => {
    setIsActivateModalOpen(true)
    userId.current = _row.id
    userRole.current = _row.role
    userName.current = _row.firstName ? `${_row.firstName} ${_row.lastName}` : null
  }

  const onClickCancelActivate = () => {
    setIsActivateModalOpen(false)
  }

  const onClickConfirmActivate = () => {
    activateMemberApi({ orgId: String(organizationId), memberId: String(userId.current) })
  }

  const modalMessage =
    userRole.current === 'Employee'
      ? 'They will regain access to the platform'
      : 'This will give them Admin permissions'
  return (
    <div className="pt-6">
      <div className="w-1/4 pb-6 -mt-1">
        <Input
          placeholder="Search by name, email or wallet address..."
          id="deactivated-search"
          onChange={handleChangeText}
          isSearch
          classNames="h-[34px] text-sm"
        />
      </div>
      {isLoading || isUninitialized ? (
        <MembersLoading />
      ) : (
        <SimpleTable
          defaultPageSize={10}
          tableHeight={isBannerShown ? 'h-[calc(100vh-456px)]' : 'h-[calc(100vh-380px)]'}
          columns={COLUMNS}
          noData={
            <div className="mt-24">
              <EmptyData>
                <EmptyData.Icon icon={userIcon} />
                <EmptyData.Title>No Deactivate Member Found</EmptyData.Title>
              </EmptyData>
            </div>
          }
          renderRow={(row) => {
            const hasName = Boolean(row?.original?.firstName)
            const isAddress = ethers.utils.isAddress(row.original.accountName)
            return (
              <>
                <BaseTable.Body.Row.Cell>
                  <div className="flex flex-row">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avvvatars value={hasName ? row?.original?.firstName : 'HQ'} />
                    </div>
                    <div className="flex flex-col ml-6">
                      <div className="basis-full text-neutral-700">
                        {row?.original?.firstName ? `${row?.original?.firstName} ${row?.original?.lastName}` : '-'}
                      </div>
                      <div className="text-neutral-500 mt-1" style={{ fontSize: 12 }}>
                        {isAddress ? parseAddress(row?.original?.accountName) : row?.original?.accountName}
                      </div>
                    </div>
                  </div>
                </BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <div className="whitespace-nowrap">{row.original?.role?.name}</div>
                </BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <div className="whitespace-nowrap">{format(new Date(row.original?.createdAt), 'do MMM yyyy')}</div>
                </BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <Button
                    onClick={onClickActivate(row.original)}
                    disabled={row.role === 'Owner'}
                    size="sm"
                    color="primary"
                    variant="outlined-borderless"
                  >
                    Reactivate
                  </Button>
                </BaseTable.Body.Row.Cell>
              </>
            )
          }}
          pagination={data?.data?.items.length > 0}
          data={data?.data?.items ? deactivateTableData : []}
        />
      )}

      <WarningModal
        isOpen={isActivateModalOpen}
        setShowModal={setIsActivateModalOpen}
        title="Reactivate Member?"
        onClickCancel={onClickCancelActivate}
        onClickConfirm={onClickConfirmActivate}
        isLoading={activateMemberApiResult.isLoading}
        cancelBtnText="No, Don't Activate"
        confirmBtnText="Yes, Activate"
        description={`You are reactivating ${userName.current ?? 'a Member'}. ${modalMessage}.`}
      />
    </div>
  )
}

export default ActiveMembersTab
