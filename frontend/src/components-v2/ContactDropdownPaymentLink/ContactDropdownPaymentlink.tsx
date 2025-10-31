/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { FC, useState, useMemo } from 'react'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import CONTACT_PROVIDERS from '@/constants/providers'

interface IContactDropdownProps {
  watch: any
  index: any
  setValue: any
  trigger: any
  onClickRemoveAddress: any
}

const PLACEHOLDER_MAP = {
  twitter: 'Please enter your twitter handle'
}

export const PROVIDER_MAP = {
  1: CONTACT_PROVIDERS.email.label,
  2: CONTACT_PROVIDERS.twitter.label,
  3: CONTACT_PROVIDERS.discord.label,
  4: CONTACT_PROVIDERS.telegram.label
}

const PROVIDER_PLACEHOLDER_MAP = {
  1: 'Enter your email address',
  2: 'Enter your twitter handle',
  3: 'Enter your discord username',
  4: 'Enter your telegram handle'
}

const parseProviders = () => {
  const providers = []
  for (const [key, value] of Object.entries(CONTACT_PROVIDERS)) {
    providers.push({ value: value.providerId, label: value.label })
  }
  return providers
}

const ContactDropdownInput: FC<IContactDropdownProps> = ({ watch, index, setValue, trigger, onClickRemoveAddress }) => {
  const providerId = watch(`contacts[${index}].providerId`)
  const content = watch(`contacts[${index}].content`)

  const handleOnChangeProvider = (item) => () => {
    setValue(`contacts[${index}].providerId`, item.value)
    trigger(`contacts[${index}].providerId`)
  }

  const handleOnChange = (e) => {
    // setProviderType(item)
    setValue(`contacts[${index}].content`, e.target.value.toLowerCase())
    trigger(`contacts[${index}].content`)
  }

  const handleOnRemoveAddress = () => {
    onClickRemoveAddress(index)
  }

  const providers = useMemo(() => parseProviders(), [])

  return (
    <div>
      <div className="flex items-stretch gap-2 my-2 mt-4 h-[36px]" style={{ backgroundColor: '#1D2939' }}>
        <div className="flex items-center gap-2 border border-[#1D2939] rounded-lg p-0.5 w-full ">
          <NewFilterDropDown
            triggerButton={
              <div
                style={{ color: '#F2F4F7' }}
                className="w-[95px] bg-[#344054] h-[28px] rounded capitalize text-left p-3 flex justify-between items-center text-black-0 text-xs font-medium"
              >
                {PROVIDER_MAP[providerId] ?? 'Select'}
                <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
              </div>
            }
          >
            {providers.map((item, _index) => (
              <button
                type="button"
                key={_index}
                onClick={handleOnChangeProvider(item)}
                className="text-gray-700 flex justify-between items-center bg-white w-full   py-2 px-4 capitalize text-base text-left hover:bg-gray-50 font-inter"
              >
                {item.label}
              </button>
            ))}
          </NewFilterDropDown>
          <input
            type="text"
            style={{ backgroundColor: '#1D2939', color: 'white' }}
            value={content}
            onChange={handleOnChange}
            className=" focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:italic placeholder:text-xs  w-full font-inter rounded-lg flex gap-4 items-center px-1"
            placeholder={PROVIDER_PLACEHOLDER_MAP[providerId]}
          />
          <img
            className="p-3 pl-1 hover:cursor-pointer hover:opacity-50"
            src="/svg/icons/close-icon.svg"
            onClick={handleOnRemoveAddress}
            alt="close"
            height={25}
          />
        </div>
      </div>
    </div>
  )
}

export default ContactDropdownInput
