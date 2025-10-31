/* eslint-disable react/button-has-type */
import React from 'react'
import Image from 'next/legacy/image'
import Typography from '../Typography'
import styles from './checkboxCustom.module.css'

export interface ICheckboxCustom
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  imageUrl?: string
  checkboxGroupName: string
  id: string
  checked: boolean
  inputExtendClassName?: string
  wrapperClassName?: string
  onChange: (e) => void
}

const CheckboxCustom: React.FC<ICheckboxCustom> = ({
  label,
  imageUrl,
  checkboxGroupName,
  id,
  checked,
  onChange,
  inputExtendClassName,
  wrapperClassName,
  disabled,
  ...rest
}) => (
  <div className={`${styles.chainSelector} ${wrapperClassName}`}>
    <input
      type="checkbox"
      name={checkboxGroupName}
      id={id}
      checked={checked}
      onChange={onChange}
      disabled = {disabled}
      className={`${styles.checkbox} ${inputExtendClassName}`}
    />
    <label htmlFor={id} className={styles.label}>
      {imageUrl && <Image src={imageUrl} width={18} height={18} className="rounded" />}
      <Typography variant="body2" classNames={`text-grey-700 ${imageUrl && 'ml-2'}`}>
        {label}
      </Typography>
    </label>
  </div>
)
export default CheckboxCustom
