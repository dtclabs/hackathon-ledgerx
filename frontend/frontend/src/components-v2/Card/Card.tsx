import { FC, ReactNode } from 'react'

interface ICardProps {
  shadow?: 'sm' | 'md' | 'lg'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

const Card: FC<ICardProps> = ({ children, shadow, className, size }) => (
  <div
    className={`${className || 'p-6'} rounded-lg ${shadow && `shadow-${shadow}`} bg-white ${size && `max-w-${size}`} `}
  >
    {children}
  </div>
)

export default Card
