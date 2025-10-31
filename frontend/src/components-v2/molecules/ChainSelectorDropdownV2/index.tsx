import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { MiniDropDown } from '@/components-v2/atoms/Dropdown/index'
import Typography from '@/components-v2/atoms/Typography'
import { useWeb3React } from '@web3-react/core'
import { log } from '@/utils-v2/logger'
import useSwitchNetwork from '@/hooks-v2/web3Hooks/useSwitchNetwork'

export interface IChainData {
  id?: string
  name?: string
  value: string
  label: string
  imageUrl: string
  disabled?: boolean
}

interface IChainSelectorDropdownV2 {
  supportedChainsFormatted: IChainData[] | []
  isDisabled?: boolean
  onChainSelect?: (chainId: string) => void
}

const formatOptionLabel = ({ label, imageUrl, disabled }) => {
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

const ChainSelectorDropdownV2 = ({ supportedChainsFormatted, isDisabled, onChainSelect }: IChainSelectorDropdownV2) => {
  const { account } = useWeb3React()
  const selectedChain = useAppSelector(selectedChainSelector)
  const { switchNetwork } = useSwitchNetwork()

  // const dispatch = useAppDispatch()

  const handleChainSelect = async (selectedChainOption) => {
    try {
      if (account) {
        if (onChainSelect) {
          onChainSelect(selectedChainOption.value)
        }
        await switchNetwork({
          chainName: selectedChainOption.label,
          chainId: selectedChainOption.value,
          rpcUrls: [selectedChainOption.rpcUrl]
        })
        // dispatch(setChain(selectedChainOption.value))
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
        isDisabled={isDisabled}
      />
    )
  )
}

export default ChainSelectorDropdownV2
