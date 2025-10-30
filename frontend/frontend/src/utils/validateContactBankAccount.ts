import { EContactType } from '@/slice/contacts/contacts.types'

export const validateBankAccount = (requiredFields, payload) => {
  for (const key of Object.keys(requiredFields.destinationAccount)) {
    const element = requiredFields.destinationAccount[key]

    if (element.required && !payload.destinationAccount[key]) {
      return false
    }

    if (element.options && !element.options.includes(payload.destinationAccount[key].toString())) {
      return false
    }
  }

  switch (payload.type) {
    case EContactType.individual:
      if (!payload.individual) {
        return false
      }
      // Validate required fields
      for (const key of Object.keys(requiredFields.individual)) {
        const element = requiredFields.individual[key]

        if (element.required && !payload.individual[key]) {
          return false
        }

        if (element.options && !element.options.includes(payload.individual[key].toString())) {
          return false
        }
      }
      break
    case EContactType.organization:
      if (!payload.company) {
        return false
      }
      // Validate required fields
      for (const key of Object.keys(requiredFields.company)) {
        const element = requiredFields.company[key]

        if (element.required && !payload.company[key]) {
          return false
        }

        if (element.options && !element.options.includes(payload.company[key].toString())) {
          return false
        }
      }
      break
    default:
      return false
  }

  return true
}
