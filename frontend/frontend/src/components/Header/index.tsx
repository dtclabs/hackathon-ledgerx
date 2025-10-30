import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAccessToken } from '@/utils/localStorageService'
import { useAppDispatch, useAppSelector } from '@/state'
import { accountSelectorV2 } from '@/slice/account/account-slice'
import { useLazyGetUserAccountQuerySubscription } from '@/api-v2/account-api'
import useAuth from '@/hooks/useAuth'
import LogOut from '@/public/svg/icons/logout-icon.svg'
import Image from 'next/legacy/image'
import { Button } from '@/components-v2'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'

const Header = ({ newLogo = false }) => {
  const router = useRouter()
  const { logout } = useAuth()
  const accessToken = getAccessToken()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [getUserAccountTrigger] = useLazyGetUserAccountQuerySubscription()
  const handleRedirect = () => {
    router.push('/')
  }

  const accountSelector = useAppSelector(accountSelectorV2)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (accessToken) getUserAccountTrigger()
  }, [accessToken, dispatch])

  const handleLogout = () => {
    triggerSendAnalysis({
      eventType: 'SIGN_UP',
      metadata: {
        action: 'org_logout'
      }
    })
    logout()
    router.push('/')
  }

  return (
    <div className="h-20 bg-white pl-0 px-8 flex items-center justify-between">
      <div className="flex items-center ">
        {newLogo ? (
          <div className="mt-2">
            <Image src="/svg/logos/ledgerx-logo.svg" width={200} />
          </div>
        ) : (
          <img
            className="cursor-pointer mr-8 xl:mr-24 h-8 w-auto"
            src="/svg/logos/ledgerx-logo.svg"
            alt="logo"
            aria-hidden="true"
            onClick={handleRedirect}
          />
        )}
        {/* <SearchBar width="w-[200px] xl:w-[300px] " bgColor="bg-[#F2F4F7]" input={searchKey} setInput={setSearchKey} /> */}
      </div>
      <Button variant="outlined" className="font-inter" size="md" onClick={handleLogout} leftIcon={LogOut}>
        Log Out
      </Button>
      {/* <button
        type="button"
        className="bg-grey-900 hover:grey-901 rounded-[4px] px-6 py-2 text-white text-sm font-inter leading-5"
        onClick={handleLaunchApp}
      >
        Launch App
      </button> */}
    </div>
  )
}

export default Header
