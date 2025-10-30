import React from 'react'
import ReactTooltip from 'react-tooltip'
import styles from './chainlist.module.css'

export interface IChainItem {
  id: string
  name: string
  imageUrl: string
  isGrayedOut?: boolean
}

interface IListChains {
  chains: IChainItem[]
}

export const ChainList: React.FC<IListChains> = ({ chains }) => (
  <div className={styles.wrapper}>
    {chains?.length > 0 ? (
      chains?.map((chain, index) => (
        <div key={chain.id} className={styles.chainBlockParent}>
          <div className={styles.chainBlock} data-tip={chain.id} data-for={chain.id}>
            <img
              src={chain.imageUrl}
              alt="chain"
              className={`rounded-[4px] mr-1 ${chain.isGrayedOut ? 'grayscale' : ''}`}
              width={24}
              height={24}
            />
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
export default ChainList
