/* eslint-disable react/button-has-type */
import React from 'react'
import Image from 'next/legacy/image'
import Typography from '../Typography'
import styles from './multiselectCheckboxTab.module.css'

export interface IMultiSelectCheckboxTab
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string
  imageUrl?: string
  checkboxGroupName: string
  id: string
  checked: boolean
  onChange: any
}

const MultiSelectCheckboxTab: React.FC<IMultiSelectCheckboxTab> = ({
  label,
  imageUrl,
  checkboxGroupName,
  id,
  checked,
  onChange,
  ...rest
}) => (
  <div className={styles.inputWrapper} {...rest}>
    <input
      type="checkbox"
      name={checkboxGroupName}
      id={id}
      checked={checked}
      onChange={onChange}
      className={styles.multiselectCheckbox}
    />
    <label htmlFor={id} className={styles.checkboxLabel}>
      {imageUrl && <Image src={imageUrl} width={18} height={18} className="rounded" />}
      <Typography variant="body2" classNames={`text-grey-700 ${imageUrl && 'ml-2'}`}>
        {label}
      </Typography>
    </label>
  </div>
)
export default MultiSelectCheckboxTab
