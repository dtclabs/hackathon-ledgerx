import React from 'react'
import { components, MenuListProps, GroupBase } from 'react-select'

type OptionType = { label: string; value: string } // Adjust this type as per your option structure

type CustomMenuListProps = MenuListProps<OptionType, boolean, GroupBase<OptionType>> & {
  customBottomComponent?: React.ReactNode
}

export const CustomMenuList = (props: CustomMenuListProps) => {
  const { customBottomComponent, ...menuListProps } = props

  return (
    <components.MenuList {...menuListProps}>
      {props.children}
      <div style={{ position: 'sticky', bottom: 0 }}>{customBottomComponent}</div>
    </components.MenuList>
  )
}

export default CustomMenuList
