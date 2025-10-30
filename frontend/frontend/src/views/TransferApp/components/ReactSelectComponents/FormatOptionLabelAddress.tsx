import Typography from '@/components-v2/atoms/Typography'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'

const FormatOptionLabelAddress = (props: IFormatOptionLabel) => {
  const { fiatCurrency: fiatCurrencySetting } = useAppSelector(orgSettingsSelector)

  return props?.value ? (
    <div className="w-full flex items-center whitespace-nowrap rounded text-sm leading-5 font-medium font-inter justify-between ">
      <div className="flex flex-1 items-center gap-3 max-w-[70%] pr-3">
        <div className="flex-shrink-0">
          <Avvvatars style="shape" size={24} value={props.label} />
        </div>
        <Typography classNames="truncate max-w-[120px]" color="primary">
          {props.label}
        </Typography>
        <Typography classNames="truncate !text-grey-700">
          {`${fiatCurrencySetting?.symbol}${props.totalPrice}`}
        </Typography>
      </div>
      <div className="flex items-center truncate">
        <Typography classNames="!text-grey-700 p-0">{toShort(props.address, 5, 4)}</Typography>
        <DividerVertical height="h-4" space="mx-4" />
        <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
          <img src="/svg/ETH.svg" alt="Token" className="h-3 w-auto" />
        </div>
      </div>
    </div>
  ) : (
    <Typography styleVariant="medium" classNames="!text-[#B5B5B3]" variant="body2">
      Please select your wallet
    </Typography>
  )
}
export default FormatOptionLabelAddress
