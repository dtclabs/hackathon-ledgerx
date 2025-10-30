/* eslint-disable react/button-has-type */
import React from 'react'
import Image from 'next/legacy/image'
import Typography from '../Typography'
import styles from './radioButtonCustom.module.css'

export interface IRadioButtonCustom
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  imageUrl?: string
  radioGroupName: string
  id: string
  checked: boolean
  labelClassNames?: string
  wrapperClassNames?: string
  disabled?: boolean
  onChange?: () => void
}

const RadioButtonCustom: React.FC<IRadioButtonCustom> = ({
  label,
  imageUrl,
  radioGroupName,
  id,
  checked,
  onChange,
  disabled,
  labelClassNames,
  wrapperClassNames,
  ...rest
}) => (
  <div className={`${styles.inputWrapper} ${disabled ? styles.disabledRadio : ''} ${wrapperClassNames}`}>
    <input
      type="radio"
      name={radioGroupName}
      id={id}
      checked={checked}
      onChange={onChange}
      className={styles.radioButtonCustom}
      disabled={disabled}
      {...rest}
    />
    <label htmlFor={id} className={styles.radioButtonLabel}>
      {imageUrl && <Image src={imageUrl} width={18} height={18} className="rounded" />}
      <Typography variant="body2" classNames={`text-grey-700 ${imageUrl && 'ml-2'} ${labelClassNames}`}>
        {label}
      </Typography>
    </label>
  </div>
)
export default RadioButtonCustom
