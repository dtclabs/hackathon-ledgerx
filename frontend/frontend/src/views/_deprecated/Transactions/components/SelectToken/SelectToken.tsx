import React, { useMemo, useState } from 'react'
import Image from 'next/legacy/image'
import DropDown from '@/components/DropDown/DropDown'
import arrowDown from '@/assets/svg/arrowDown.svg'
import { TOKENS_URL } from '@/constants/tokens'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'

interface ISelectToken {
  token: string
  setToken: (token: string) => void
  tokenList: any[]
}

const SelectToken: React.FC<ISelectToken> = ({ token, setToken, tokenList }) => {
  const getImageToken = (tokenName: string) => TOKENS_URL.find((item) => item.name === tokenName)
  const getSelectToken = (tokenId: number) => tokenList && tokenList.find((item) => item.id === tokenId)

  return (
    <NewFilterDropDown
      position="bottom"
      triggerButton={
        <div className="w-[128px] bg-[#F2F4F7] rounded capitalize text-left p-3 flex justify-between items-center text-black-0 text-sm font-medium">
          <div className="flex items-center gap-3">
            {token ? (
              <>
                {' '}
                {getSelectToken((token as any).id) &&
                  getSelectToken((token as any).id).name &&
                  getImageToken(getSelectToken((token as any).id).name) && (
                    <img
                      src={getImageToken(getSelectToken((token as any).id).name).logoUrl}
                      alt="logo"
                      className="h-4 w-4"
                    />
                  )}
                {getSelectToken((token as any).id) && getSelectToken((token as any).id).name}
              </>
            ) : (
              'All'
            )}
          </div>
          <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
        </div>
      }
    >
      <div className="max-h-[240px] overflow-auto scrollbar">
        <button
          type="button"
          onClick={() => {
            setToken(null)
          }}
          className="text-grey-800 bg-white w-full  p-2 capitalize text-base text-left hover:bg-gray-50 font-inter "
        >
          <div className="flex items-center justify-between w-full">
            All
            <div className="flex flex-end">
              {!token && <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />}
            </div>
          </div>
        </button>
        {tokenList &&
          tokenList.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => {
                setToken(item)
              }}
              className="text-grey-800 bg-white w-full  p-2 capitalize text-base text-left hover:bg-gray-50 font-inter "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getImageToken(item.name) && (
                    <img src={getImageToken(item.name).logoUrl} alt="logo" className="h-4 w-4" />
                  )}
                  {item.name as string}
                </div>
                <div>
                  {token && item.name === getSelectToken(token && (token as any).id).name && (
                    <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
    </NewFilterDropDown>
  )
}

export default SelectToken
