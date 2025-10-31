import { useAppDispatch, useAppSelector } from '@/state'
import { selectedChainSelector, setChain } from '@/slice/platform/platform-slice'
import { MiniDropDown } from '@/components-v2/atoms/Dropdown/index'
import Typography from '@/components-v2/atoms/Typography'
import { useWeb3React } from '@web3-react/core'
import { log } from '@/utils-v2/logger'
import { supportNetwork } from '@/components/SwitchNetwork/data'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { utils } from 'ethers'

export interface IChainData {
  value: string
  label: string
  imageUrl: string
  disabled?: boolean
}

const formatOptionLabel = ({ value, label, imageUrl, disabled }) => {
  if (disabled) {
    return (
      <span className="flex grayscale !text-[#bfc2c7] justify-between items-center cursor-not-allowed">
        <div className="flex justify-between items-center">
          <img src={imageUrl} width={18} height={18} className="rounded" alt={label} />
          <Typography variant="body2" classNames="ml-3 text-ellipsis shrink overflow-hidden max-w-[90px]">
            {label}
          </Typography>
        </div>
        <div className="text-[0.75rem] h-[12px] rounded-lg bg-[#F2F4F7] px-[4px] py-[10px] flex items-center">
          Coming soon
        </div>
      </span>
    )
  }

  return (
    <span className="flex">
      <img src={imageUrl} width={18} height={18} className="rounded" alt={label} />
      <Typography variant="body2" classNames="ml-3">
        {label}
      </Typography>
    </span>
  )
}

const ChainSelectorDropdown = ({ supportedChainsFormatted }) => {
  const { account } = useWeb3React()
  const selectedChain = useAppSelector(selectedChainSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)

  const dispatch = useAppDispatch()

  const handleChainSelect = async (selectedChainOption) => {
    try {
      const temp = selectedChain?.chainId
      dispatch(setChain(selectedChainOption.value))

      if (account) {
        try {
          // TODO - CHANGE THIS TO USE PROVIDER
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: utils.hexValue(parseFloat(selectedChainOption.value)) }]
          })
        } catch (switchError: any) {
          if (switchError.code === -32603) {
            const chainMeta = supportedChains?.find(
              (chainObj) => String(chainObj.chainId) === String(selectedChainOption.value)
            )

            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  ...supportNetwork[chainMeta?.id]
                }
              ]
            })
          } else {
            dispatch(setChain(temp))
            throw new Error(switchError)
          }
        }
      }
    } catch (err) {
      log.error(
        'Error while changing chains',
        ['Error while changing chains'],
        { actualErrorObject: err && JSON.stringify(err) },
        `${window.location.pathname}`
      )
    }
  }

  return (
    supportedChainsFormatted && (
      <MiniDropDown
        width="250px"
        value={supportedChainsFormatted?.find((chainObj) => chainObj.value === selectedChain?.chainId)}
        options={supportedChainsFormatted}
        handleOnChange={handleChainSelect}
        name="chainSelector"
        formatOptionLabel={formatOptionLabel}
        placeholder="Select a chain"
        isOptionDisabled={(option) => option.disabled}
      />
    )
  )
}

export default ChainSelectorDropdown
