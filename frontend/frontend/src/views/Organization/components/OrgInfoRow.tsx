import { FC } from 'react'
import { Typography } from '@/components-v2'
import Image from 'next/legacy/image'

interface IOrgInfoRowProps {
  img: any
  title: string
  description: string
  className?: string
  titleClassName?: string
  titleColor?: 'primary' | 'secondary' | 'tertiary' | 'black' | 'gray'
  descriptionClassName?: string
  descriptionColor?: 'primary' | 'secondary' | 'tertiary' | 'black' | 'gray'
}

const OrgInfoRow: FC<IOrgInfoRowProps> = ({
  img,
  title,
  description,
  className,
  titleClassName = 'text-[#2D2D2C]',
  titleColor,
  descriptionClassName = 'text-[#535251]',
  descriptionColor
}) => (
  <div className={`flex flex-row mt-4 mb-8 ${className}`}>
    <div className="basis-1/6">
      <Image src={img} width={34} height={34} />
    </div>
    <div className="basic-5/6 w-[350px]">
      <Typography className={`mb-2 ${titleClassName}`} variant="subtitle2" color={titleColor}>
        {title}
      </Typography>
      <Typography className={`mb-2 ${descriptionClassName}`} variant="subtitle2" color={descriptionColor}>
        {description}
      </Typography>
    </div>
  </div>
)

export default OrgInfoRow
