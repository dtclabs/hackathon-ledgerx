import Image from 'next/legacy/image'
import RedWarningIcon from '@/public/svg/icons/warning-round-red.svg'

const ErrorBanner = ({ children, classNames }) => (
  <div className={`bg-[#F9E8E8] border border-[#E59494] flex rounded px-4 py-3 gap-4 ${classNames}`}>
    <Image src={RedWarningIcon} width={16} height={16} className="self-start" />
    <div>{children}</div>
  </div>
)

export default ErrorBanner
