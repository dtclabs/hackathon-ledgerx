/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-else-return */
import { useState, FC, useEffect, useRef } from 'react'
import { useAppSelector } from '@/state'
import { useDispatch } from 'react-redux'
import { resetWallet } from '@/slice/wallets/wallet-slice'
import { useRouter } from 'next/router'
import NavLink from './components/NavLink'
import OrgSwitchDropdown from '@/components/Sidebar-v2/components/OrgSwitchDropdown'
import Caret from '@/public/svg/icons/caret-icon-black.svg'
import { EProcessStatus } from '@/views/Organization/interface'
import { useOrganizationId } from '@/utils/getOrganizationId'
import CreateOrganizationModal from '@/components/Modals/CreateOrganizationModal-v2'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useLazyConnectOrgQuery } from '@/slice/organization/organization.api'
import Image from 'next/legacy/image'
import PlanStatusBox from './components/PlanStatusBox'
import { SideMenuItemCollapsible as NavLinkWithChildren } from '@/components-v2/molecules/SideMenuItemCollapsible'
import { isMonetisationEnabled } from '@/config-v2/constants'
import { IPlan, PlanName, SubscriptionStatus, useLazyGetSubscriptionQuery } from '@/api-v2/subscription-api'
import { ROUTES } from './side-bar-links'
import { useGetPendingTransactionsNewQuery } from '@/slice/pending-transactions/pending-transactions.api'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { INavMenuSection } from './sidebar.types'
import { LoadingOverlay } from '@/components-v2/molecules/LoadingOverlay'
import { TXN_COLUMNS_STORAGE_KEY, TXN_FILTERS_STORAGE_KEY } from '@/views/Transactions-v2/interface'
import { cardOnboardingStepSelector } from '@/slice/cards/cards-slice'
import { CardOnboardingStatus } from '@/slice/cards/cards-type'
import { X } from 'lucide-react'

export interface ISideBarProps {
  orgList: any
  currentOrg: any
  bannerDisplayed?: boolean
  user: {
    role: string
  }
  plan?: IPlan
  isMobileMenuOpen?: boolean
  onToggleMobileMenu?: () => void
}

