/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable import/newline-after-import */
import { FC, useRef } from 'react'
import Avvvatars from 'avvvatars-react'
import { Button } from '@/components-v2'
import { ethers } from 'ethers'
import { toShort } from '@/utils/toShort'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import ReactTooltip from 'react-tooltip'
import { useRouter } from 'next/router'
import { ChevronDown } from 'lucide-react'
import useIsMobile from '@/hooks/useIsMobile'
interface IProps {
  isOpen: boolean
  onClick: any
  handleNavigateToProfile: any
  onClickLogout: any
  user: {
    firstName: string
    lastName: string
    loginCredentials: string
  }
}

const PropfilePopup: FC<IProps> = ({ isOpen, onClick, user, handleNavigateToProfile, onClickLogout }) => {
  const router = useRouter()
  const handleLogout = () => {
    onClick()
    onClickLogout()
    router.push('/')
  }

  const onClickAccountButton = () => {
    onClick()
    handleNavigateToProfile()
  }

  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    if (isOpen) {
      onClick()
    }
  })
  const isBannerVisible = useAppSelector(showBannerSelector)
  const firstNameCharacer = user?.firstName?.charAt(0)
  const lastNameCharacter = user?.lastName?.charAt(0)
  const isAddress = ethers.utils.isAddress(user?.loginCredentials)
  const isMobile = useIsMobile()
  return (
    <div id="profile-dropdown" className="font-inter" ref={wrapperRef}>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: isBannerVisible ? (isMobile ? 60 : 135) : 65,
            right: 15,
            zIndex: 1000,
            borderRadius: 5,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAECF0',
            boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)'
          }}
          id="dropdown"
          className="z-10 w-[285px]"
        >
          <div className="flex flex-col items-center p-4">
            <Avvvatars size={38} value={user?.firstName} displayValue={`${firstNameCharacer}${lastNameCharacter}`} />
            <div className="mt-2 text-base" style={{ fontWeight: 500, color: '#344054' }}>
              {`${user?.firstName} ${user?.lastName}`}
            </div>
            <div
              className="text-xs mb-3 mt-2 text-center whitespace-nowrap w-full truncate"
              style={{
                fontWeight: 500,
                color: '#667085',
                overflow: 'hidden'
              }}
              data-tip="loginCredentials"
              data-for="loginCredentials"
            >
              {user.loginCredentials}
            </div>
            <Button size="md" color="tertiary" onClick={onClickAccountButton}>
              Manage your LedgerX Account
            </Button>
          </div>
          <div className="ml-4 mr-4" style={{ border: '0.5px solid #EAECF0' }} />
          <div onClick={handleLogout} className="flex justify-center items-center p-4 cursor-pointer">
            <img src="/svg/icons/logout-icon.svg" alt="SignOut" className="pr-3" />
            Log out
          </div>
          {user?.loginCredentials?.length > 30 && (
            <ReactTooltip
              id="loginCredentials"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="right"
              className="!opacity-100 !rounded-lg !text-xs"
            >
              {user.loginCredentials}
            </ReactTooltip>
          )}
        </div>
      )}
      <button
        onClick={onClick}
        className="flex h-[52px] pl-[12px] flex-row items-center gap-1 cursor-pointer hover:opacity-80 w-[185px] sm:justify-end"
        style={{
          backgroundColor: isMobile ? 'transparent' : 'white',
          borderRadius: isMobile ? 0 : 9,
          boxShadow: isMobile ? 'none' : '0px 8px 48px -16px rgba(0, 0, 0, 0.04), 0px 0px 32px rgba(0, 0, 0, 0.03)'
        }}
        type="button"
      >
        <div className="flex justify-center items-center">
          <Avvvatars size={40} value={user?.firstName} displayValue={`${firstNameCharacer}${lastNameCharacter}`} />
        </div>
        <div className="pl-2 sm:hidden">
          <div
            className="flex justify-start"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#344054',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: 80
            }}
          >
            {`${user?.firstName}`}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: 80
            }}
          >
            {isAddress ? toShort(user.loginCredentials, 5, 4) : user.loginCredentials}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 sm:hidden" />
      </button>
    </div>
  )
}

export default PropfilePopup
