import { FC, forwardRef, HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'
import Image from 'next/legacy/image'
import Close from '@/public/svg/CloseGray.svg'
import searchIcon from '@/assets/svg/search.svg'

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string
  placeholder?: string
  onChange: any
  text?: HTMLInputTypeAttribute
  id?: string
  classNames?: string
  isSearch?: boolean
  handleReset?: any
  reset?: boolean
  style?: any
  disabled?: boolean
  wrapClassNames?: string
}

const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ classNames, placeholder, isSearch, handleReset, reset, text = 'text', wrapClassNames, ...rest }, ref) => (
    <div className={`flex items-center border-[#EAECF0] border rounded w-full ${wrapClassNames}`}>
      {isSearch && (
        <div className="flex pl-4 items-center">
          <Image src={searchIcon} width={12} height={12} />
        </div>
      )}
      <input
        ref={ref}
        className={`focus:outline-none text-sm text-gray-700 placeholder:text-[#B5B5B3] placeholder:text-sm placeholder:leading-5 placeholder:italic w-full h-12 font-inter rounded flex gap-4 items-center px-3 ${classNames}`}
        placeholder={placeholder}
        type={text}
        {...rest}
      />
      {reset && (
        <div className="pr-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
          >
            <Image src={Close} alt="close" height={10} width={10} />
          </button>
        </div>
      )}
    </div>
  )
)

export default Input
