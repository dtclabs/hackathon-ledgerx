import Image from 'next/legacy/image'
import React, { useEffect, useRef } from 'react'

interface ICheckbox {
  width: string
  height: string
  isChecked: boolean
  value: string
  imageUrl?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onClick?: (e) => void
  accentColor?: string
  className?: string
  label?: any
  classNameCheckbox?: string
  disabled?: boolean
  indeterminate?: boolean
  extendClass?: string
  indeterminateClassName?: string
}

const Checkbox: React.FC<Partial<ICheckbox>> = ({
  height,
  isChecked,
  width,
  value,
  imageUrl,
  onChange,
  onClick,
  accentColor,
  className,
  label,
  classNameCheckbox,
  disabled,
  indeterminate,
  extendClass,
  indeterminateClassName,
  ...rest
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (indeterminate) {
      checkboxRef.current.indeterminate = true
    } else {
      checkboxRef.current.indeterminate = false
    }
  }, [indeterminate])

  return (
    <div className={`${className || 'flex gap-2 relative items-center'}`}>
      <input
        {...rest}
        value={value}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        onClick={onClick}
        id={`checkbox-${value}}`}
        className={`${classNameCheckbox || 'rounded accent-dashboard-main flex-shrink-0 w-5 h-5'} ${extendClass} ${
          indeterminate ? 'appearance-none indeterminate:bg-dashboard-main indeterminate:rounded-sm' : ''
        }`}
        ref={checkboxRef}
        style={{
          accentColor
        }}
      />
      {indeterminate && (
        <span
          aria-hidden
          onClick={() => checkboxRef.current.click()}
          className={`w-[10px] h-[3px] absolute top-2 left-[5px] bg-white rounded-md ${indeterminateClassName}`}
        />
      )}
      {label && (
        <div className="truncate flex items-center gap-2">
          {imageUrl && <Image src={imageUrl} width={16} height={16} />}
          <p className="truncate">{label}</p>
        </div>
      )}
    </div>
  )
}

export default Checkbox
