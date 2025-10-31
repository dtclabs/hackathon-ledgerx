import { FC, forwardRef } from 'react'

interface ITextInputProps {
  extendedClass?: string
  placeholder?: string
  onChange?: (e: any) => void
  icon?: any
  id?: string
  value?: string
  register?: any
}

const TextInput = forwardRef<React.ReactNode, ITextInputProps>(
  ({ icon, extendedClass, id, register, ...rest }, ref) => (
    <div className="relative">
      <input
        type="text"
        id={id}
        ref={ref as any}
        name={id}
        {...register}
        {...rest}
        className={`border-[#EAECF0] border text-sm text-gray-700 placeholder:text-[#B5B5B3] placeholder:text-sm placeholder:leading-5 placeholder:italic w-full h-12 font-inter rounded flex gap-4 items-center px-3 focus:ring-0 focus:border-teal ${extendedClass}`}
      />
      {icon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <img src={icon} alt="Icon" className="h-4 w-4" />
        </div>
      )}
    </div>
  )
)

export default TextInput
