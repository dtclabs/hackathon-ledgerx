import React from 'react'

interface IRadioButton {
  width: string
  height: string
  isChecked: boolean
  value: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  accentColor?: string
  className?: string
  label?: string
  classNameRadio?: string
  indeterminate?: boolean
  onClick?: (e) => void
  disabled?: boolean
  classNameLabel?: string
  name?: string
}

const RadioButton: React.FC<Partial<IRadioButton>> = ({
  isChecked,
  value,
  onChange,
  className,
  label,
  classNameRadio,
  onClick,
  disabled,
  classNameLabel,
  name
}) => (
  <div className={`${className || 'flex gap-2'}`}>
    <input
      value={value}
      type="radio"
      checked={isChecked}
      onChange={onChange}
      disabled={disabled}
      onClick={onClick}
      id={`radio-${value}}`}
      className={`${
        classNameRadio ||
        'bg-gray-100 border-dashboard-main default:border-spacing-8 accent-white default:ring-2 w-5 h-5 flex-shrink-0 outline-8'
      }`}
      name={name}
    />
    {label && (
      <label htmlFor={`radio-${value}}`} className={`${classNameLabel} cursor-pointer`}>
        {label}
      </label>
    )}
  </div>
)

export default RadioButton
