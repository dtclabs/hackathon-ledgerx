import Typography, { ITypographyProps } from '@/components-v2/atoms/Typography'
import { trimAndEllipsis } from '@/utils-v2/string-utils'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import ReactTooltip from 'react-tooltip'

interface ChildProps extends ITypographyProps {
  children: React.ReactNode
  trim?: number
  id?: string
  label: string
}
interface WalletComponentWithChildren extends React.FC<ChildProps> {
  Tooltip: React.FC<ITooltipProps>
}

interface ITooltipProps {
  children: any
  id?: any
  maxWidth?: string
}

interface ChildComponentProps {
  id: string
}

export const TrimText: WalletComponentWithChildren = ({
  children,
  trim = 10,
  label,
  variant = 'body2',
  color = 'secondary',
  styleVariant = 'regular',
  id = uuidv4()
}) => (
  <div className="flex flex-row items-center">
    <Typography
      data-tip={`trim_text_${id}`}
      data-for={`trim_text_${id}`}
      variant={variant}
      color={color}
      styleVariant={styleVariant}
    >
      {trimAndEllipsis(label, trim)}
    </Typography>
    <div className="flex flex-row gap-2 ml-2">
      {React.Children.map(children, (child) => {
        if (React.isValidElement<ChildComponentProps>(child)) {
          return React.cloneElement(child, { id })
        }
        return child
      })}
    </div>
  </div>
)

const Tooltip: React.FC<ITooltipProps> = ({ children, id, maxWidth }) => (
  <ReactTooltip
    id={`trim_text_${id}`}
    borderColor="#eaeaec"
    border
    backgroundColor="white"
    textColor="#111111"
    effect="solid"
    place="right"
    className="!opacity-100 !rounded-lg"
  >
    <Typography
      classNames={`${maxWidth ? `max-w-[${maxWidth}px]` : 'max-w-[250px]'}`}
      variant="caption"
      color="secondary"
    >
      {children}
    </Typography>
  </ReactTooltip>
)

TrimText.Tooltip = Tooltip

export default TrimText
