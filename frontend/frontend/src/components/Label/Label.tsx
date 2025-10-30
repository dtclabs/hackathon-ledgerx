import Image from 'next/legacy/image'
import { EAccountStatus } from '@/slice/account/account-interface'
import loader from '@/public/svg/Loader.svg'
import { IConfirmation } from '@/slice/old-tx/interface'

export const SuccessLabel = () => (
  <div className="py-1 pl-4 pr-6 rounded-2xl text-center bg-green-100 text-white flex gap-2 w-full items-center">
    Success <img src="/image/Tick.png" alt="tick" className="h-2 w-auto" />
  </div>
)

export const PendingLabel = () => (
  <div className="py-1 px-4 rounded-2xl text-center bg-primary-blue text-white">Pending</div>
)

export const groupLabel = (name: string, key?: any) => (
  <div
    key={key}
    className="py-1 px-4 bg-gray-100 text-sm font-medium text-gray-700 items-center rounded-xl  text-center "
  >
    {name}
  </div>
)

export const accountStatusLabel = (status: EAccountStatus) =>
  (status === EAccountStatus.ACTIVE && (
    <div className="py-1 px-4  rounded-2xl justify-center bg-green-100 text-white flex gap-2 w-full items-center capitalize">
      {status}
    </div>
  )) ||
  (status === EAccountStatus.INACTIVE && (
    <div className="py-1 px-4  rounded-2xl justify-center bg-grey-900 text-white flex gap-2 w-full items-center capitalize">
      {status}
    </div>
  )) ||
  (status === EAccountStatus.INVITED && (
    <div className="py-1 px-4  rounded-2xl justify-center bg-primary-blue text-white flex gap-2 w-full items-center capitalize">
      {status}
    </div>
  )) ||
  (status === EAccountStatus.REJECTED && (
    <div className="py-1 px-4  rounded-2xl justify-center bg-grey-900 text-white flex gap-2 w-full items-center capitalize">
      {status}
    </div>
  )) ||
  (status === EAccountStatus.EXPIRED && (
    <div className="py-1 px-4  rounded-2xl justify-center bg-gray-300 text-white flex gap-2 w-full items-center capitalize">
      {status}
    </div>
  ))

export const OwnerPendingLabel = () => (
  <div className="flex gap-1 justify-center items-center w-full  text-sm leading-4 font-supply text-[#EB910C]">
    <img src="/svg/YellowClock.svg" alt="Clock" />
    Pending
  </div>
)

export const OwnerConfirmedLabel = () => (
  <div className="flex gap-1 justify-end items-center w-full  text-sm leading-4 font-supply text-[#27AE60]">
    <img src="/svg/GreenTick.svg" alt="Tick" />
    Confirmed
  </div>
)

export const OwnerRejectedLabel = () => (
  <div className="flex gap-1 justify-end items-center w-full  text-sm leading-4 font-supply text-[#E93636]">
    <img src="/svg/RedX.svg" alt="Close" />
    Rejected
  </div>
)

export const LabelSuccessful = () => (
  <div className="flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 bg-[#CFF9E1] text-[#27AE60] ">
    <div className="h-full w-auto block">
      <img src="/svg/GreenTick.svg" alt="Process" />
    </div>
    Successful
  </div>
)

export const ReceivedLabel = () => (
  <div className="flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 bg-[#CFF9E1] text-[#27AE60] ">
    <div className="h-full w-auto block">
      <img src="/svg/GreenTick.svg" alt="Process" />
    </div>
    Received
  </div>
)

export const LabelRejected = () => (
  <div className="flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 bg-[#FCE4E4] text-[#E93636] ">
    <div className="h-full w-auto">
      <img src="/svg/RedX.svg" alt="Process" />
    </div>
    Rejected
  </div>
)

export const OnChainRejection = () => (
  <div className="flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 bg-[#FCE4E4] text-[#E93636] ">
    <div className="h-full w-auto">
      <img src="/svg/RedX.svg" alt="Process" />
    </div>
    On-chain rejection
  </div>
)
export const SkeletonLabel = () => <div className="rounded-[30px] h-8 w-20 bg-gray-400 " />

export const LabelPending = () => (
  <div className="flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 bg-[#FCE4E4] text-[#E93636] ">
    <div className="flex items-center animate-spin w-3 h-auto ">
      <Image src={loader} alt="loader" />
    </div>
    Pending
  </div>
)

export const StatusSuccessLabel = ({
  status,
  height,
  width,
  className,
  pending
}: {
  status: string
  width?: number
  height?: number
  className?: string
  pending?: boolean
}) => (
  <div
    className={`${
      className ||
      `flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 ${
        !pending ? '  text-[#27AE60]' : ' text-[#EB910C]'
      }`
    }`}
  >
    <div className="h-full w-auto block">
      {!pending ? (
        <img src="/svg/GreenTick.svg" alt="Process" width={width} height={height} />
      ) : (
        <img src="/svg/YellowClock.svg" alt="Pending" width={width} height={height} />
      )}
    </div>
    {status}
  </div>
)

export const StatusRejectedLabel = ({
  status,
  height,
  width,
  className,
  nobg
}: {
  status: string
  width?: number
  height?: number
  className?: string
  nobg?: boolean
}) => (
  <div
    className={`${
      className ||
      `flex gap-2 items-center px-3 py-2 rounded-[30px] text-sm font-medium leading-4 ${
        !nobg && ' bg-[#FCE4E4]'
      } text-[#E93636]`
    }`}
  >
    <div className="h-full w-auto">
      <img src="/svg/RedX.svg" alt="Rejected" width={width} height={height} />
    </div>
    {status}
  </div>
)

export const StatusPendingLabel = ({
  status,
  height,
  width,
  className
}: {
  status: string
  width?: number
  height?: number
  className?: string
}) => (
  <div className={`${className || 'flex gap-2 items-center w-full  text-sm leading-4 text-[#EB910C]'}`}>
    <img src="/svg/YellowClock.svg" alt="Pending" width={width} height={height} />
    {status}
  </div>
)

export const RecipientConfirmLabel = ({ count, total }: { total: number; count: number }) => (
  <div
    className={`flex items-center gap-2.5 text-sm whitespace-nowrap leading-4 ${
      (count === total && 'text-[#27AE60]') || (count < total && 'text-[#EB910C]')
    }`}
  >
    {(count === total && <img src="/svg/GreenTick.svg" alt="tick" />) ||
      (count < total && <img src="/svg/YellowClock.svg" alt="Pending" />)}
    {`${count}/${total} ${(count === total && 'Confirmed') || (count < total && 'Pending')} `}
  </div>
)

export const TransactionLabel = ({
  threshold,
  confirmations,
  address,
  isRejectTransaction
}: {
  threshold: number
  confirmations: IConfirmation[]
  address: string
  isRejectTransaction: boolean
}) => (
  <div
    className={`flex items-center gap-2.5 text-sm whitespace-nowrap leading-4 ${
      isRejectTransaction ? 'text-[#C61616]' : 'text-[#27AE60]'
    }`}
  >
    {isRejectTransaction ? <img src="/svg/RedX500.svg" alt="RedX" /> : <img src="/svg/GreenTick.svg" alt="tick" />}
    {`${confirmations.length}/${threshold} ${isRejectTransaction ? 'Rejected' : 'Confirmed'} `}
  </div>
)

export const FlagStatusLabel = ({
  status,
  className = 'text-[10px] px-1.5 py-0.5 rounded-full leading-4 text-error-500 bg-error-50'
}: {
  status: string
  width?: number
  height?: number
  className?: string
}) => <div className={className}>{status}</div>
