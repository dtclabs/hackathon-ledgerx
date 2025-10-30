/* eslint-disable jsx-a11y/label-has-associated-control */
import Typography from '@/components-v2/atoms/Typography'
import { useEffect } from 'react'

const SwitchButton = ({ label, className = '', check, onCheck, loading }) => (
  <div className={`flex items-center ${className}`}>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" value={check} onChange={onCheck} disabled={loading} />
      <div className="w-8 h-5 mr-2 bg-[#CECECC] peer-focus:outline-none rounded-full peer dark:bg-[#CECECC] peer-checked:after:translate-x-[12px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#2D2D2C]" />
      <Typography>{label}</Typography>
    </label>
  </div>
)

export default SwitchButton
