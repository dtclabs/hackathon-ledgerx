import { FC } from 'react'
import Danger from '@/public/svg/warning-icon.svg'
import Warning from '@/public/svg/icons/warning-icon.svg'
import Image from 'next/legacy/image'

interface IAlertProps {
  variant: 'success' | 'warning' | 'danger'
  children: any
  className?: any
  fontSize?: string
}

const COLOR_MAP = {
  danger: 'bg-error-50 text-error-700 border-error-200',
  warning: 'bg-blue-50 text-error-700 border-blue-600 text-blue-600'
}

const IMAGE_MAP = {
  danger: Danger,
  warning: Warning
}

const BASE_STYLE = 'rounded-sm border-[1px] border-solid'

const AlertComponent: FC<IAlertProps> = ({ variant, className, children, fontSize }) => (
  <div
    className={`${className} ${BASE_STYLE} ${COLOR_MAP[variant]} px-4 py-2 ${
      fontSize || 'text-xs'
    } flex flex-row gap-4`}
  >
    <div className="mt-1">
      <Image src={IMAGE_MAP[variant]} alt="warning" width={20} height={20} />
    </div>
    <div className="flex items-center" style={{ fontWeight: 500 }}>
      {children}
    </div>
  </div>
)

export default AlertComponent
