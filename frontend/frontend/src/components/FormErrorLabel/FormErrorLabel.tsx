import { FC } from 'react'
import Image from 'next/legacy/image'
import Warning from '@/assets/svg/warning.svg'

interface IFormErrorProps {
  error: any
  className?: string
}

const FormErrorLabel: FC<IFormErrorProps> = ({ error, className }) => {
  if (error) {
    return (
      <div className={`${className} text-sm font-inter flex items-center text-[#E83F6D]`}>
        <div className="mr-2 flex items-center">
          <Image src={Warning} alt="warning" />
        </div>
        <div>{error}</div>
      </div>
    )
  }
  return null
}

export default FormErrorLabel
