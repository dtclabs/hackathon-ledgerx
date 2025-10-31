import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { toShort } from '@/utils/toShort'
import Avvvatars from 'avvvatars-react'
import { components, SingleValueProps } from 'react-select'
import ContactIcon from '@/public/svg/icons/contact-unknown-avatar.svg'
import Image from 'next/legacy/image'

const PaymentContactSingleValue = (props: SingleValueProps<any>, onSave: (address: string) => void) => (
  <components.SingleValue {...props}>
    <div className="w-full flex items-center gap-3 justify-between">
      <div
        className={`w-full flex items-center whitespace-nowrap rounded text-sm leading-5 gap-3 font-medium ${
          props.data?.isUnknown && 'max-w-[calc(100%-130px)]'
        }`}
      >
        {props?.data?.isUnknown ? (
          <Image className="border-rounded" src={ContactIcon} height={24} width={24} alt="contact-icon" />
        ) : (
          <Avvvatars style="shape" size={24} value={props.data.address} />
        )}

        {props?.data?.isUnknown ? (
          <>
            <Typography classNames="p-0 truncate max-w-[calc(100%-110px)]" color="tertiary">
              {props.data.address}
            </Typography>
            <Typography color="dark">Unknown</Typography>
          </>
        ) : (
          <>
            {' '}
            <Typography classNames="truncate max-w-[calc(100%-110px)]" color="dark">
              {props.data.label}
            </Typography>
            <Typography classNames="p-0 lowercase" color="tertiary">
              {toShort(props.data.address, 5, 4)}
            </Typography>
          </>
        )}
      </div>
      {props.data?.isUnknown && (
        <Button
          variant="transparent"
          height={32}
          label="Add To Contacts"
          classNames="border-none px-0 font-semibold text-xs hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            onSave(props.data.address)
          }}
        />
      )}
    </div>
  </components.SingleValue>
)
export default PaymentContactSingleValue
