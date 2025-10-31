/* eslint-disable no-else-return */
import { FC } from 'react'

type SkeletonLoaderVariant = 'circle' | 'box' | 'rounded' | 'label' | 'donut'

type SkeletonLoaderProps<T extends SkeletonLoaderVariant> = T extends 'circle'
  ? { variant: T; size: number }
  : T extends 'box' | 'rounded'
  ? { variant: T; height: number; width: number | string }
  : T extends 'donut'
  ? { variant: T; size: number; thickness?: number }
  : { variant: T }

export function SkeletonLoader<T extends SkeletonLoaderVariant>(props: SkeletonLoaderProps<T>): JSX.Element {
  const { variant } = props
  const stylesMapping: any = {}
  switch (variant) {
    case 'circle':
      // Access props.size for circle variant
      stylesMapping.height = props.size
      stylesMapping.width = props.size
      stylesMapping.borderRadius = '50%'
      break
    case 'donut':
      // Access props.size for circle variant
      stylesMapping.height = props.size
      stylesMapping.width = props.size
      stylesMapping.border = `${props.thickness ? `${props.thickness}px` : '30px'} solid hsl(60, 7%, 90%)`
      break
    case 'box':
      // Access props.height and props.width for box and rounded variants
      stylesMapping.height = props.height
      stylesMapping.width = props.width
      break
    case 'rounded':
      // Access props.height and props.width for box and rounded variants
      stylesMapping.height = props.height
      stylesMapping.width = props.width
      stylesMapping.borderRadius = '12px'
      break
    case 'label':
      // No additional props for label variant

      break
    default:
      break
  }

  // Render skeleton loader based on the variant and props
  return (
    <div
      className={`${variant === 'donut' ? 'skeleton-donut' : 'skeleton skeleton-text'}`}
      style={{ ...stylesMapping }}
    />
  )
}

export default SkeletonLoader