const SideNavBar: FC<ISideBarProps> = ({
  orgList,
  currentOrg,
  user,
  bannerDisplayed = false,
  plan,
  isMobileMenuOpen = false,
  onToggleMobileMenu
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isQueueTransactionsEnabled = useAppSelector((state) => selectFeatureState(state, 'isQueueTransactionsEnabled'))
  const cardOnboardingStep = useAppSelector(cardOnboardingStepSelector)

  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const orgId = useOrganizationId()
  const dispatch = useDispatch()
  const [error, setError] = useState<string>()
  const [status, setStatus] = useState<EProcessStatus>(EProcessStatus.PENDING)
  const currentPage = router.route
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [showError, setShowError] = useState(false)
  const [triggerConnectOrganization] = useLazyConnectOrgQuery()
  const [triggerGetSubscription, getSubscriptionResponse] = useLazyGetSubscriptionQuery()
  const selectedOrgId = useRef<string>(null)

  const {
    data: pendingApprovals,
    isLoading: isPendingTransactionsLoading,
    isFetching: isPendingTransactionsFetching
  } = useGetPendingTransactionsNewQuery(
    {
      organizationId: orgId,
      params: {
        blockchainIds: [],
        walletIds: []
      }
    },
    { skip: !orgId }
  )

  useEffect(() => {
    if (status === EProcessStatus.FAILED) {
      setIsCreateOrgOpen(false)
      setShowError(true)
    }
  }, [status])

  useEffect(() => {
    if (getSubscriptionResponse.data && !getSubscriptionResponse.isLoading) {
      if (getSubscriptionResponse.data?.status === SubscriptionStatus.EXPIRED) {
        router.push(`/${selectedOrgId.current}/orgsettings?activeTab=pricingAndPlans`)
      } else {
        triggerConnectOrganization({ organisationId: selectedOrgId.current })
        router.push(`/${selectedOrgId.current}/dashboard`)
      }
    }
  }, [getSubscriptionResponse.data, getSubscriptionResponse.isLoading])

  const handleOnClickDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleCreateOrg = () => {
    setIsOpen(false)
    setIsCreateOrgOpen(true)
  }
  const handleChangeOrg = (_org) => {
    dispatch(resetWallet())
    window.sessionStorage.removeItem(TXN_FILTERS_STORAGE_KEY)
    window.sessionStorage.removeItem(TXN_COLUMNS_STORAGE_KEY)
    setIsOpen(false)
    selectedOrgId.current = _org.id
    triggerGetSubscription({ organizationId: _org.id })
  }

  function getRoutes(currentEnvironment): INavMenuSection[] {
    const filteredRoutes = []

    for (const routeGroup of ROUTES) {
      const filteredRouteGroup = {
        title: routeGroup.title,
        routes: []
      }

      if (
        !routeGroup.whitelistEnvironment ||
        (routeGroup?.whitelistEnvironment && routeGroup.whitelistEnvironment.includes(currentEnvironment))
      ) {
        for (const route of routeGroup.routes) {
          if (!route.whitelistEnvironment || route.whitelistEnvironment.includes(currentEnvironment)) {
            // Disable links for expired gated experience
            if (route.path === '/pendingApproval' && isQueueTransactionsEnabled) {
              route.title = 'Queue'
            }

            if (route.path === '/cards' && cardOnboardingStep?.status !== CardOnboardingStatus.COMPLETED) {
              route.children = []
            }

            if (
              isMonetisationEnabled &&
              !route?.children?.length &&
              plan?.status === SubscriptionStatus.EXPIRED &&
              !['/transfer', '/pendingApproval', '/contacts', '/orgsettings', '/transact/drafts'].includes(route.path)
            ) {
              filteredRouteGroup.routes.push({ ...route, active: false })
            } else if (route.children?.length > 0) {
              const { children } = route
              const routeData = {
                ...route,
                children: []
              }
              for (const child of children) {
                if (
                  isMonetisationEnabled &&
                  plan?.status === SubscriptionStatus.EXPIRED &&
                  ['/transact/drafts', '/transact/payment-history'].includes(child.path)
                ) {
                  routeData.children.push({ ...child, active: false })
                } else {
                  routeData.children.push(child)
                }
              }
              filteredRouteGroup.routes.push({ ...routeData })
            } else {
              filteredRouteGroup.routes.push(route)
            }
          }
        }
      }

      if (filteredRouteGroup.routes.length > 0) {
        filteredRoutes.push(filteredRouteGroup)
      }
    }
    return filteredRoutes
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      {/* {getSubscriptionResponse.isLoading || (getSubscriptionResponse?.isFetching && <LoadingOverlay />)} */}
      <div
        className={`${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-full h-full bg-[#0F0F0F80]' : ''}`}
        onClick={onToggleMobileMenu}
      >
        <div
          className={`px-[16px] pt-4 mt-[2px] bg-white font-inter flex flex-col transition-all duration-250
      ease-out ${
        // Desktop: always show, use isSidebarOpen for width
        `${isSidebarOpen ? 'lg:w-[240px]' : 'lg:w-[80px]'}`
      } ${
            // Mobile: only show when mobile menu is open
            isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 !w-[74vw]' : 'sm:hidden'
          }`}
        >
          {/* Mobile Close Button */}
          {isMobileMenuOpen && (
            <div className="lg:hidden flex justify-end mb-4">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className={`relative ${bannerDisplayed ? 'h-[calc(100vh-152px)]' : 'h-[calc(100vh-84px)]'}`}>
            <div
              className={`overflow-y-auto invisible-scrollbar flex flex-col justify-between mb-4 ${
                // isMonetisationEnabled && plan?.planName === PlanName.FREE_TRIAL
                //   ? bannerDisplayed
                //     ? 'h-[calc(100vh-280px)]'
                //     : 'h-[calc(100vh-212px)]'
                // :
                bannerDisplayed ? 'h-[calc(100vh-152px)]' : 'h-[calc(100vh-84px)]'
              }`}
            >
              <div>
                <OrgSwitchDropdown
                  onClickCreateOrg={handleCreateOrg}
                  isOpen={isOpen}
                  isSidebarOpen={isSidebarOpen}
                  onClick={handleOnClickDropdown}
                  orgList={orgList}
                  currentOrg={currentOrg}
                  handleChangeOrg={handleChangeOrg}
                  role={user?.role}
                  disableProfileOption={isMonetisationEnabled && plan?.status === SubscriptionStatus.EXPIRED}
                />
                <div className="flex flex-col grow pt-6 w-full">
                  {getRoutes(process.env.NEXT_PUBLIC_ENVIRONMENT).map((section, index, { length }) => {
                    if (section.title) {
                      return (
                        <div className="mb-3" key={index}>
                          {isSidebarOpen && (
                            <div
                              className="uppercase -mb-0"
                              style={{ fontSize: 10, color: '#777675', letterSpacing: '0.1em', fontWeight: 600 }}
                            >
                              {section.title}
                            </div>
                          )}
                          {section.routes.map((route, _index) => {
                            if (route?.children?.length > 0) {
                              return (
                                <div key={_index}>
                                  <NavLinkWithChildren
                                    id={route.title}
                                    organizationId={orgId}
                                    currentPage={currentPage}
                                    isSidebarOpen={isSidebarOpen}
                                    childPaths={route.children?.map((child) => `/[organizationId]${child.path}`) || []}
                                  >
                                    <NavLinkWithChildren.CTA
                                      icon={route.icon}
                                      text={route.title}
                                      displayCaret={isSidebarOpen}
                                    />
                                    <NavLinkWithChildren.Menu>
                                      {route.children.map((childRoute, _childIndex) => (
                                        <NavLinkWithChildren.Item
                                          active={childRoute.active}
                                          path={childRoute.path}
                                          index={_childIndex}
                                          key={_childIndex}
                                        >
                                          {childRoute.title}
                                        </NavLinkWithChildren.Item>
                                      ))}
                                    </NavLinkWithChildren.Menu>
                                  </NavLinkWithChildren>
                                </div>
                              )
                            }

                            return (
                              <NavLink
                                isSidebarOpen={isSidebarOpen}
                                organizationId={orgId}
                                item={route}
                                nonAdmin={false}
                                currentPage={currentPage}
                                key={_index}
                                pendingApprovals={pendingApprovals?.data?.length ?? 0}
                                isPendingTransactionsLoading={
                                  isPendingTransactionsLoading || isPendingTransactionsFetching
                                }
                              />
                            )
                          })}
                        </div>
                      )
                    } else if (length - 1 === index) {
                      // Last row
                      return (
                        <div className="flex flex-col grow justify-end mb-2.5 " key={index}>
                          {section.routes.map((route, _index) => (
                            <NavLink
                              organizationId={orgId}
                              item={route}
                              isSidebarOpen={isSidebarOpen}
                              nonAdmin={false}
                              currentPage={currentPage}
                              key={_index}
                            />
                          ))}
                        </div>
                      )
                    }
                    return (
                      <div className={index === 0 ? 'mb-3 -mt-2' : ''} key={index}>
                        {section.routes.map((route, _index) => (
                          <NavLink
                            isSidebarOpen={isSidebarOpen}
                            organizationId={orgId}
                            item={route}
                            nonAdmin={false}
                            currentPage={currentPage}
                            key={_index}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* {isMonetisationEnabled && plan?.planName === 'free_trial' && (
          <PlanStatusBox expiredAt={plan?.expiredAt} status={plan?.status} />
        )} */}
            <div
              onClick={handleToggleSidebar}
              className="sm:hidden absolute top-1/2 -right-6 bg-[#CECECC] rounded h-[28px] w-[16px] hover:cursor-pointer flex justify-center items-center "
            >
              <Image
                className={`transition-transform duration-500 transform ${isSidebarOpen ? 'rotate-180' : ''}`}
                src={Caret}
                alt="caret"
                height={12}
                width={12}
              />
            </div>
          </div>
          {isCreateOrgOpen && (
            <CreateOrganizationModal
              setShowModal={setIsCreateOrgOpen}
              showModal={isCreateOrgOpen}
              setError={setError}
              setStatus={setStatus}
              status={status}
            />
          )}
          {error && (
            <NotificationPopUp
              acceptText="Dismiss"
              title="Organization Already Exists"
              description={error}
              type="error"
              setShowModal={setShowError}
              showModal={showError}
              onClose={() => {
                setError(undefined)
                setStatus(EProcessStatus.PENDING)
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default SideNavBar
