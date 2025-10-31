import React from 'react'
import ReactTooltip from 'react-tooltip'

const FormatCoAOptionLabel = (option) => (
  <>
    <div data-tip={`tx-account-${option.value}`} data-for={`tx-account-${option.value}`}>
      <p
        className={`text-xs leading-4 truncate ${option.className} ${
          option?.disabled && 'opacity-40 cursor-not-allowed'
        } ${option.value === '' ? 'text-[#B5B5B3]' : 'text-neutral-900'} ${
          option.value === null ? 'font-semibold' : 'font-normal'
        }`}
      >
        {option.label}
      </p>
      {option?.subLabel && (
        <p className="text-[11px] font-normal leading-4 text-grey-700 truncate">{option?.subLabel}</p>
      )}
    </div>
    {!option?.disabled ? (
      option.label?.length > 21 && (
        <ReactTooltip
          id={`tx-account-${option.value}`}
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
      )
    ) : (
      <ReactTooltip
        id={`tx-account-${option.value}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg"
      >
        Already mapped
      </ReactTooltip>
    )}
  </>
)
export default FormatCoAOptionLabel
