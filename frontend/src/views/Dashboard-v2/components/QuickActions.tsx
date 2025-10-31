/* eslint-disable react/no-array-index-key */
import member from '@/public/svg/icons/member-icon.svg'
import payment from '@/public/svg/icons/payment-icon.svg'
import wallet from '@/public/svg/icons/yellow-wallet-icon.svg'
import txn from '@/public/svg/org-doc-icon.svg'
import { DashboardQuickActionCard } from '@/components-v2/molecules/DashboardQuickActionCard'
import Typography from '@/components-v2/atoms/Typography'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'

export interface ICardActionProps {
  id: string
  icon: any
  title: string
  subTitle: string
  isDisabled?: boolean
  onClick?: any
  link?: string
}

export const QUICK_ACTIONS_MAP: ICardActionProps[] = [
  {
    id: 'quick-action-1',
    icon: wallet,
    title: 'Import a Wallet',
    subTitle: 'Tracks assets & balances',
    link: 'wallets/import'
  },
  {
    id: 'quick-action-2',
    icon: txn,
    title: 'Review Transactions',
    subTitle: 'Review & tag transactions',
    link: 'transactions'
  },
  {
    id: 'quick-action-3',
    icon: payment,
    title: 'Make a Payment',
    subTitle: 'Make token transfers',
    link: 'transfer'
  },
  {
    id: 'quick-action-4',
    icon: member,
    title: 'Invite a Member',
    subTitle: 'Collaborate with your team',
    link: 'members?invite=true'
  }
]

interface IProps {
  username: string
}

const QuickActions = ({ username }: IProps) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const handleOnClickAction = (id) => () => {
    const quickAction = QUICK_ACTIONS_MAP.find((action) => action.id === id)
    router.push(`/${organizationId}/${quickAction.link}`)
  }

  return (
    <div className=" bg-grey-200 rounded-2xl p-6">
      <Typography variant="heading3">
        Hey <span className="capitalize">{username ?? ''}</span>, what can we do today?
      </Typography>
      <div className="flex flex-row justify-between mt-4 gap-6 overflow-x-auto">
        {QUICK_ACTIONS_MAP.map((card, index) => (
          <div className="basis-1/4" key={index}>
            <DashboardQuickActionCard onClick={handleOnClickAction} {...card} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
