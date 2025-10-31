import { EContactType } from '@/slice/contacts/contacts.types'
import { IGNORED_VALIDATE_FIELDS } from '@/views/Recipients/Create/components/AddBankAccountModal/constant'
import { isAddress } from 'ethers/lib/utils'
import _ from 'lodash'
import * as yup from 'yup'
import { AccountType, RoutingType } from './type'
import { validateEmail } from '@/views/Organization/components/CreateOrgCard'
import { isIbanValid } from '@/utils-v2/iban-validator'

export const addRecipientSchema = yup.object().shape({
  contactName: yup.string().required('Contact name is required'),
  organizationName: yup.string().when('type', (type, schema) => {
    if (type === EContactType.organization) return schema.required('Organisation Name name is required')
    return schema
  }),
  organizationAddress: yup.string().when('type', (type, schema) => {
    if (type === EContactType.organization) return schema.required('Organisation Mailing Address is required')
    return schema
  }),
  providers: yup.array().of(
    yup.object().shape({
      providerId: yup.string(),
      content: yup.string().when('providerId', (providerId, schema) => {
        if (providerId === '1')
          return schema.test('validEmail', 'This email is invalid', (value) => {
            if (value.trim() && !validateEmail(value.trim())) {
              return false
            }
            return true
          })
        return schema
      })
    })
  ),
  wallets: yup
    .array()
    .of(
      yup.object().shape({
        walletAddress: yup
          .string()
          .required('Wallet address is required')
          .test('isAddress', 'This address is invalid.', (value) => isAddress(value)),
        blockchainId: yup.string().required('Blockchain ID is required'),
        cryptocurrencySymbol: yup.string().required('Cryptocurrency symbol is required')
      })
    )
    .test('unique-walletAddress', 'Wallet addresses should be unique for each network', (wallets = []) => {
      if (wallets?.filter((_wallet) => _wallet.walletAddress).length === 0) return true
      const uniqueWallet = _.uniqBy(wallets, (obj) => `${obj.walletAddress}-${obj.blockchainId}`)
      return uniqueWallet.length === wallets.length
    })
  // .test('required-walletAddress', 'Please provide at least one wallet address', (wallets = []) => wallets.length > 0)
})

const ROUTING_CODE_REGEX = {
  [RoutingType.SWIFT_BIC]: /^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/,
  [RoutingType.ROUTING_NUMBER]: /^[0-9]{9}$/,
  [RoutingType.SORT_CODE]: /^\d{6}$/,
  [RoutingType.IFSC]: /^[A-Z]{4}[0][A-Z0-9]{6}$/,
  [RoutingType.ABA]: /^\d{9}$/,
  [RoutingType.BSB]: /^\d{3}-\d{3}$/,
  [RoutingType.BIK]: /^\d{9}$/
}

const ACCOUNT_NUMBER_REGEX = {
  [AccountType.ACCOUNT_NUMBER]: /^\d{8,20}$/,
  [AccountType.CLABE]: /^\d{18}$/,
  [AccountType.CBU]: /^d{22}$/,
  [AccountType.CBU_ALIAS]: /^[A-Z]{3}\d{22}$/
}

