import React from 'react'
import Image from 'next/legacy/image'
import { TOKEN_IMG } from '@/views/ReceivePayment/ReceivePayment'
import ReactTooltip from 'react-tooltip'

const MAX_TOKENS_NUMBER = 3

interface ITokenItem {
  id: string
  imageUrl: string
  name: string
}

interface ITokenList {
  tokens: ITokenItem[]
  id: string
}

const TokenList: React.FC<ITokenList> = ({ tokens, id }) =>
  !tokens || !tokens.length ? (
    <div>-</div>
  ) : (
    <div className="flex items-center gap-2">
      {tokens &&
        tokens.length &&
        tokens.map((token, index) => {
          const img = token.imageUrl
          return (
            img &&
            index < MAX_TOKENS_NUMBER && (
              <div key={token.id}>
                <img data-for={token.id} data-tip={token.id} src={img} width={24} height={24} alt="token" />
                <ReactTooltip
                  id={token.id}
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg"
                >
                  {token.name}
                </ReactTooltip>
              </div>
            )
          )
        })}
      {tokens && tokens.length > MAX_TOKENS_NUMBER && (
        <>
          <div
            data-for={`more-token-${id}`}
            data-tip={`more-token-${id}`}
            className="bg-dashboard-background rounded px-1 py-[2px]"
          >
            +{tokens.length - MAX_TOKENS_NUMBER}
          </div>
          <ReactTooltip
            id={`more-token-${id}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="top"
            className="!opacity-100 !rounded-lg max-w-[260px]"
          >
            <div className="flex items-center gap-1 flex-wrap">
              {tokens.map((token, index) => {
                const img = token.imageUrl
                return (
                  index >= MAX_TOKENS_NUMBER && (
                    <div key={`more-${token.id}`} className="flex items-center gap-1">
                      <img data-for={token.id} data-tip={token.id} src={img} width={20} height={20} alt={token.name} />
                      <p className="text-sm font-medium text-grey-800">
                        {token.name.toUpperCase()}
                        {index < tokens.length - 1 ? ',' : ''}
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

export default TokenList
