/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { FC } from 'react'
import Image from 'next/legacy/image'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import Tooltip from '@/components/Tooltip/Tooltip'
import EthImg from '@/public/svg/ETH.svg'
import MaticImg from '@/public/svg/MATIC.svg'
import DaiImg from '@/public/svg/DAI.svg'
import USDTImg from '@/public/svg/USDT.svg'
import USDCImg from '@/public/svg/USDC.svg'
import XSGDImg from '@/public/svg/XSGD.svg'
import XIDRImg from '@/public/svg/XIDR.svg'
import useSelectedNativeChainToken from '@/hooks-v2/cryptocurrency/useSelectNativeChainToken'

// TODO - Make Dynamic
export const NETWORK_MAP = {
  1: 'Ethereum',
  4: 'Rinkeby',
  5: 'Goerli',
  137: 'Polygon'
}

export const TOKEN_IMG_MAP = {
  1: {
    symbol: 'ETH',
    img: EthImg
  },
  2: {
    symbol: 'USDC',
    img: USDCImg
  },
  3: {
    symbol: 'XSGD',
    img: XSGDImg
  },
  4: {
    symbol: 'XIDR',
    img: XIDRImg
  },
  5: {
    symbol: 'USDT',
    img: USDTImg
  },
  6: {
    symbol: 'DAI',
    img: DaiImg
  },
  11: {
    symbol: 'MATIC',
    img: MaticImg
  }
}

interface INetworkDropdown {
  networks: any
  tokens: any
  setValue: any
  index: any
  watch: any
  trigger: any
  register: any
  onClickRemoveAddress: any
}

const NetworkDropdown: FC<INetworkDropdown> = ({
  networks,
  tokens,
  setValue,
  index,
  watch,
  trigger,
  onClickRemoveAddress
}) => {
  const { findNativeCoins } = useSelectedNativeChainToken()
  const cryptocurrencySymbol = watch(`addresses[${index}].cryptocurrencySymbol`)
  const chainId = watch(`addresses[${index}].blockchainId`)
  const address = watch(`addresses[${index}].address`)

  const handleOnClickNetwork = (item) => () => {
    const nativeCoin = findNativeCoins(item.value)
    setValue(`addresses[${index}].blockchainId`, item.value)
    setValue(`addresses[${index}].cryptocurrencySymbol`, nativeCoin?.symbol || 'ETH')
    trigger(`addresses[${index}].blockchainId`)
  }

  const handleOnClickToken = (item) => () => {
    setValue(`addresses[${index}].cryptocurrencySymbol`, item.value)
    trigger(`addresses[${index}].cryptocurrencySymbol`)
  }

  const handleOnChangeAddress = (e) => {
    setValue(`addresses[${index}].address`, e.target.value.toLowerCase())
    trigger(`addresses[${index}].address`)
  }

  const handleOnRemoveAddress = () => {
    onClickRemoveAddress(index)
  }

  return (
    <div style={{ marginTop: index !== 0 ? 20 : 0 }}>
      <div className="flex items-stretch gap-2 my-2" style={{ backgroundColor: '#FBFAFA' }}>
        <div className="flex items-center gap-2 border border-[#EAECF0] rounded-lg p-0.5 w-full ">
          <NewFilterDropDown
            triggerButton={
              <div
                style={{ borderRadius: 5 }}
                className="w-[180px] bg-[#F1F1EF] rounded capitalize text-left ml-0.5  p-3 flex justify-between items-center text-black-0 text-sm font-medium"
              >
                {chainId === '' ? 'Network' : networks?.find((network) => network.value === chainId)?.label}
                <Image src="/svg/Dropdown.svg" width={12} height={12} alt="DownArrow" className="w-3 h-auto" />
              </div>
            }
          >
            {networks?.map((item, networkIndex) => (
              <button
                type="button"
                key={networkIndex}
                onClick={handleOnClickNetwork(item)}
                className="text-gray-700 flex justify-between items-center bg-white w-full py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter"
              >
                {item.label}
              </button>
            ))}
          </NewFilterDropDown>
          {/* <NewFilterDropDown
            disabled={!chainId}
            triggerButton={
              <div
                style={{ borderRadius: 5 }}
                className={`${
                  !chainId ? 'cursor-not-allowed' : ''
                } w-[180px] bg-[#F1F1EF] rounded capitalize text-left p-3 flex justify-between items-center text-black-0 text-sm font-medium`}
              >
                <div className="w-[100px] truncate">
                  {cryptocurrencySymbol === ''
                    ? 'Token'
                    : tokens?.find((token) => token.value === cryptocurrencySymbol)?.label}
                </div>
                {cryptocurrencySymbol && (
                  <Image
                    src={tokens?.find((token) => token.value === cryptocurrencySymbol)?.img}
                    height={17}
                    width={17}
                    alt="img-token"
                  />
                )}
                <Image src="/svg/Dropdown.svg" width={12} height={12} alt="DownArrow" className="w-3 h-auto mx-1" />
              </div>
            }
          >
            {tokens?.map((item, tokenIndex) => (
              <button
                type="button"
                key={tokenIndex}
                onClick={handleOnClickToken(item)}
                className="text-gray-700 flex justify-between items-center bg-white w-full py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter"
              >
                {item.label.length > 12 ? (
                  <Tooltip text={item.label} shortText={`${item.label.substring(0, 12)}...`} />
                ) : (
                  item.label
                )}
              </button>
            ))}
          </NewFilterDropDown> */}
          <input
            name="addresses.0.address"
            type="text"
            style={{ backgroundColor: '#FBFAFA', color: '#535251' }}
            value={address}
            className="focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:italic placeholder:leading-5  w-full h-12 font-inter rounded-lg flex gap-4 items-center px-2"
            placeholder="Enter wallet information"
            onChange={handleOnChangeAddress}
          />
          <Image
            className="p-4 hover:cursor-pointer hover:opacity-50"
            src="/svg/icons/close-icon.svg"
            onClick={handleOnRemoveAddress}
            alt="close"
            height={30}
            width={30}
          />
        </div>
      </div>
    </div>
  )
}

export default NetworkDropdown
