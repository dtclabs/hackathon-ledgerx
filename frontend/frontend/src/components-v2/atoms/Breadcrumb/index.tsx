import React from 'react'
import BreadcrumbArrow from '@/public/svg/icons/breadcrumb-arrow.svg'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'

const BreadcrumbItem = ({ classNames, children, ...props }) => (
  <li
    className={`mx-5 text-[1.5rem] leading-[2rem] font-bold sm:text-xs sm:leading-normal sm:mx-2 ${classNames}`}
    {...props}
  >
    {children}
  </li>
)

const BreadcrumbSeparator = () => (
  <li className="mx-5 flex items-center sm:mx-2">
    <Image src={BreadcrumbArrow} height={16} width={8} />
  </li>
)

const Breadcrumb = (props) => {
  let children: any = React.Children.toArray(props.children)

  const totalItems = children.length
  const lastIndex = totalItems - 1

  children = children.map((child, index) => (
    <BreadcrumbItem
      key={`breadcrumb_item${index + 1}`}
      classNames={`${index === lastIndex ? 'text-neutral-900' : 'text-blanca-600'}`}
    >
      <Typography variant="heading2" classNames="sm:!text-xs" color={index === lastIndex ? 'primary' : 'tertiary'}>
        {child}
      </Typography>
    </BreadcrumbItem>
  ))

  children = children.reduce((acc, child, index) => {
    const notLast = index < lastIndex
    if (notLast) {
      acc.push(child, <BreadcrumbSeparator key={`breadcrumb_sep${index + 1}`} />)
    } else {
      acc.push(child)
    }
    return acc
  }, [])

  return (
    <nav>
      <ol className="flex items-center">{children}</ol>
    </nav>
  )
}

export default Breadcrumb
