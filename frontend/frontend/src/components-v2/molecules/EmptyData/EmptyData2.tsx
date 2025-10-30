import Button, { IButtonProps } from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import LargeClock from '@/public/svg/icons/large-clock.svg'
import { SkeletonLoader } from '../SkeletonLoader'
import React from 'react'

interface ChildProps {
  children: React.ReactNode
  extendedClass?: string
  loading?: boolean
}

type PickButtonProps = Pick<IButtonProps, 'label' | 'onClick' | 'disabled' | 'trailingIcon'>

interface IEmptyDataCta extends PickButtonProps {
  isLoading?: boolean
  loading?: boolean
  leadingIcon?: any
  locked?: boolean
}

interface IIconProps {
  loading?: boolean
  icon?: any
  height?: number
  width?: number
  background?: boolean
  extendedClass?: string
}

interface BaseTableChildren extends React.FC<ChildProps> {
  Icon: React.FC<IIconProps>
  Title: React.FC<ChildProps>
  Subtitle: React.FC<ChildProps>
  CTA: React.FC<IEmptyDataCta>
}

export const EmptyData: BaseTableChildren = ({ children, extendedClass, loading, ...rest }) => {
  const injectedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        loading
      })
    }
    return child
  })

  return (
    <div {...rest} className="flex justify-center items-center flex-col ">
      {injectedChildren}
    </div>
  )
}

const Icon: React.FC<IIconProps> = ({ icon, loading, extendedClass, height = 70, width = 70, background }) =>
  loading ? (
    <div className="pt-2">
      <SkeletonLoader variant="circle" size={70} />{' '}
    </div>
  ) : (
    <div className={background && 'bg-grey-200 p-6 rounded-full flex items-center'}>
      <Image className={extendedClass} height={height} width={width} src={icon ?? LargeClock} />
    </div>
  )

const Title = ({ children, loading = false }) => (
  <div className="mt-6 mb-2">
    {loading ? (
      <SkeletonLoader variant="rounded" width={350} height={23} />
    ) : (
      <Typography variant="heading3" color="secondary">
        {children}
      </Typography>
    )}
  </div>
)

const Subtitle: React.FC<ChildProps> = ({ children, loading }) => (
  <div className="mb-8">
    {loading ? (
      <div className="">
        <SkeletonLoader variant="rounded" width={250} height={15} />
      </div>
    ) : (
      <div style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <Typography variant="subtitle2" color="secondary" classNames="font-normal text-center">
          {children}
        </Typography>
      </div>
    )}
  </div>
)

const CTA: React.FC<IEmptyDataCta> = ({ loading, isLoading, leadingIcon, ...rest }) => (
  <div className="mt-2">
    {loading ? (
      <SkeletonLoader variant="rounded" width={150} height={40} />
    ) : (
      <Button
        leadingIcon={leadingIcon ? <Image src={leadingIcon} height={20} width={20} /> : null}
        loading={isLoading}
        height={40}
        variant="grey"
        {...rest}
      />
    )}
  </div>
)

EmptyData.Icon = Icon
EmptyData.Title = Title
EmptyData.Subtitle = Subtitle
EmptyData.CTA = CTA

export default EmptyData
