/* eslint-disable react/button-has-type */
import React from 'react'
import Typography from '../Typography'
import styles from './radioButtonSwitch.module.css'

export interface IRadioButtonSwitch
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  subtitle?: string
  radioGroupName: string
  id: string
  checked: boolean
  labelClassNames?: string
  wrapperClassNames?: string
  disabled?: boolean
  onChange?: () => void
}

const RadioButtonSwitch: React.FC<IRadioButtonSwitch> = ({
  label,
  subtitle,
  radioGroupName,
  id,
  checked,
  onChange,
  disabled,
  ...rest
}) => (
  <>
    <input
      type="radio"
      name={radioGroupName}
      id={id}
      checked={checked}
      onChange={onChange}
      className={styles.radioButtonSwitch}
      disabled={disabled}
      {...rest}
    />
    <label htmlFor={id} className={styles.radioButtonSwitchLabel}>
      <p>{label}</p>
      {subtitle && <span>{subtitle}</span>}
    </label>
  </>
)
export default RadioButtonSwitch
