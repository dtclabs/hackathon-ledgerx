/* eslint-disable no-unneeded-ternary */
import { FC } from 'react'
// import { Button } from '@/components-v2'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import LargeClock from '@/public/svg/icons/large-clock.svg'
import { SkeletonLoader } from '../SkeletonLoader'

interface IEmptyDataProps {
  onClick?: () => void
  title?: string
  subTitle?: string
  icon?: any
  ctaLabel?: string
  disabled?: boolean
  loading?: boolean
  ctaIcon?: any
}

const EmptyData: FC<IEmptyDataProps> = ({ onClick, icon, ctaLabel, title, subTitle, disabled, loading, ctaIcon }) => (
  <div className="flex justify-center items-center flex-col ">
    {loading ? (
      <SkeletonLoader variant="circle" size={70} />
    ) : (
      <Image height={70} width={70} src={icon ? icon : LargeClock} />
    )}
    {loading ? (
      <div className="mt-6 mb-2">
        <SkeletonLoader variant="rounded" width={350} height={40} />{' '}
      </div>
    ) : (
      <Typography classNames="mt-6 mb-2" variant="heading2">
        {title}
      </Typography>
    )}
    {loading ? (
      <div className="mb-8">
        <SkeletonLoader variant="rounded" width={250} height={20} />{' '}
      </div>
    ) : (
      subTitle && (
        <div style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <Typography variant="subtitle2" color="secondary" classNames="mb-8 font-normal text-center">
            {subTitle}
          </Typography>
        </div>
      )
    )}
    {loading ? (
      <div className="mt-4">
        <SkeletonLoader variant="rounded" width={150} height={40} />{' '}
      </div>
    ) : (
      ctaLabel && (
        <Button
          leadingIcon={ctaIcon}
          disabled={disabled}
          height={40}
          classNames="mt-4"
          onClick={onClick}
          label={ctaLabel}
          variant="grey"
        />
      )
    )}
  </div>
)

export default EmptyData
