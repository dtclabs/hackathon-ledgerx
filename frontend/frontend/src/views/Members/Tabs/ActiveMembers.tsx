/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { FC, useState, useRef, useEffect, SetStateAction, Dispatch, useMemo } from 'react'
import { format } from 'date-fns'
import { ethers } from 'ethers'
import Avvvatars from 'avvvatars-react'
import { toast } from 'react-toastify'
import userIcon from '@/public/svg/Users.svg'
import { useRouter } from 'next/router'
import { Button } from '@/components-v2/Button'
import {
  useGetMembersQuery,
  useDeactivateMemberMutation,
  useUpdateRoleMutation,
  useGetAuthenticatedProfileQuery
} from '@/api-v2/members-api'
import { WarningModal } from '@/components/Modals/WarningModal'
import parseAddress from '@/utils/parseWalletAddress'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components-v2'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import MembersLoading from '../MembersLoading'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'

interface IProps {
  setActiveCount: Dispatch<SetStateAction<number>>
  onClickInviteNewMember: (e) => void
}
const ROLE_MAP = {
  Owner: [
    { value: 'Admin', label: 'Admin' }
    // { value: 'Employee', label: 'Employee' }
  ],
  Admin: [{ value: 'Employee', label: 'Employee' }]
}

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
  {
    Header: 'Actions',
    accessor: 'actions'
  }
]

