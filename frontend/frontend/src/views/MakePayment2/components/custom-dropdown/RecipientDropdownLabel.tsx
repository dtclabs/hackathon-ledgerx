import Typography from '@/components-v2/atoms/Typography'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'

const RecipientDropdownLabel = (props: IFormatOptionLabel) => (
  <div
    className={`w-full flex items-center whitespace-nowrap rounded text-sm leading-5 justify-between font-medium ${
      props.isDisabled && 'opacity-70'
    }`}
  >
    <div className="flex  items-center gap-3 max-w-[70%] pr-3">
      <Avvvatars style="shape" size={24} value={props.address} />
      <Typography classNames="truncate max-w-[120px]" color="dark">
        {props.label}
      </Typography>
    </div>
    <div className="flex items-center">
      <Typography classNames="p-0 lowercase" color="dark">
        {toShort(props.address, 5, 4)}
      </Typography>
      {props.src && (
        <>
          <DividerVertical height="h-4" space="mx-4" />
          <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
            <img src={props.src} alt="Token" className="h-3 w-auto" />
          </div>
        </>
      )}
    </div>
  </div>
)

export default RecipientDropdownLabel
