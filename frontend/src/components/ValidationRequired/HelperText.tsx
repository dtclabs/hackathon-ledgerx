import warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import React from 'react'

interface IHelperText {
  helperText: string
  className?: string
  img?: any
}

const HelperText: React.FC<IHelperText> = ({ helperText, className, img }) => (
  <div className={`${className || 'text-error-500 flex gap-2 items-start text-sm pt-2'}`}>
    <div className="flex pt-1">
      <Image src={img || warning} alt="warning" width={12} height={12} />
    </div>
    <p className="w-full"> {helperText}</p>
  </div>
)

export default HelperText
