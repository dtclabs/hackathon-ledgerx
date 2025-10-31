import RadioButtonCustom from '@/components-v2/atoms/RadioButtonCustom'
import Typography from '@/components-v2/atoms/Typography'
import { EContactType } from '@/slice/contacts/contacts.types'
import React from 'react'

type IContactTypeSelector = {
  contactType: EContactType
  onChange: (contact: EContactType) => void
}

const CONTACT_TYPE_OPTIONS = [
  { label: 'Individual Contact', value: EContactType.individual },
  { label: 'Organisation Contact', value: EContactType.organization }
]

const ContactTypeSelector: React.FC<IContactTypeSelector> = ({ contactType, onChange }) => (
  <div className="flex flex-col gap-4 mb-6">
    <Typography variant="body1" color="dark" styleVariant="semibold">
      Contact Type
    </Typography>
    <div className="flex items-center gap-2">
      {CONTACT_TYPE_OPTIONS.map((_option) => (
        <RadioButtonCustom
          label={_option.label}
          checked={contactType === _option.value}
          onChange={() => {
            onChange(_option.value)
          }}
          radioGroupName="contact-type-selector"
          id={_option.value}
          key={_option.value}
          labelClassNames="py-2"
          wrapperClassNames="!px-3"
        />
      ))}
    </div>
  </div>
)

export default ContactTypeSelector
