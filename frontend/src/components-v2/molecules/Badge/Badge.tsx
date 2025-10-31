import Typography from '@/components-v2/atoms/Typography'
import { ReactNode } from 'react'

type Variant = 'rounded' | 'block' | 'rounded-outline'
type Color = 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'white'
type Size = 'small' | 'medium' | 'large'

interface ChipProps {
  text: string
  icon?: ReactNode
  variant?: Variant
  color?: Color
  size?: Size
}

const Badge: React.FC<ChipProps> = ({ text, icon, variant, color, size }) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'rounded':
        return 'rounded-full'
      case 'block':
        return 'w-full'
      case 'rounded-outline':
        return 'rounded-full border border-[#F9E8E8] bg-[#F9E8E8]'
      default:
        return ''
    }
  }

  const getColorClasses = (): string => {
    switch (color) {
      case 'white':
        return 'bg-white'
      case 'gray':
        return `bg-${color}-200 text-${color}-700`
      case 'blue':
        return `bg-${color}-200 text-${color}-700`
      case 'green':
        return `bg-${color}-200 text-${color}-700`
      case 'red':
        return `bg-${color}-200 text-[#C61616]`
      case 'yellow':
        return 'bg-slate-200'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  const getSizeClasses = (): string => {
    switch (size) {
      case 'small':
        return 'text-xs px-2.5 py-1.5'
      case 'medium':
        return 'text-sm px-3 py-1.5'
      case 'large':
        return 'text-base px-4 py-2'
      default:
        return 'text-sm px-3 py-1.5'
    }
  }

  return (
    <div
      className={`flex flex-row items-center justify-center  ${getSizeClasses()}  ${getColorClasses()} ${getVariantClasses()}`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      <Typography color="error" variant="caption">
        {text}
      </Typography>
    </div>
  )
}

export default Badge
