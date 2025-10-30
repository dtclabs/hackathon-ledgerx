import React from 'react'
import ReactTooltip from 'react-tooltip'

const SyncCoaOption = (option) => (
  <>
    <div
      data-tip={`sync-coa-${option.value}`}
      data-for={`sync-coa-${option.value}`}
      className={`font-inter text-xs ${
        option.value === '' ? 'text-[#B5B5B3]' : 'text-neutral-900'
      } leading-[14px] truncate ${option.value ? 'font-normal' : 'font-semibold'}`}
    >
      {option.label}
    </div>
    {option.label?.length > 20 && (
      <ReactTooltip
        id={`sync-coa-${option.value}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg"
      >
        {option.label}
      </ReactTooltip>
    )}
  </>
)
export default SyncCoaOption
