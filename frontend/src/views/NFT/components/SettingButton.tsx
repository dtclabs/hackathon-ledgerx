import Button from '@/components-v2/atoms/Button'
import DropDown from '@/components/DropDown/DropDown'
import SettingIcon from '@/components/SVGs/SideBarIcons/SettingIcon'
import { useMemo, useState } from 'react'

const SettingButton = ({ isGroupCollection, setExtendSettings, extendSettings }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const triggerButton = () => (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        setIsShowDropDown(!isShowDropDown)
      }}
      variant="ghost"
      height={32}
      trailingIcon={<SettingIcon />}
    />
  )
  const handleSelect = (option) => {
    if (option.value === 'collapse') {
      setExtendSettings({
        collapseAll: true,
        extendAll: false
      })
    } else if (option.value === 'expand') {
      setExtendSettings({
        collapseAll: false,
        extendAll: true
      })
    }
    setIsShowDropDown(false)
  }
  const settings = useMemo(
    () => [
      {
        value: 'expand',
        label: 'Expand all',
        disabled: !isGroupCollection || extendSettings.extendAll
      },
      {
        value: 'collapse',
        label: 'Collapse all',
        disabled: !isGroupCollection || extendSettings.collapseAll
      }
    ],
    [extendSettings, isGroupCollection]
  )

  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={triggerButton()}
      maxHeight="max-h-[400px]"
    >
      <div className="w-full flex flex-col rounded-lg">
        {settings &&
          settings.map((item) => (
            <button
              type="button"
              key={item.value}
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(item)
              }}
              className={`text-gray-700 flex justify-between items-center bg-white w-[150px] h-[42px] py-2 px-4 truncate text-sm text-left hover:bg-grey-100 font-inter disabled:cursor-not-allowed disabled:opacity-40 ${
                !item.label && 'bg-grey-200'
              }`}
            >
              {item.label}
            </button>
          ))}
      </div>
    </DropDown>
  )
}

export default SettingButton
