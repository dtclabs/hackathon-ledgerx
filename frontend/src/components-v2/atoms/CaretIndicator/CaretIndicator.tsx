import CaretIcon from '@/public/svg/icons/caret-icon.svg'
import Image from 'next/legacy/image'

const CaretIndicator = (props) => {
  const { selectProps, innerProps } = props
  const { menuIsOpen } = selectProps

  return (
    <div {...innerProps} className="flex justify-center items-center ml-2 mr-2">
      <div
        className={`bg-slate-200 h-[20px] w-[20px] flex justify-center items-center ${selectProps?.customStyles?.indicatorStyles}`}
      >
        <Image
          src={CaretIcon}
          alt="caret"
          height={8}
          width={8}
          className={`${menuIsOpen ? 'rotate-180' : ''} transition-transform`}
        />
      </div>
    </div>
  )
}

export default CaretIndicator
