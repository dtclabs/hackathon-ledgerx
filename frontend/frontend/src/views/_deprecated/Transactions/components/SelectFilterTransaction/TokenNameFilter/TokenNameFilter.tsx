import { TOKENS_URL } from '@/constants/tokens'
import { useAppDispatch } from '@/state'
import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'

interface ITokenNameFilter {
  token: any[]
  setToken: ActionCreatorWithOptionalPayload<any[], string>
  tokenList: any[]
  handleCloseSubFilter: () => void
  handleSubmit: () => void
}

const TokenNameFilter: React.FC<ITokenNameFilter> = ({
  token,
  setToken,
  tokenList,
  handleCloseSubFilter,
  handleSubmit
}) => {
  const dispatch = useAppDispatch()
  const [selectedToken, setSelectedToken] = useState<any>(token.length > 0 ? token : [])
  const getImageToken = (tokenName: string) => TOKENS_URL.find((item) => item.name === tokenName)
  const getSelectToken = (tokenId: number) => tokenList && tokenList.find((item) => item.id === tokenId)

  useEffect(() => {
    setSelectedToken(token.length > 0 ? token : [])
  }, [token])

  const handleChangeToken = (newToken: any) => {
    if (selectedToken.some((e) => e.name === newToken.name)) {
      const newTokenList = selectedToken.filter((e) => e.name !== newToken.name)
      setSelectedToken([...newTokenList])
    } else {
      setSelectedToken([...selectedToken, newToken])
    }
  }
  const handleContinue = () => {
    handleCloseSubFilter()
    dispatch(setToken(selectedToken))
    handleSubmit()
  }
  return (
    <div className="w-[256px]">
      <div className="text-xs text-grey-400 px-4 pt-3 mb-2">Select one or more token</div>
      <div className="max-h-[calc(100vh-570px)] overflow-auto scrollbar">
        <button
          type="button"
          onClick={() => {
            if (selectedToken.length === tokenList.length) {
              setSelectedToken([])
            } else {
              setSelectedToken([...tokenList])
            }
          }}
          className="text-grey-800 font-medium bg-white w-full px-4 py-2.5 capitalize text-base text-left hover:bg-[#F2F4F7] font-inter "
        >
          <div className="flex items-center justify-between w-full">
            All
            <div className="flex flex-end">
              {selectedToken.length === tokenList.length && (
                <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
              )}
            </div>
          </div>
        </button>
        {tokenList &&
          tokenList.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => {
                handleChangeToken(item)
              }}
              className="text-grey-800 bg-white w-full px-4 py-2.5 capitalize text-sm text-left hover:bg-[#F2F4F7] font-inter "
              // className="text-grey-800 bg-white w-full px-4 p-2 capitalize text-base text-left hover:bg-gray-50 font-inter "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getImageToken(item.name) && (
                    <img src={getImageToken(item.name).logoUrl} alt="logo" className="h-4 w-4" />
                  )}
                  {item.name as string}
                </div>
                <div>
                  {/* {token && item.name === getSelectToken(token && (token as any).id).name && (
                  <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                )} */}
                  {selectedToken && selectedToken.some((e) => e.name === item.name) && (
                    <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4 mx-auto" />
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
      <div className="flex items-center gap-1 mt-2 p-1">
        <button
          type="button"
          className="text-grey-800 text-xs font-medium bg-[#F1F1EF] rounded-md px-3 py-2 grow-0 font-inter"
          onClick={handleCloseSubFilter}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={Boolean(token.length < 1 && selectedToken.length < 1)}
          className={`text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter ${
            token.length > 0 || selectedToken.length > 0 ? '' : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={handleContinue}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default TokenNameFilter
