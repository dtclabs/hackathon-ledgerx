import { FC } from 'react'

interface IStatusChip {
  color?: 'primary' | 'warning'
  label: string
  size?: 'sm' | 'md' | 'lg'
}

const classes = {
  size: {
    sm: 'px-3 py-2',
    md: 'px-[10px] py-[6px] h-[30px] text-[12px] font-weight-medium',
    lg: 'px-3 py-2'
  },
  color: {
    primary: 'text-gray-500 bg-gray-900 active:bg-gray-300',
    secondary: 'bg-neutral-200 text-black hover:bg-white-700 focus:bg-white-700 active:bg-white-800 hover:opacity-75',
    success: 'bg-success text-white hover:bg-success hover:opacity-75',
    danger: 'bg-error-50 text-error-500',
    warning: 'bg-warning-50 text-warning-500',
    neutral: 'bg-blanca-100 text-blanca-800 border border-blanca-300',
  }
}

const StatusChip: FC<IStatusChip> = ({ color = 'primary', label, size = 'md' }) => (
  <span
    className={`${classes.color[color]} rounded-full opacity-75 font-bold text-sm flex align-center transition cursor-default duration-300 ease w-max`}
  >
    <span className={`flex items-center ${classes.size[size]} `}>{label}</span>
  </span>
)
export default StatusChip
