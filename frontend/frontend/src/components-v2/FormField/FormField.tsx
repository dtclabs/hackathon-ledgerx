import { FC } from 'react'
import Image from 'next/legacy/image'
import warning from '@/public/svg/light-warning-icon.svg'

interface IFormFieldProps {
  children: any
  label?: string
  error?: any
  className?: string
  labelClassName?: string
  isRequired?: boolean
  subLabel?: string
}

const FormField: FC<IFormFieldProps> = ({
  className,
  children,
  label,
  error,
  labelClassName,
  isRequired,
  subLabel
}) => (
  <div className={`${className} font-inter`}>
    <div className={`text-xs font-bold text-neutral-900 mb-2 ${labelClassName}`}>
      {label} {isRequired && <span className="text-error-500">*</span>}
    </div>
    {subLabel && <div className="text-xs font-normal leading-4 text-grey-700 mb-2">{subLabel}</div>}
    {children}
    {error && (
      <div className="text-xs font-normal flex items-center text-error-500 mt-1 mx-1">
        <div className="mr-2 flex items-center">
          <Image src={warning} alt="warning" width={11} height={11} />
        </div>
        {error?.includes('verification code') ? 'The verification code is invalid. Please try again.' : error}
      </div>
    )}
  </div>
)

export default FormField
