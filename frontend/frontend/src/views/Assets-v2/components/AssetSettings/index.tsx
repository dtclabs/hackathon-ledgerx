import DropDown from '@/components/DropDown/DropDown'
import React, { useState, useMemo } from 'react'
import Image from 'next/legacy/image'
import Setting from '@/public/svg/icons/settings-icon.svg'
import { ISettingOptions } from '../..'
import { useAppDispatch } from '@/state'
import { setAssetSettings } from '@/slice/assets/asset-slice'

interface IAssetSettings {
  settings: ISettingOptions
  setSettings: (settings: ISettingOptions) => void
}

const AssetSettings: React.FC<IAssetSettings> = ({ settings, setSettings }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const dispatch = useAppDispatch()
  const triggerButton = () => (
    <button
      type="button"
      className={`border border-grey-200 h-[34px] py-2 px-3 rounded flex items-center justify-between ${
        isShowDropDown && 'shadow-button'
      }`}
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
    >
      <Image src={Setting} alt="setting" />
    </button>
  )

  const settingOptions = [
    { value: 'expand', label: 'Expand All', disabled: settings.view === 'single' },
    { value: 'collapse', label: 'Collapse All', disabled: settings.view === 'single' },
    {
      value: settings.view === 'single' ? 'group' : 'single',
      label: settings.view === 'single' ? 'Group assets' : 'Ungroup assets'
    }
  ]

  const handleSelect = (option) => {
    if (option.value === 'group' || option.value === 'single') {
      setSettings({
        collapse: false,
        expand: false,
        view: option.value
      })
      dispatch(
        setAssetSettings({
          collapse: false,
          expand: false,
          view: option.value
        })
      )
    } else if (option.value === 'collapse') {
      setSettings({
        ...settings,
        collapse: true,
        expand: false
      })
      dispatch(
        setAssetSettings({
          ...settings,
          collapse: true,
          expand: false
        })
      )
    } else if (option.value === 'expand') {
      setSettings({
        ...settings,
        collapse: false,
        expand: true
      })
      dispatch(
        setAssetSettings({
          ...settings,
          collapse: false,
          expand: true
        })
      )
    }
    setIsShowDropDown(false)
  }

  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={triggerButton()}
      className="w-[170px]"
    >
      <div className="overflow-auto scrollbar max-h-[176px]">
        {settingOptions.length > 0 &&
          settingOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              disabled={option.disabled}
              className="w-full text-sm font-medium text-left text-grey-800 py-2 px-4 hover:bg-grey-200 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(option)
              }}
            >
              {option.label}
            </button>
          ))}
      </div>
    </DropDown>
  )
}

export default AssetSettings