const mapBankAccountSchema = (_object: any, bankCurrencyMap: any = {}) => {
  const fields = _object || {}

  const schema: any = Object.keys(fields).reduce(
    (acc, key) => {
      if (key !== 'routingCode' && key !== 'accountNumber' && key !== 'currency') {
        let fieldSchema = yup.string().trim()
        if (fields[key].required && !IGNORED_VALIDATE_FIELDS.includes(key)) {
          fieldSchema = fieldSchema.required(`${_.startCase(key)} is required`)
          if (key === 'accountName')
            fieldSchema = fieldSchema.matches(
              /^[a-zA-Z]+(\s[a-zA-Z]+)+$/,
              'Full name must include both first and last name'
            )
        } else {
          fieldSchema = fieldSchema.nullable()
        }
        return {
          ...acc,
          [key]: fieldSchema
        }
      }
      return {
        ...acc
      }
    },
    {
      countryCode: yup.string().trim().required('Country is required'),
      bankName: yup.string().trim().required('Bank Name is required'),
      currency: yup.string().trim().required('Currency is required'),
      accountNumber: yup.string().trim().required('Account Number is required'),
      accountName: yup.string().trim().required('Account Name is required')
    }
  )

  // Routing code
  if (schema.routingType) {
    let fieldSchema = yup.string().trim()
    if (fields.routingCode && fields.routingCode.required && !IGNORED_VALIDATE_FIELDS.includes('routingCode')) {
      fieldSchema = fieldSchema.required('Routing Code is required').when('routingType', (routingType, _schema) => {
        if (routingType && ROUTING_CODE_REGEX[routingType]) {
          return _schema.matches(ROUTING_CODE_REGEX[routingType], 'Invalid Routing Code')
        }
        return _schema
      })
    } else {
      fieldSchema = fieldSchema.nullable()
    }
    schema.routingCode = fieldSchema
  }
  // Account Number
  if (schema.accountType) {
    let fieldSchema = yup.string().trim()
    if (fields.accountNumber && fields.accountNumber.required && !IGNORED_VALIDATE_FIELDS.includes('accountNumber')) {
      fieldSchema = fieldSchema.required('Account Number is required').when('accountType', (accountType, _schema) => {
        if (accountType === AccountType.IBAN) {
          return _schema.test('invalid_iban', 'Invalid Account Number', (accountNumber) => isIbanValid(accountNumber))
        }

        if (accountType && ACCOUNT_NUMBER_REGEX[accountType]) {
          return _schema.matches(ACCOUNT_NUMBER_REGEX[accountType], 'Invalid Account Number')
        }
        return _schema.matches(/^\d+$/, 'Invalid Account Number')
      })
    } else {
      fieldSchema = fieldSchema.nullable()
    }
    schema.accountNumber = fieldSchema
  }
  if (schema.bankId) {
    let fieldSchema = yup.string().trim()
    if (fields.currency && fields.currency.required && !IGNORED_VALIDATE_FIELDS.includes('currency')) {
      fieldSchema = fieldSchema.required('Currency is required').when('bankId', (bankId, _schema) => {
        if (bankId && bankCurrencyMap[bankId]) {
          return _schema.test(
            'matching-currency',
            'This currency is not supported by selected bank',
            (currency) => currency === bankCurrencyMap[bankId]
          )
        }
        return _schema
      })
    } else {
      fieldSchema = fieldSchema.nullable()
    }
    schema.currency = fieldSchema
  }

  return schema
}

const mapSchema = (_object: any) => {
  const fields = _object || {}

  const schema: any = Object.keys(fields).reduce(
    (acc, key) => {
      let fieldSchema = yup.string().trim()
      if (fields[key].required && !IGNORED_VALIDATE_FIELDS.includes(key)) {
        fieldSchema = fieldSchema.required(`${_.startCase(key)} is required`)
        if (key === 'accountName')
          fieldSchema = fieldSchema.matches(
            /^[a-zA-Z]+(\s[a-zA-Z]+)+$/,
            'Full name must include both first and last name'
          )
      } else {
        fieldSchema = fieldSchema.nullable()
      }
      return {
        ...acc,
        [key]: fieldSchema
      }
    },
    {
      countryCode: yup.string().trim().required('Country is required')
    }
  )

  return schema
}
export const bankAccountSchema = (requiredFields, bankCurrencyMap, type) =>
  yup.object().shape({
    destinationAccount: yup.object().shape(mapBankAccountSchema(requiredFields?.destinationAccount, bankCurrencyMap)),
    company:
      type !== EContactType.organization
        ? yup.object().nullable()
        : yup.object().shape(mapSchema(requiredFields?.company)),
    individual:
      type !== EContactType.individual
        ? yup.object().nullable()
        : yup.object().shape(mapSchema(requiredFields?.individual))
  })
