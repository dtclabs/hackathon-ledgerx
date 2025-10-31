import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'

const ExportTypeLabel = (option) => (
  <>
    <div data-tip={`export-${option.label}`} data-for={`export-${option.label}`} className="flex items-center gap-2">
      <Image src={option.icon} alt="icon" width={14} height={14} />
      <Typography color="primary" variant="body2">
        {option.label}
      </Typography>
    </div>
    {option?.disabled && (
      <ReactTooltip
        id={`export-${option.label}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg"
      >
        {option.tooltip}
      </ReactTooltip>
    )}
  </>
)

export default ExportTypeLabel
