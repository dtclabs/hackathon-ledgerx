/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-unneeded-ternary */
import React from 'react'
import Select from 'react-select'
import commonSelectConfig, { IBaseDropdownProps } from './base-config'
import { CustomMenuList } from '@/components-v2/atoms/CustomMenuList'

const Dropdown: React.FC<IBaseDropdownProps & { customBottomComponent?: React.ReactNode }> = (props) => {
  // Determine the class name for the select container based on the size variant
  const selectContainerClassName = 'relative w-full'
  const componentConfig = commonSelectConfig(props)
  return (
    <div className={selectContainerClassName}>
      <Select
        {...componentConfig}
        components={{
          MenuList: (menuListProps: any) => (
            <CustomMenuList {...menuListProps} customBottomComponent={props.customBottomComponent} />
          ),
          ...componentConfig.components
        }}
      />
    </div>
  )
}

export default Dropdown