const ActiveMembersTab: FC<IProps> = ({ setActiveCount, onClickInviteNewMember }) => {
  const router = useRouter()
  const { organizationId = '' } = router.query
  const userId = useRef(null)
  const roleName = useRef(null)
  const selectedUser = useRef(null)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [isRoleUpdateModalOpen, setIsRoleUpdateModalOpen] = useState(false)
  const [textSearch, setTextSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const { debouncedValue: search } = useDebounce(textSearch, 300)
  const isBannerShown = useAppSelector(showBannerSelector)

  const { data, isLoading, isUninitialized } = useGetMembersQuery(
    {
      orgId: String(organizationId),
      params: { state: 'active', search, page, size }
    },
    { skip: !organizationId }
  )
  const { data: userData } = useGetAuthenticatedProfileQuery(
    { orgId: String(organizationId) },
    { skip: !organizationId }
  )
  const [deactivateMemberApi, deactivateMemberApiResult] = useDeactivateMemberMutation()
  const [updateRoleApi, updateRoleApiResult] = useUpdateRoleMutation()

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0)
    setTextSearch(e.target.value)
  }

  useEffect(() => {
    if (deactivateMemberApiResult.isSuccess) {
      userId.current = null
      toast.success(`${selectedUser.current ?? 'Member'} is deactivated`)
      setIsDeactivateModalOpen(false)
    } else if (deactivateMemberApiResult.isError) {
      if (deactivateMemberApiResult.error.status === 401) {
        toast.error(deactivateMemberApiResult.error.data.message ?? 'You are not authorized for this action')
      } else {
        toast.error(deactivateMemberApiResult.error.data.message ?? 'An unexpected error has occured')
      }
    }
  }, [deactivateMemberApiResult])

  useEffect(() => {
    if (updateRoleApiResult.isSuccess) {
      toast.success(`${selectedUser.current ?? 'Member'} is now an ${roleName.current}`)

      setIsRoleUpdateModalOpen(false)
    } else if (updateRoleApiResult.isError) {
      if (updateRoleApiResult.error.status === 401) {
        toast.error(updateRoleApiResult.error.data.message ?? 'You are not authorized for this action')
      } else {
        toast.error(updateRoleApiResult.error.data.message ?? 'An unexpected error has occured')
      }
    }
  }, [updateRoleApiResult])

  useEffect(() => {
    if (data?.data) {
      setActiveCount(data?.data?.totalItems)
    }
  }, [data?.data?.totalItems, setActiveCount])

  const handleRoleChange = (_row) => (e) => {
    selectedUser.current = _row.firstName ? `${_row.firstName} ${_row.lastName}` : null
    userId.current = _row.id
    roleName.current = e.value
    setIsRoleUpdateModalOpen(true)
  }

  const handleOnClickDeactivate = (_row) => (e) => {
    e.stopPropagation()

    userId.current = _row?.original?.id
    selectedUser.current = _row?.original?.firstName ? `${_row?.original?.firstName} ${_row?.original?.lastName}` : null
    setIsDeactivateModalOpen(true)
  }

  const onClickConfirmDeactivate = () => {
    deactivateMemberApi({ orgId: String(organizationId), memberId: String(userId.current) })
  }

  const onClickCancelDeativate = () => {
    userId.current = null
    roleName.current = null
    selectedUser.current = null
    setIsDeactivateModalOpen(false)
  }

  const onClickCancelUpdate = () => {
    userId.current = null
    roleName.current = null
    selectedUser.current = null
    setIsRoleUpdateModalOpen(false)
  }
  const onClickConfirmUpdate = () => {
    updateRoleApi({ orgId: String(organizationId), memberId: String(userId.current), role: roleName.current })
  }

  const handleRedirectProfileDetail = (id) => {
    userId.current = null
    roleName.current = null
    selectedUser.current = null
    router.push(`/${organizationId}/members/${id}`)
  }

  const activeMemberTableData = useMemo(() => data?.data?.items, [data?.data?.items])

  return (
    <div className="pt-6">
      {(data?.data?.items?.length > 0 || search) && (
        <div className="w-1/4 pb-7 -mt-1">
          <Input
            placeholder="Search by name, email or wallet address..."
            id="member-search"
            onChange={handleChangeText}
            isSearch
            classNames="h-[34px] text-sm"
          />
        </div>
      )}
      {isLoading || isUninitialized ? (
        <MembersLoading />
      ) : (
        <SimpleTable
          defaultPageSize={10}
          tableHeight={isBannerShown ? 'h-[calc(100vh-456px)]' : 'h-[calc(100vh-375px)]'}
          noData={
            <div className="mt-24">
              <EmptyData>
                <EmptyData.Icon icon={userIcon} />
                <EmptyData.Title>No Active Member Found</EmptyData.Title>
                <EmptyData.Subtitle>Add new whitelisted addresses to get started</EmptyData.Subtitle>
                <EmptyData.CTA onClick={onClickInviteNewMember} label="Invite a member" />
              </EmptyData>
            </div>
          }
          columns={COLUMNS}
          renderRow={(row) => {
            const hasName = Boolean(row?.original?.firstName)
            const isCurrentUser = Boolean(row?.id === userData?.data?.id)
            const isAddress = ethers.utils.isAddress(row?.original?.accountName)
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
                <BaseTable.Body.Row.Cell>{row?.original?.role}</BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <div className=" whitespace-nowrap">{format(new Date(row?.original?.createdAt), 'do MMM yyyy')}</div>
                </BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <div className="whitespace-nowrap">
                    <Button
                      onClick={handleOnClickDeactivate(row)}
                      disabled={
                        row?.original.role === 'Owner' ||
                        isCurrentUser ||
                        (userData?.data?.role !== 'Owner' && row?.original.role !== 'Employee')
                      }
                      size="sm"
                      color="danger"
                      variant="outlined-borderless"
                      className="disabled:cursor-not-allowed"
                    >
                      Deactivate
                    </Button>
                  </div>
                </BaseTable.Body.Row.Cell>
              </>
            )
          }}
          pagination={data.data.items.length > 0}
          data={data.data.items ? activeMemberTableData : []}
        />
      )}

      <WarningModal
        isOpen={isDeactivateModalOpen}
        setShowModal={setIsDeactivateModalOpen}
        title="Deactivate Member?"
        onClickCancel={onClickCancelDeativate}
        onClickConfirm={onClickConfirmDeactivate}
        isLoading={deactivateMemberApiResult.isLoading}
        cancelBtnText="No, Don't Deactivate"
        confirmBtnText="Yes, Deactivate"
        description={`You are deactivating ${
          selectedUser.current ?? 'a Member'
        }. They will lose access to your organisation. You will be able to reactivate them later.`}
      />
      <WarningModal
        isOpen={isRoleUpdateModalOpen}
        setShowModal={setIsRoleUpdateModalOpen}
        title="Change Role?"
        onClickCancel={onClickCancelUpdate}
        onClickConfirm={onClickConfirmUpdate}
        isLoading={updateRoleApiResult.isLoading}
        cancelBtnText="No, Don't Change"
        confirmBtnText="Yes, Change"
        description={`You are changing ${selectedUser.current ? `${selectedUser.current}'s` : 'a members'} role to ${
          roleName.current
        }. This will affect their permissions on the platform.`}
      />
    </div>
  )
}

export default ActiveMembersTab
