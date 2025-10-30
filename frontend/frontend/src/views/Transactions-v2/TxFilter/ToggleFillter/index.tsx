import React, { useState, useEffect } from 'react'
import ToggleSwitch from '@/components-v2/atoms/ToggleSwitch'
import { useFormContext } from 'react-hook-form'

interface ICheckBoxFilter {
  name: string
  value: string
  selection: string
  isReset: boolean
}

const ToggleFillter: React.FC<ICheckBoxFilter> = ({ name, value, selection, isReset }) => {
  const { setValue, watch } = useFormContext()
  const [checked, setChecked] = useState<boolean>(!!selection)

  useEffect(() => {
    if (isReset) setChecked(!!selection)
  }, [isReset, selection])

  const handleChange = () => {
    setChecked(!checked)
    setValue(name, !checked ? [value] : [])
  }
  return <ToggleSwitch checked={checked} onChange={handleChange} />
}

export default ToggleFillter
