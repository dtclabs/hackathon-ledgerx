/* eslint-disable no-unneeded-ternary */
import { FC, useState, useEffect, useRef, Dispatch, SetStateAction, useMemo } from 'react'
import { format } from 'date-fns'
import Avvvatars from 'avvvatars-react'
import userIcon from '@/public/svg/Users.svg'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import {
  useGetPendingInvitesQuery,
  useDeleteInvitationMutation,
  useReactivateInviteMutation
} from '@/api-v2/invitation-api'
import { Button } from '@/components-v2/Button'
import { StatusChip } from '@/components-v2/StatusChip'
import { ConfirmCancelModal } from '../Modals/ConfirmCancel'
import { WarningModal } from '@/components/Modals/WarningModal'
import parseAddress from '@/utils/parseWalletAddress'
import { Input } from '@/components-v2'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import MemberNotFound from '../NotFound'
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
    Header: 'Date Invited',
    accessor: 'createdAt'
  },
  {
    Header: 'Invited By',
    accessor: 'invitedBy'
  },
  {
    Header: 'Status',
    accessor: 'status'
  },
  {
    Header: 'Actions',
    accessor: 'actions'
  }
]

const STATUS_CHIP_MAP = {
  expired: 'neutral',
  rejected: 'danger',
  cancelled: 'danger',
  pending: '',
  invited: 'warning'
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

interface IProps {
  onClickInviteNewMember: any
  host: string
  setInvitationsCount: Dispatch<SetStateAction<number>>
  userRole: 'Owner' | 'Admin'
}

const InviteMembersTab: FC<IProps> = ({ onClickInviteNewMember, host, setInvitationsCount, userRole }) => {
  const router = useRouter()
  const selectedUser = useRef(null)
  const { organizationId = '' } = router.query
  const isBannerShown = useAppSelector(showBannerSelector)

  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [textSearch, setTextSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [currentId, setCurrentId] = useState('')
  const { debouncedValue: search } = useDebounce(textSearch, 300)
  const {
    data: inviteData,
    isLoading,
    isUninitialized
  } = useGetPendingInvitesQuery({ orgId: organizationId, params: { search, page, size } }, { skip: !organizationId })

  const [deleteInvitation, deleteInvitationResult] = useDeleteInvitationMutation()
  const [reactivateInvite, reactivateInviteResult] = useReactivateInviteMutation()

  useEffect(() => {
    if (deleteInvitationResult.isSuccess) {
      toast.success('Invite cancelled')
      setIsCancelModalOpen(false)
      setCurrentId('')
      selectedUser.current = null
    }
  }, [deleteInvitationResult])

  useEffect(() => {
    if (reactivateInviteResult.isSuccess) {
      toast.success('Reactivated Invite Successful')
      setIsReactivateModalOpen(false)
      setCurrentId('')
      selectedUser.current = null
    }
  }, [reactivateInviteResult])

  useEffect(() => {
    if (inviteData?.data) {
      setInvitationsCount(inviteData?.data?.totalItems)
    }
  }, [inviteData?.data?.totalItems, setInvitationsCount])

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setPage(0)
    setTextSearch(e.target.value)
  }

  const handleOnCopyInvite = (row: any) => () => {
    toast.success('Invite message copied', {
      position: 'top-right',
      pauseOnHover: false
    })
    const isEmail = row.email ? true : false
    const credentialType = isEmail ? 'E-mail' : 'Wallet'
    const credentials = isEmail ? row.email : row.address
    const message = `Hey ${row.firstName} ${row.lastName}, \nYou've been invited to join ${inviteData?.data?.items?.[0]?.organization?.name}.\nPlease click the invite link below and sign up with the following wallet/email.\nThis link will expire in 3 days. \n\nInvite Link: ${host}/invite/${row.publicId}\nSign-up ${credentialType}: ${credentials}`

    navigator.clipboard.writeText(message)
  }

  const renderInvitedBy = (row) => {
    if (row?.invitedBy?.account?.firstName) {
      return `${row?.invitedBy?.account?.firstName} ${row?.invitedBy?.account?.lastName}`
    }
    return '-'
  }

  const onClickCancelInvite = () => {
    setIsCancelModalOpen(false)
  }

  const onClickCanceReactivate = () => {
    setIsReactivateModalOpen(false)
  }

  const onClickConfirmCancel = () => {
    deleteInvitation({ orgId: String(organizationId), payload: { id: currentId } })
  }

  const onClickConfirmReactivate = () => {
    reactivateInvite({ orgId: String(organizationId), inviteId: currentId })
  }

  const handleOnClickReactivate = (row) => () => {
    setCurrentId(row.publicId)
    setIsReactivateModalOpen(true)
    selectedUser.current = { firstName: row.firstName, lastName: row.lastName, role: row.role }
  }

  const inviteTableData = useMemo(() => inviteData?.data?.items, [inviteData?.data?.items])

  return (
    <div className="pt-6">
      {(inviteData?.data?.items.length > 0 || search) && (
        <div className="w-1/4 pb-6">
          <Input
            placeholder="Search by name, email or wallet address..."
            id="invitation-search"
            onChange={handleChangeText}
            isSearch
            classNames="h-[34px] text-sm"
          />
        </div>
      )}
      {isLoading || isUninitialized ? (
        <MembersLoading isInviteTab />
      ) : (
        <SimpleTable
          defaultPageSize={10}
          tableHeight={isBannerShown ? 'h-[calc(100vh-456px)]' : 'h-[calc(100vh-380px)]'}
          columns={COLUMNS}
          noData={
            <div className="mt-24">
              <EmptyData>
                <EmptyData.Icon icon={userIcon} />
                <EmptyData.Title>No Invitation Found</EmptyData.Title>
                <EmptyData.Subtitle>Add new whitelisted addresses to get started</EmptyData.Subtitle>
                <EmptyData.CTA onClick={onClickInviteNewMember} label="Invite Member" />
              </EmptyData>
            </div>
          }
          renderRow={(row) => {
            const hasName = Boolean(row?.original?.firstName)
            const isAddress = row?.original?.accountName ? true : false
            return (
              <>
                <BaseTable.Body.Row.Cell>
                  <div className="whitespace-nowrap">
                    <div className="flex flex-row">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avvvatars value={hasName ? row?.original?.firstName : 'HQ'} />
                      </div>
                      <div className="flex flex-col ml-6">
                        <div className="basis-full text-neutral-700">
                          {row?.original?.firstName ? `${row?.original?.firstName} ${row?.original?.lastName}` : '-'}
                        </div>
                        <div className="text-neutral-500 mt-1" style={{ fontSize: 12 }}>
                          {isAddress ? parseAddress(row?.original?.address) : row?.original?.email}
                        </div>
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
                <BaseTable.Body.Row.Cell extendedClass="truncate max-w-[370px] laptop:max-w-[220px]">
                  <div className="truncate max-w-[350px] laptop:max-w-[200px]">{`${renderInvitedBy(
                    row.original
                  )}`}</div>
                </BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <div className="whitespace-nowrap">
                    <StatusChip color={STATUS_CHIP_MAP[row.original.status]} label={capitalize(row.original.status)} />
                  </div>
                </BaseTable.Body.Row.Cell>
                <BaseTable.Body.Row.Cell>
                  <div className="whitespace-nowrap">
                    {row.status === 'expired' ? (
                      <Button
                        className="mr-3"
                        size="sm"
                        color="primary"
                        variant="outlined-borderless"
                        onClick={handleOnClickReactivate(row)}
                      >
                        Reactivate
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="mr-3"
                          size="sm"
                          color="primary"
                          variant="outlined-borderless"
                          onClick={handleOnCopyInvite(row.original)}
                        >
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="outlined-borderless"
                          onClick={() => {
                            selectedUser.current = `${row.original.firstName} ${row.original.lastName}`
                            setCurrentId(row.original.publicId)
                            setIsCancelModalOpen(true)
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </BaseTable.Body.Row.Cell>
              </>
            )
          }}
          pagination
          data={inviteData?.data?.items ? inviteTableData : []}
        />
      )}

      <ConfirmCancelModal
        isOpen={isCancelModalOpen}
        setShowModal={setIsCancelModalOpen}
        onClickCancel={onClickCancelInvite}
        onClickConfirm={onClickConfirmCancel}
        isLoading={deleteInvitationResult.isLoading}
        fullName={selectedUser.current}
      />
      <WarningModal
        isOpen={isReactivateModalOpen}
        setShowModal={setIsReactivateModalOpen}
        onClickCancel={onClickCanceReactivate}
        onClickConfirm={onClickConfirmReactivate}
        isLoading={reactivateInviteResult.isLoading}
        title="Renew Invitation?"
        description={`You are renewing ${selectedUser.current?.firstName} ${selectedUser.current?.lastName}'s invitation. This invite will be valid for 3 days, giving the user ${selectedUser.current?.role?.name} permissions.`}
        cancelBtnText="No, don't Renew"
        confirmBtnText="Yes, Renew"
      />
    </div>
  )
}

export default InviteMembersTab
