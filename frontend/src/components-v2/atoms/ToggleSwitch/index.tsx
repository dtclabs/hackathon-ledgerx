/* eslint-disable react/button-has-type */
import React from 'react'
import styles from './toggleSwitch.module.css'

export interface IToggleSwitch
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  checked: boolean
  onChange: () => void
  id?: string
}

/* eslint-disable jsx-a11y/label-has-associated-control */
const ToggleSwitch: React.FC<IToggleSwitch> = ({ checked, onChange, id }) => (
  <>
    <input type="checkbox" checked={checked} onChange={onChange} id={`switch-${id}`} className={styles.toggle} />
    <label htmlFor={`switch-${id}`} className={styles.toggleLabel} />
  </>
)
export default ToggleSwitch
