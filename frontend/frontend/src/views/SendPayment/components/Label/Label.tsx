import Image from 'next/legacy/image'
import React from 'react'
import GreenTick from '@/public/svg/GreenTick.svg'
import YellowClock from '@/public/svg/YellowClock.svg'
import RedX from '@/public/svg/RedX.svg'

interface ILabel {
  confirmations?: number
  threshold?: number
  ready?: boolean
  title?: string
}

const Label: React.FC<ILabel> = ({ title, confirmations, threshold, ready }) => (
  <div
    className={`flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 ${
      threshold === confirmations ? (ready ? 'bg-[#CFF9E1] text-[#27AE60]' : 'bg-[#FCE4E4] text-[#E93636]') : ''
    }${threshold > confirmations ? 'bg-[#FFECD0] text-[#EB910C]' : ''}`}
  >
    {threshold === confirmations &&
      (ready ? (
        <div className="h-full w-auto">
          <Image src={GreenTick} alt="Process" />{' '}
        </div>
      ) : (
        <div className="h-full w-auto flex items-center">
          <Image src={RedX} alt="Process" />{' '}
        </div>
      ))}
    {threshold > confirmations && (
      <div className="h-full w-auto flex items-center">
        <Image src={YellowClock} alt="Process" />
      </div>
    )}
    {`${confirmations}/${threshold}`}
    {title}
  </div>
)

export default Label
