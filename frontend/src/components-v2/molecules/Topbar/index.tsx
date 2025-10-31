import Image from 'next/legacy/image'
import { FC, useEffect, useState } from 'react'
import LedgerXLogo from '@/public/svg/logos/ledgerx-logo.svg'
import ProfilePopup from '@/components/Sidebar-v2/components/ProfilePopup'
import JournalEntryDialogue from './JournalEntryDialogue'
import { useOrganizationId } from '@/utils/getOrganizationId'
import CountryCurrency from './CountryCurrency'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { accountingIntegrationSelector } from '@/slice/org-integration/org-integration-selector'
import ExportsDialog from './ExportsDialog'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { RefreshCwIcon, Wallet, Menu, X } from 'lucide-react'
import Button from '@/components-v2/atoms/Button'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import router from 'next/router'
import useIsMobile from '@/hooks/useIsMobile'
// import WalletIcon from '@/public/svg/icons/wallet-icon.svg'

export interface IPropsTopBar {
  user: {
    firstName: string
    lastName: string
    loginCredentials: string
    role: string
  }
  onClickLogout: () => void
  onClickNavigateToProfile: () => void
  isLoading?: boolean
  refetch?: () => void
  onToggleMobileMenu?: () => void
  isMobileMenuOpen?: boolean
}

const TopAppBar: FC<IPropsTopBar> = ({
  user,
  onClickLogout,
  onClickNavigateToProfile,
  isLoading = false,
  refetch,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) => {
  const organizationId = useOrganizationId()
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const isNewExportsCSVEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewExportsCSVEnabled'))
  const [isRunning, setIsRunning] = useState(false)
  useEffect(() => {
    if (!isRunning) {
      refetch()
    }
  }, [isRunning])

  const toggleRunning = (state) => {
    setIsRunning(state)
  }

  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)

  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false)

  const isMobile = useIsMobile()

  const handleOnClickprofileDropdown = () => setIsProfilePopupOpen(!isProfilePopupOpen)
  return (
    <div
      className="flex justify-between items-center p-2 sm:p-4 h-[68px] w-full z-10 bg-white"
      style={{
        boxShadow: '1px 1px 4px 0px #0000001A'
      }}
    >
      <div className="flex flex-row items-center gap-2">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="hidden sm:block p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Image
          src={LedgerXLogo}
          height={isMobile ? 32 : 48}
          width={isMobile ? 104 : 168}
          className="w-auto h-12 sm:h-8 !pl-4 sm:!pl-0"
        />
        <div className="flex sm:hidden items-center gap-2 ml-[56px] bg-[#EFEFEF] p-2 rounded-md">
          <RefreshCwIcon className="w-4 h-4" />
          <div className="text-sm">Last synced: 10 minutes ago</div>
        </div>
      </div>
      <div className="flex flex-row gap-2 sm:gap-4 items-center">
        {/* Desktop-only elements */}
        <div className="flex sm:hidden items-center gap-4">
          {countrySetting?.iso && (
            <CountryCurrency
              country={countrySetting}
              currency={fiatCurrencySetting?.code}
              organizationId={organizationId}
            />
          )}
          {!isLoading &&
            !isNewExportsCSVEnabled &&
            accountingIntegration &&
            accountingIntegration?.status === 'completed' && (
              <JournalEntryDialogue accountingIntegration={accountingIntegration} />
            )}
          {(!isLoading || accountingIntegration) && isNewExportsCSVEnabled && (
            <ExportsDialog accountingIntegration={accountingIntegration} toggleRunning={toggleRunning} />
          )}
        </div>

        <Button
          leadingIcon={<Wallet className="!text-white" size={16} />}
          variant="transparent"
          height={32}
          label="Connect Wallet"
          onClick={() => {
            router.push(`/${organizationId}/wallets/import/eoa`)
          }}
          classNames="!font-normal !border-none !bg-[#0057BF] !text-white text-xs sm:text-sm sm:hidden"
        />

        <div className=" sm:hidden">
          <DividerVertical height="h-4" className="border-l !ml-1 !mr-1 border-blanca-300" />
        </div>

        <ProfilePopup
          isOpen={isProfilePopupOpen}
          onClick={handleOnClickprofileDropdown}
          user={user}
          onClickLogout={onClickLogout}
          handleNavigateToProfile={onClickNavigateToProfile}
        />
      </div>
    </div>
  )
}
export default TopAppBar
