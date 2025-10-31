/* eslint-disable react/no-array-index-key */
import { FC } from 'react'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import { CryptoInfoDisplay } from '../CryptoInfoDisplay'

interface IToken {
  symbol: string
  image: string
  amount: string
}

interface IMultipleCryptoAmountInfoDisplayProps {
  id: string
  tokens: IToken[]
  displayNumber?: number
}

const MultipleCryptoAmountInfoDisplay: FC<IMultipleCryptoAmountInfoDisplayProps> = ({
  tokens,
  displayNumber = 3,
  id
}) => {
  const displayedTokens = tokens.slice(0, displayNumber)
  const remainingTokens = tokens.slice(displayNumber)

  return (
    <div className="flex flex-row items-center gap-2">
      {displayedTokens.map((token, index) => (
        <CryptoInfoDisplay key={index} displayRaw amount={token.amount} symbol={token.symbol} image={token.image} />
      ))}
      {remainingTokens.length > 0 && (
        <div className="">
          <Button
            height={32}
            data-tip={`full-file-info-${id}`}
            data-for={`full-file-info-${id}`}
            variant="grey"
            label={`+ ${remainingTokens.length}`}
            classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
          />
        </div>
      )}
      <ReactTooltip
        id={`full-file-info-${id}`}
        borderColor="#eaeaec"
        border
        delayHide={500}
        delayShow={250}
        delayUpdate={500}
        place="bottom"
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        className="!opacity-100 !rounded-lg"
      >
        <div className="pt-2 pb-2">
          {remainingTokens.map((_token, _index) => (
            <CryptoInfoDisplay amount={_token.amount} symbol={_token.symbol} image={_token.image} />
          ))}
        </div>
      </ReactTooltip>
    </div>
  )
}
export default MultipleCryptoAmountInfoDisplay
