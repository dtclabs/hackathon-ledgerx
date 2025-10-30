/* eslint-disable arrow-body-style */
import { useState, FC, useMemo } from 'react'
import { useRouter } from 'next/router'
import TabItem from '@/components/TabsComponent/TabItem'
import Tabs from '@/components/TabsComponent/Tabs'
import { ComponentGuard } from '@/components-v2/atoms/ComponentGuard'
import { useGetAuthenticatedProfileQuery } from '@/api-v2/members-api'
import { ActiveMembersTab, DeactivateMembersTab, InvitationsTab, InviteMemberModal } from '@/views/Members'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'

export enum ETeamTabs {
  ACTIVE = 'active',
  INVITATIONS = 'invitations',
  DEACTIVATED = 'deactivated'
}

export const TEAM_TABS = [
  {
    key: 'active',
    name: 'Active',
    active: true
  },
  {
    key: 'invitations',
    name: 'Invitations',
    active: false
  },
  {
    key: 'deactivated',
    name: 'Deactivated',
    active: false
  }
]

interface IProps {
  host?: string
}

const MemberListContainer: FC<IProps> = ({ host = window.location.origin }) => {
  const router = useRouter()
  const { organizationId = '' } = router.query
  const [activeTab, setActiveTab] = useState('active')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { data: userData } = useGetAuthenticatedProfileQuery(
    { orgId: String(organizationId) },
    { skip: !organizationId }
  )

  const [activeCount, setActiveCount] = useState(0)
  const [invitationsCount, setInvitationsCount] = useState(0)
  const [deactivatedCount, setDeactivatedCount] = useState(0)

  const TEAM_TABS_DATA = useMemo(() => {
    return TEAM_TABS.map((tab) => {
      const count =
        tab.key === ETeamTabs.ACTIVE
          ? activeCount
          : tab.key === ETeamTabs.INVITATIONS
          ? invitationsCount
          : deactivatedCount
      return { ...tab, count }
    })
  }, [activeCount, deactivatedCount, invitationsCount])

  const handleToggleInviteMember = (e) => {
    setIsInviteModalOpen(true)
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      <Header>
        <Header.Left>
          <Header.Left.Title>Members</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          <ComponentGuard requiredPermission="settings.update">
            <Header.Right.PrimaryCTA label="Invite a member" onClick={handleToggleInviteMember} />
          </ComponentGuard>
        </Header.Right>
      </Header>
      <View.Content>
        <Tabs
          tabs={TEAM_TABS_DATA}
          setActive={setActiveTab}
          classNameBtn="font-inter font-medium text-sm px-4 py-2 rounded-lg"
          className="pb-4 border-b border-dashboard-border gap-4 mt-4"
          activeStyle="bg-[#F1F1EF] text-[#2D2D2C] font-semibold"
          unActiveStyle="text-[#777675] font-medium"
          active={activeTab}
        >
          <TabItem key={ETeamTabs.ACTIVE}>
            <ActiveMembersTab setActiveCount={setActiveCount} onClickInviteNewMember={handleToggleInviteMember} />
          </TabItem>
          <TabItem key={ETeamTabs.INVITATIONS}>
            <InvitationsTab
              host={host}
              onClickInviteNewMember={handleToggleInviteMember}
              setInvitationsCount={setInvitationsCount}
              userRole={userData?.data?.role}
            />
          </TabItem>
          <TabItem key={ETeamTabs.DEACTIVATED}>
            <DeactivateMembersTab setDeactivatedCount={setDeactivatedCount} />
          </TabItem>
        </Tabs>
        <InviteMemberModal
          role={userData?.data?.role}
          host={host}
          showModal={isInviteModalOpen}
          setShowModal={setIsInviteModalOpen}
        />
      </View.Content>
    </div>
  )
}

export default MemberListContainer
