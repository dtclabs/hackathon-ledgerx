import React from 'react'
import ReactTooltip from 'react-tooltip'

interface IListChains {
  supportedChains: any
}

const ListChains: React.FC<IListChains> = ({ supportedChains }) => (
  <div className="flex">
    {supportedChains && supportedChains?.data.length ? (
      supportedChains?.data.map((chain, index) => (
        <div key={chain.id}>
          <div className={`${index > 0 && '-ml-1'}`} data-tip={chain.id} data-for={chain.id}>
            <img src={chain.imageUrl} alt="chain" className="rounded-[4px] mr-1" width={18} height={18} />
          </div>
          <ReactTooltip
            id={chain.id}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
            place="top"
          >
            {chain.name}
          </ReactTooltip>
        </div>
      ))
    ) : (
      <div>-</div>
    )}
  </div>
)

export default ListChains
