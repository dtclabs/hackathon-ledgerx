import Button from '@/components-v2/atoms/Button'
import ToggleSwitch from '@/components-v2/atoms/ToggleSwitch'
import Typography from '@/components-v2/atoms/Typography'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import InfoIcon from '@/public/svg/icons/info-icon-circle-grey.svg'
import SettingsIcon from '@/public/svg/icons/settings-icon-2.svg'
import Image from 'next/legacy/image'
import React, { useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { TRANSACTION_TABLE_COLUMNS_LIST, TransactionTableColumnType } from '../interface'

interface IDynamicColumnDropdown {
  columns: { [column: string]: boolean }
  onChange: any
}

const DynamicColumnDropdown: React.FC<IDynamicColumnDropdown> = ({ columns, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleAll = (type: TransactionTableColumnType, checked: boolean) => {
    TRANSACTION_TABLE_COLUMNS_LIST.filter((column) => column.type === type && !column?.isDefault).forEach((column) => {
      onChange(column.value, checked)
    })
  }

  const columnsList = useMemo(
    () => (
      <div className="flex flex-col gap-3 w-[260px]">
        <section id={TransactionTableColumnType.BASIC} className="flex flex-col gap-1">
          <div className="flex items-center gap-1 justify-between">
            <Typography styleVariant="semibold" classNames="capitalize px-3">
              {TransactionTableColumnType.BASIC}
            </Typography>
            <div className="flex items-center">
              <Button
                height={24}
                variant="transparent"
                label="Show all"
                classNames="h-[16px] py-0 px-1 border-0"
                onClick={() => {
                  handleToggleAll(TransactionTableColumnType.BASIC, true)
                }}
              />
              <DividerVertical height="h-4" space="mx-[6px]" />
              <Button
                height={24}
                variant="transparent"
                label="Hide all"
                classNames="h-[16px] py-0 px-1 border-0"
                onClick={() => {
                  handleToggleAll(TransactionTableColumnType.BASIC, false)
                }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            {TRANSACTION_TABLE_COLUMNS_LIST.filter(
              (column) => column.type === TransactionTableColumnType.BASIC && !column?.isDefault
            ).map((column) => (
              <ColumnsToggleSwitch
                key={`dynamic-column-${column.value}`}
                checked={columns[column.value]}
                column={column}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
        <section id={TransactionTableColumnType.ADVANCED} className="flex flex-col gap-1">
          <div className="flex items-center gap-1 justify-between">
            <Typography styleVariant="semibold" classNames="capitalize px-3">
              {TransactionTableColumnType.ADVANCED}
            </Typography>
            <div className="flex items-center">
              <Button
                height={24}
                variant="transparent"
                label="Show all"
                classNames="h-[16px] py-0 px-1 border-0"
                onClick={() => {
                  handleToggleAll(TransactionTableColumnType.ADVANCED, true)
                }}
              />
              <DividerVertical height="h-4" space="mx-[6px]" />
              <Button
                height={24}
                variant="transparent"
                label="Hide all"
                classNames="h-[16px] py-0 px-1 border-0"
                onClick={() => {
                  handleToggleAll(TransactionTableColumnType.ADVANCED, false)
                }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            {TRANSACTION_TABLE_COLUMNS_LIST.filter(
              (column) => column.type === TransactionTableColumnType.ADVANCED && !column?.isDefault
            ).map((column) => (
              <ColumnsToggleSwitch
                key={`dynamic-column-${column.value}`}
                checked={columns[column.value]}
                column={column}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
      </div>
    ),
    [columns]
  )

  return (
    <DropDown
      position="bottom"
      placement={EPlacement.TOPLEFT}
      maxHeight="max-h-[1000px]"
      isShowDropDown={isOpen}
      setIsShowDropDown={setIsOpen}
      triggerButton={
        <Button
          height={24}
          variant="ghost"
          label="Show/Hide Columns"
          classNames="font-medium"
          leadingIcon={<Image src={SettingsIcon} width={14} height={14} />}
          onClick={() => setIsOpen((prev) => !prev)}
        />
      }
    >
      {columnsList}
    </DropDown>
  )
}

export default DynamicColumnDropdown

const ColumnsToggleSwitch = ({ column, checked, onChange }) => (
  <div className="py-[10px] px-3 flex items-center w-max">
    <ToggleSwitch
      id={column.value}
      checked={checked}
      onChange={() => {
        onChange(column.value, !checked)
      }}
    />
    <Typography classNames="ml-3 whitespace-nowrap flex items-center">
      {column.label}
      {column?.tooltip && (
        <div className="ml-2 flex items-center">
          <Image
            data-tip={`txn-grid-column-tooltip-${column.value}`}
            data-for={`txn-grid-column-tooltip-${column.value}`}
            src={InfoIcon}
            width={14}
            height={14}
          />
          <ReactTooltip
            id={`txn-grid-column-tooltip-${column.value}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg max-w-[240px]"
          >
            <Typography variant="caption" styleVariant="regular" classNames="whitespace-normal">
              {column.tooltip}
            </Typography>
          </ReactTooltip>
        </div>
      )}
    </Typography>
  </div>
)
