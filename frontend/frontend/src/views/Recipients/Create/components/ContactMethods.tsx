import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import { IProviderField } from '@/hooks-v2/contact/type'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import { contactProvidersSelector } from '@/slice/contacts/contacts-slice'
import { useAppSelector } from '@/state'
import Image from 'next/legacy/image'
import React from 'react'

interface IContactMethods {
  control: any
  errors: any
  providerFields: IProviderField[]
  onRemoveProvider: (index: number) => void
  onAppendProvider: () => void
  onUpdateProvider: (index: number, value) => void
}

const ContactMethods: React.FC<IContactMethods> = ({
  control,
  errors,
  providerFields,
  onAppendProvider,
  onRemoveProvider,
  onUpdateProvider
}) => {
  const contactProviders = useAppSelector(contactProvidersSelector)

  return (
    <div className="rounded-lg border border-grey-200">
      <div className="bg-[#F9FAFB] rounded-t-lg p-4 flex items-center justify-between">
        <Typography variant="body1" color="dark" styleVariant="semibold">
          Contact Methods
        </Typography>
        <Button height={32} variant="grey" label="+ Add a Contact Method" onClick={onAppendProvider} />
      </div>
      <div className="flex flex-col gap-6 p-4">
        {providerFields.map((provider, index) => {
          const providerName =
            contactProviders?.find((_provider) => _provider.id === provider.providerId)?.name || 'Telegram'
          return (
            <div key={provider.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center w-full focus-within:shadow-inputField border border-grey-200 p-1 gap-4">
                  <NewFilterDropDown
                    triggerButton={
                      <div className="w-[152px] bg-grey-100 border border-grey-200 rounded text-left px-3 py-[10px] flex justify-between items-center">
                        <Typography>{providerName}</Typography>
                        <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                      </div>
                    }
                  >
                    {(contactProviders || []).map((item) => (
                      <Button
                        key={item.id}
                        variant="whiteWithBlackBorder"
                        height={40}
                        onClick={() => {
                          onUpdateProvider(index, {
                            ...provider,
                            providerId: item.id,
                            content: ''
                          })
                        }}
                        label={item.name}
                        classNames={`!border-0 w-full !justify-start !font-normal ${item.id === '4' && 'bg-gray-50'}`}
                      />
                    ))}
                  </NewFilterDropDown>
                  <TextField
                    control={control}
                    errors={errors}
                    classNameInput="focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-[38px] pr-4"
                    errorClass="mt-1"
                    name={`providers.${index}.content`}
                    placeholder={`Enter ${providerName} contact`}
                  />
                </div>
                {providerFields.length > 1 && (
                  <Button
                    height={48}
                    variant="ghost"
                    leadingIcon={<Image src={DeleteIcon} alt="delete" height={16} width={16} />}
                    onClick={() => onRemoveProvider(index)}
                  />
                )}
              </div>
              {errors && errors?.providers && errors?.providers?.[index].content && (
                <HelperText helperText={errors.providers[index].content.message} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ContactMethods
