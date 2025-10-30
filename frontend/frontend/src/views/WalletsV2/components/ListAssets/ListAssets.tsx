import React from 'react'
import Image from 'next/legacy/image'
import { TOKEN_IMG } from '@/views/ReceivePayment/ReceivePayment'
import ReactTooltip from 'react-tooltip'

const MAX_ASSETS_NUMBER = 3

interface IListAssets {
  assets: any
  id: string
}

const ListAssets: React.FC<IListAssets> = ({ assets, id }) =>
  !assets || !assets.length ? (
    <div>-</div>
  ) : (
    <div className="flex items-center gap-2">
      {assets &&
        assets.length &&
        assets.map((asset, index) => {
          const img = asset.cryptocurrency?.image?.small
          return (
            img &&
            index < MAX_ASSETS_NUMBER && (
              <div key={asset.cryptocurrency?.publicId}>
                <img
                  data-for={asset.cryptocurrency?.publicId}
                  data-tip={asset.cryptocurrency?.publicId}
                  src={img}
                  width={24}
                  height={24}
                  alt="asset"
                />
                <ReactTooltip
                  id={asset.cryptocurrency?.publicId}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg"
                >
                  {asset.cryptocurrency?.symbol}
                </ReactTooltip>
              </div>
            )
          )
        })}
      {assets && assets.length > MAX_ASSETS_NUMBER && (
        <>
          <div
            data-for={`more-asset-${id}`}
            data-tip={`more-asset-${id}`}
            className="bg-dashboard-background rounded px-1 py-[2px]"
          >
            +{assets.length - MAX_ASSETS_NUMBER}
          </div>
          <ReactTooltip
            id={`more-asset-${id}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="top"
            className="!opacity-100 !rounded-lg max-w-[260px]"
          >
            <div className="flex items-center gap-1 flex-wrap">
              {assets.map((asset, index) => {
                const img = asset.cryptocurrency?.image?.small
                return (
                  img &&
                  index >= MAX_ASSETS_NUMBER && (
                    <div key={`more-${asset.cryptocurrency?.publicId}`} className="flex items-center gap-1">
                      <img
                        data-for={asset.cryptocurrency?.publicId}
                        data-tip={asset.cryptocurrency?.publicId}
                        src={img}
                        width={20}
                        height={20}
                        alt="asset"
                      />
                      <p className="text-sm font-medium text-grey-800">
                        {asset.cryptocurrency?.symbol.toUpperCase()}
                        {index < assets.length - 1 ? ',' : ''}
                      </p>
                    </div>
                  )
                )
              })}
            </div>
          </ReactTooltip>
        </>
      )}
    </div>
  )

export default ListAssets
