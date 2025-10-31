/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC } from 'react'
import Link from 'next/link'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import ReactTooltip from 'react-tooltip'
import Typography from '@/components-v2/atoms/Typography'

const QUEUE_BADGE_ENVIRONMENT = ['localhost', 'development']
const currentEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT

interface INavLink {
  item: any
  nonAdmin: boolean
  currentPage: string
  organizationId: string
  isSidebarOpen: boolean
  pendingApprovals?: number
  isPendingTransactionsLoading?: boolean
}

const NavLink: FC<INavLink> = ({
  item,
  nonAdmin,
  currentPage,
  organizationId,
  isSidebarOpen,
  pendingApprovals,
  isPendingTransactionsLoading
}) => (
  <div className="cursor-pointer">
    <Link
      href={!item.active ? '#' : `/${nonAdmin ? 'me' : organizationId}${item.path}`}
      key={item.title}
      className={`h-10 rounded-md flex mb-0.5 items-center  hover:bg-grey-200 ${
        isSidebarOpen ? '' : 'flex justify-center w-[50px]'
      }   ${currentPage?.includes(item?.path) ? 'bg-grey-200 text-neutral-900' : 'text-grey-700 cursor-pointer'} `}
      data-tip={item.title}
      data-for={item.title}>

      <div
        className={`flex items-center ${!item.active ? 'opacity-40' : 'hover:bg-grey-200'}  ${
          !isSidebarOpen
            ? 'pl-0'
            : item.icon === 'NewTransferIcon' || item.icon === 'RecievePayment'
            ? 'pl-3.5'
            : 'pl-2.5'
        }`}
      >
        <div className={item.icon === 'InvoiceIcon' ? 'pt-1' : ''}>
          <SVGIcon
            name={item.icon}
            width={16}
            height={16}
            stroke={currentPage?.includes(item?.path) ? '#2D2D2C' : '#777675'}
          />
        </div>
        {isSidebarOpen && (
          <div className="flex flex-row items-center gap-2">
            <p className="pl-2" style={{ fontSize: 14 }}>
              {item.title}
            </p>
            {item.path === '/pendingApproval' &&
              pendingApprovals > 0 &&
              !isPendingTransactionsLoading &&
              QUEUE_BADGE_ENVIRONMENT.includes(currentEnvironment) && (
                <div className="px-2 py-1 rounded bg-[#FCF22D]">
                  <Typography classNames="font-[12px]" variant="caption" styleVariant="semibold" color="primary">
                    {pendingApprovals}
                  </Typography>
                </div>
              )}
          </div>
        )}
      </div>
      {!item.active && (
        <ReactTooltip
          id={item.title}
          place="right"
          arrowColor="transparent"
          backgroundColor="#EAECF0"
          textColor="#101828"
          effect="solid"
          className="!opacity-100 !rounded-lg max-w-[200px] text-xs"
        >
          Please buy Starter or above plan to access this feature
        </ReactTooltip>
      )}

    </Link>
  </div>
)
export default NavLink
