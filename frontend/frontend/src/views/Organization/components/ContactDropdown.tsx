/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { FC, useMemo } from 'react'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import Close from '@/assets/svg/Close.svg'
import Image from 'next/legacy/image'
import EmailIcon from '@/public/svg/icons/email-icon-v2.svg'
import TeleGramIcon from '@/public/svg/icons/telegram-icon.svg'
import WhatsAppIcon from '@/public/svg/icons/whatsapp-icon.svg'

interface IContactDropdownProps {
  watch: any
  index: any
  setValue: any
  trigger: any
  onClickRemoveContact: any
  removeable?: boolean
  setError: any
  clearErrors: any
}

const CONTACT_PROVIDERS = {
  Telegram: {
    label: 'Telegram',
    provider: 'Telegram',
    logo: TeleGramIcon,
    placeholder: 'Enter Telegram username'
  },
  WhatsApp: {
    label: 'WhatsApp',
    provider: 'WhatsApp',
    logo: WhatsAppIcon,
    placeholder: 'Enter WhatsApp number with dialling code e.g. +65123'
  },
  Email: {
    label: 'Email',
    provider: 'Email',
    logo: EmailIcon,
    placeholder: 'Enter Email address'
  },
  Other: {
    label: 'Other',
    provider: 'Other',
    placeholder: 'Enter Contact'
  }
}

const parseProviders = () => {
  const providers = []
  for (const [key, value] of Object.entries(CONTACT_PROVIDERS)) {
    providers.push({ value: value.provider, label: value.label })
  }
  return providers
}

const ContactDropdown: FC<IContactDropdownProps> = ({
  watch,
  index,
  removeable,
  setValue,
  trigger,
  onClickRemoveContact
}) => {
  const provider = watch(`contacts[${index}].provider`)
  const content = watch(`contacts[${index}].content`)

  const handleOnChangeProvider = (item) => () => {
    setValue(`contacts[${index}].provider`, item.value)
    setValue(`contacts[${index}].content`, '')
    trigger('contacts')
  }

  const handleOnChange = (e) => {
    setValue(`contacts[${index}].content`, e.target.value.toLowerCase())
    trigger('contacts')
  }

  const handleOnRemoveContact = () => {
    onClickRemoveContact(index)
  }

  const providers = useMemo(() => parseProviders(), [])

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 border border-[#EAECF0] rounded-lg p-0.5 w-full ">
        <NewFilterDropDown
          triggerButton={
            <div
              style={{ borderRadius: 5 }}
              className="w-[160px] bg-[#FBFAFA] rounded capitalize text-left ml-0.5 p-3 py-[10px] flex justify-between items-center text-grey-800 text-sm font-normal"
            >
              <div className="flex gap-2">
                {CONTACT_PROVIDERS[provider]?.logo && <Image src={CONTACT_PROVIDERS[provider].logo} alt="icon" />}
                <div>{CONTACT_PROVIDERS[provider].label ?? 'Select'}</div>
              </div>
              <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
            </div>
          }
        >
          {providers.map((item, _index) => (
            <button
              type="button"
              key={_index}
              onClick={handleOnChangeProvider(item)}
              className="text-grey-800 flex gap-2 items-center bg-white w-full py-2 px-4 capitalize text-sm text-left hover:bg-gray-50 font-inter"
            >
              {CONTACT_PROVIDERS[item.value]?.logo && <Image src={CONTACT_PROVIDERS[item.value].logo} alt="icon" />}
              <div>{item.label}</div>
            </button>
          ))}
        </NewFilterDropDown>
        <input
          type="text"
          value={content}
          onChange={handleOnChange}
          className=" focus:outline-none text-sm text-gray-700 placeholder:text-[#B5B5B3] placeholder:leading-5 w-full h-10 font-inter rounded-lg flex gap-4 items-center px-2"
          placeholder={CONTACT_PROVIDERS[provider].placeholder}
        />
      </div>
      {removeable && (
        <button
          type="button"
          onClick={handleOnRemoveContact}
          className="bg-[#FBFAFA] flex justify-center items-center p-[14px] rounded-full "
        >
          <Image src={Close} alt="close" height={8} width={8} />
        </button>
      )}
    </div>
  )
}

export default ContactDropdown
