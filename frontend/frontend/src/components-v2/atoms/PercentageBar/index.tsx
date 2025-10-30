import React from 'react'
import ReactTooltip from 'react-tooltip'

interface IPercentageBarInput {
  ratioInPercentage: number
  color: string
  tooltip?: JSX.Element
  tooltipId?: string
}

interface IPercentageBar {
  inputs: IPercentageBarInput[]
}

const PercentageBar: React.FC<IPercentageBar> = ({ inputs }) => (
  <div className="flex rounded w-full h-1.5 gap-[2px]">
    {inputs.map((input) => (
      <div
        data-tip={input.tooltipId}
        data-for={input.tooltipId}
        key={input.ratioInPercentage}
        style={{ backgroundColor: input.color, width: `${Math.max(1, input.ratioInPercentage)}%`, borderRadius: '4px' }}
      >
        <ReactTooltip
          id={input.tooltipId}
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg"
          place="top"
        >
          {input.tooltip}
        </ReactTooltip>
      </div>
    ))}
  </div>
)

export default PercentageBar
