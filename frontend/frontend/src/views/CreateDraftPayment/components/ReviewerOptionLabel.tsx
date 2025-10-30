import { toShort } from '@/utils/toShort'
import ReactTooltip from 'react-tooltip'

const MAX_REVIEWERS_NAME_LENGTH = 20

const ReviewerOptionLabel = (option) => (
  <>
    <div
      data-tip={`reviewer-tooltip-${option.value}`}
      data-for={`reviewer-tooltip-${option.value}`}
      className={`font-inter text-sm text-neutral-900 leading-6 truncate font-normal ${
        option?.disabled && !option?.isSelected && 'opacity-30 cursor-not-allowed'
      }`}
    >
      {option.label?.length > MAX_REVIEWERS_NAME_LENGTH
        ? toShort(option.label, MAX_REVIEWERS_NAME_LENGTH, 0)
        : option.label}
    </div>
    {option.label?.length > MAX_REVIEWERS_NAME_LENGTH && (
      <ReactTooltip
        id={`reviewer-tooltip-${option.value}`}
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
export default ReviewerOptionLabel
