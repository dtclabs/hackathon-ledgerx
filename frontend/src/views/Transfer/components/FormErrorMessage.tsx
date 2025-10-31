import Typography from '@/components-v2/atoms/Typography'
import Warning from '@/public/svg/icons/alert-circle-icon.svg'
import Image from 'next/legacy/image'
import React from 'react'

interface IErrorMessage {
  errorMessage: string
  className?: string
  img?: string
}

const FormErrorMessage: React.FC<IErrorMessage> = ({ errorMessage, className, img }) => (
  <div className={`${className || 'flex gap-2 items-center pt-1 px-1'}`}>
    <div className="flex items-center">
      <Image src={img || Warning} alt="warning-icon" width={12} height={12} />
    </div>
    <Typography classNames="!text-[#C61616]" variant="caption">
      {errorMessage}
    </Typography>
  </div>
)

export default FormErrorMessage
