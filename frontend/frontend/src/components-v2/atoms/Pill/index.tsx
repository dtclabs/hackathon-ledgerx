import React from 'react'
import ReactTooltip from 'react-tooltip'
import Typography from '../Typography'
import Image from 'next/legacy/image'

interface IPill {
  label: string
  bgColor: string
  fontColor: string
  icon?: any
  classNames?: string
}

const Pill: React.FC<IPill> = ({ label, bgColor, fontColor, icon, classNames }) => (
  <div
    className={`rounded-[100px] px-2.5 py-1 flex items-center gap-2 ${classNames}`}
    style={{ backgroundColor: bgColor }}
  >
    {icon && <Image src={icon} width={12} height={12} />}

    <Typography variant="caption">
      <span style={{ color: fontColor }}>{label}</span>
    </Typography>
  </div>
)

export default Pill
