/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useRef } from 'react'
import Image from 'next/legacy/image'
import Caret from '@/public/svg/icons/caret-icon.svg'
import Check from '@/public/svg/icons/check-icon.svg'
import PersonCircle from '@/public/svg/PersonCircle.svg'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Typography from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'

interface IProps {
  orgList: any
  currentOrg: any
  isOpen: boolean
  onClick: any
  onClickCreateOrg: any
  handleChangeOrg: any
  role: string
  isSidebarOpen: boolean
  disableProfileOption?: boolean
}

const DropdownItem = ({ onOrgClick, org, currentOrg }) => {
  const handleOnClick = () => {
    if (org.id !== currentOrg) {
      onOrgClick(org)
    }
  }
  return (
    <div
      onClick={handleOnClick}
      style={{ backgroundColor: '#FFFFFF', fontSize: 14, color: '#344054', fontWeight: 500, zIndex: 1000 }}
    >
      <div
        style={{
          padding: '10px 12px 10px 12px'
        }}
        className={`flex items-center gap-[10px] ${
          currentOrg === org.id
            ? 'block text-gray-400 cursor-default'
            : 'block hover:bg-gray-100 hover:text-black cursor-pointer'
        }`}
      >
        {currentOrg === org.id && <Image src={Check} className="opacity-60" />}
        <div style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {org.name}
        </div>
      </div>
    </div>
  )
}

const DropdownBase: FC<IProps> = ({
  isOpen,
  onClick,
  orgList,
  currentOrg,
  isSidebarOpen,
  onClickCreateOrg,
  handleChangeOrg,
  disableProfileOption = false,
  role
}) => {
  const router = useRouter()
  const orgId = useOrganizationId()
  const handleOrgClick = (_data) => {
    handleChangeOrg(_data)
  }

  const handleOpenProfile = () => {
    router.push(`/${orgId}/profile`)
  }

  const wrapperRef = useRef(null)
  useOutsideClick(wrapperRef, () => {
    if (isOpen) {
      onClick()
    }
  })

  return (
    <div style={{ position: 'relative' }} ref={wrapperRef}>
      <button
        onClick={onClick}
        style={{ backgroundColor: '#101828' }}
        className={`flex ${
          isSidebarOpen ? 'justify-between w-[192px]' : 'justify-center w-[50px]'
        }  rounded text-white  text-sm px-3 py-2 text-center items-center`}
        type="button"
      >
        {isSidebarOpen && (
          <div className="flex flex-col items-start">
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {currentOrg?.name}
            </div>
            <div style={{ fontWeight: 500, fontSize: 12 }}>{role}</div>
          </div>
        )}

        <div style={{ backgroundColor: '#F1F1EF', height: 24, width: 24, borderRadius: 4 }}>
          <Image src={Caret} alt="caret" />
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            overflow: 'visible',
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAECF0',
            boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)'
          }}
          id="dropdown"
          className="z-20 w-[185px]"
        >
          <div className="">
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                color: '#98A2B3',
                fontSize: 10,
                lineHeight: '14px',
                padding: '12px 12px 10px 12px'
              }}
            >
              Switch Organisation
            </div>
            <div className="max-h-[164px] overflow-auto scrollbar">
              {orgList.map((org, index) => (
                <DropdownItem key={index} org={org} onOrgClick={handleOrgClick} currentOrg={currentOrg?.id} />
              ))}
            </div>
            <button
              type="button"
              className="px-3 py-3 border-t flex items-center gap-[10px] w-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={handleOpenProfile}
              disabled={disableProfileOption}
            >
              <div data-tip="disableOnExpire" data-for="disableOnExpire" className="flex items-center gap-[10px]">
                <Image src={PersonCircle} alt="orgProfile" className={disableProfileOption ? 'opacity-30' : ''} />
                <Typography variant="caption" color="dark" classNames={disableProfileOption ? 'opacity-30' : ''}>
                  Organisation Profile
                </Typography>
              </div>
            </button>
            {disableProfileOption && (
              <ReactTooltip
                id="disableOnExpire"
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                place="top"
                className="!opacity-100 !rounded-lg"
              >
                Your plan has expired. Buy a plan to unlock access.
              </ReactTooltip>
            )}
            <div className="px-3 py-3 border-t" style={{ fontSize: 14 }}>
              <div
                onClick={onClickCreateOrg}
                className="rounded hover:bg-gray-100 hover:text-black cursor-pointer text-center"
                style={{ fontWeight: 500, border: '0.5px solid #98A2B3', padding: '9px 10px 9px 10px' }}
              >
                Create Organisation
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DropdownBase
