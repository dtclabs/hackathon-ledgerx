import { FC } from 'react'
import CheckboxCustom from '@/components-v2/atoms/CheckBoxCustom'

interface IDeployedChains {
  chains: any
  deployedChains: any
  onClickRemoveChain: (_chain: string) => void
  selectedChains: any
}

const DeployedChains: FC<IDeployedChains> = ({ chains, deployedChains, onClickRemoveChain, selectedChains }) => {
  const handleOnClick = (_chain) => () => onClickRemoveChain(_chain)
  const parsedDeployedChains = chains.filter((chain) => deployedChains.includes(chain.id))

  return (
    <div className="flex gap-2">
      {parsedDeployedChains?.map((chain, index) => (
        <CheckboxCustom
          label={chain.name}
          imageUrl={chain.imageUrl}
          disabled={selectedChains.length === 1 && selectedChains.includes(chain.id)}
          checked={selectedChains.includes(chain.id)}
          onChange={handleOnClick(chain.id)}
          checkboxGroupName="chainsFilter"
          id={chain.id}
          key={chain.id}
        />
      ))}
    </div>
  )
}

export default DeployedChains
