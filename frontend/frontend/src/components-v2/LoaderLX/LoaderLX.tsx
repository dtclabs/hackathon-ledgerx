import { FC } from 'react'
import Image from 'next/legacy/image'
import LedgerLogo from '@/public/svg/logos/ledgerx-logo.svg'
import Typography from '../atoms/Typography'

interface ILoaderLXProps {
  title?: string
  displayLogo?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const LoaderLX: FC<ILoaderLXProps> = ({ title, displayLogo = true, size = 'md' }) => {
  const SIZE_MAP = {
    sm: {
      text: 'heading3',
      circle: '2'
    },
    md: {
      text: 'body2',
      circle: '4'
    },
    lg: {
      text: 'heading2',
      circle: '6'
    }
  }
  return (
    <div className="flex flex-col justify-center items-center">
      {displayLogo && <Image src={LedgerLogo} alt="logo" width={400} height={70} />}
      {title && (
        <Typography classNames="-mb-2" variant={SIZE_MAP[size].text as any}>
          {title}
        </Typography>
      )}
      <div className="flex gap-6 mt-6">
        <div
          className={`w-${SIZE_MAP[size].circle} h-${SIZE_MAP[size].circle} rounded-full bg-grey-900 animate-bounce`}
        />
        <div
          className={`w-${SIZE_MAP[size].circle} h-${SIZE_MAP[size].circle} rounded-full bg-grey-900 animate-bounce`}
        />
        <div
          className={`w-${SIZE_MAP[size].circle} h-${SIZE_MAP[size].circle} rounded-full bg-grey-900 animate-bounce`}
        />
      </div>
    </div>
  )
}

export default LoaderLX
