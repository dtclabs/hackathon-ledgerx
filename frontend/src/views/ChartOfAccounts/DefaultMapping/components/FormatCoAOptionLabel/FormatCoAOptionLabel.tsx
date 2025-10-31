import React from 'react'
import ReactTooltip from 'react-tooltip'

const FormatCoAOptionLabel = (option) => (
  <>
    <div
      data-tip={`chart-of-account-${option.value}`}
      data-for={`chart-of-account-${option.value}`}
      className={`font-inter text-sm ${
        option.value === '' ? 'text-[#B5B5B3]' : 'text-neutral-900'
      } leading-6 truncate ${option.value ? 'font-normal' : 'font-semibold'} ${
        option?.disabled && !option?.isSelected && 'opacity-30 cursor-not-allowed'
      }`}
    >
      {option.label}
    </div>
    {!option?.isSelected && option?.disabled ? (
      <ReactTooltip
        id={`chart-of-account-${option.value}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg"
      >
        {option.value ? 'Already mapped' : 'This wallet mapping is having custom map'}
      </ReactTooltip>
    ) : (
      option.label?.length > 40 && (
        <ReactTooltip
          id={`chart-of-account-${option.value}`}
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
    )}
  </>
)
export default FormatCoAOptionLabel
