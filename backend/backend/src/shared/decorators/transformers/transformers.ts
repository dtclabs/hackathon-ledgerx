import { Transform } from 'class-transformer'
import Decimal from 'decimal.js'

export function ToArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) {
      return null
    }
    return Array.isArray(value) ? value : [value]
  })
}

export function ToArrayLowerCase(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) {
      return value
    }
    return Array.isArray(value) ? value.map((v) => v.toLowerCase()) : [value?.toLowerCase()]
  })
}

export function ToLowerCaseAndTrim(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) {
      return value
    }
    return value.toLowerCase().trim()
  })
}

export function ToDecimal(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return value
    }

    //Should return Instance of Decimal, but if value is invalid, we expect that class-validator will handle it
    //see @IsInstance(Decimal) in the DTO
    try {
      return new Decimal(value)
    } catch (error) {
      return value
    }
  })
}

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return value
    }

    try {
      if (value?.toString()?.toLowerCase() === 'true') return true
      if (value?.toString()?.toLowerCase() === 'false') return false
      return value
    } catch (error) {
      return value
    }
  })
}
