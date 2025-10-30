import Typography from '@/components-v2/atoms/Typography'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'

const RecipientBankAccountLabel = (props: IFormatOptionLabel) =>
  props.isDisabled ? (
    <div className="w-full flex items-center whitespace-nowrap rounded text-sm leading-5 justify-between font-medium opacity-70">
      <div className="flex  items-center gap-3 max-w-[70%] pr-3">
        <Avvvatars style="shape" size={24} value={props.value} />
        <Typography classNames="truncate max-w-[120px]" color="dark">
          {props.label}
        </Typography>
      </div>
      <div className="flex items-center">
        <Typography>{toShort(props?.bankName, 10, 10)}</Typography>
        <Typography classNames="p-0" color="dark">
          {`-${props?.accountNumber}`}
        </Typography>
        <DividerVertical height="h-4" space="mx-4" />
        {props.src && (
          <div className="flex items-center justify-center w-6 h-6 bg-transparent rounded-full mr-4">
            <img src={props.src} alt="Token" className="h-3 w-auto" />
          </div>
        )}
        <Typography classNames="p-0" color="dark">
          {props?.currencyCode}
        </Typography>
      </div>
    </div>
  ) : (
    <div className="w-full flex items-center whitespace-nowrap rounded text-sm leading-5 justify-between font-medium">
      <div className="flex  items-center gap-3 max-w-[70%] pr-3">
        <Avvvatars style="shape" size={24} value={props.value} />
        <Typography classNames="truncate max-w-[120px]" color="dark">
          {props.label}
        </Typography>
      </div>
      <div className="flex items-center">
        <Typography>{toShort(props?.bankName, 10, 10)}</Typography>
        <Typography classNames="p-0" color="dark">
          {`-${props?.accountNumber}`}
        </Typography>
        <DividerVertical height="h-4" space="mx-4" />
        {props.src && (
          <div className="flex items-center justify-center w-6 h-6 bg-transparent rounded-full mr-4   ">
            <img src={props.src} alt="Token" className="h-3 w-auto" />
          </div>
        )}
        <Typography classNames="p-0" color="dark">
          {props?.currencyCode}
        </Typography>
      </div>
    </div>
  )

export default RecipientBankAccountLabel
