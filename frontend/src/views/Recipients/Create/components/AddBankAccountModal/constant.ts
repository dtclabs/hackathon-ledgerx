import {
  AccountType,
  BankAccountType,
  BusinessNature,
  Gender,
  IdentificationType,
  Occupation,
  RoutingType
} from '@/hooks-v2/contact/type'
import _ from 'lodash'

export enum InputType {
  SELECT = 'select',
  TEXT = 'text',
  DATE = 'date'
}

export const DESTINATION_ACCOUNT_INPUT = {
  bankName: InputType.TEXT,
  currency: InputType.SELECT,
  countryCode: InputType.SELECT,
  accountName: InputType.TEXT,
  accountNumber: InputType.TEXT,
  alias: InputType.TEXT,
  cashpoint: InputType.TEXT,
  mobileNumber: InputType.TEXT,
  routingCode: InputType.TEXT,
  branchCode: InputType.TEXT,
  accountType: InputType.SELECT,
  bankAccountType: InputType.SELECT,
  routingType: InputType.SELECT,
  recipientName: InputType.TEXT,
  recipientIdentificationType: InputType.SELECT,
  recipientIdentificationNumber: InputType.TEXT,
  recipientNationality: InputType.TEXT,
  recipientAddress: InputType.TEXT,
  recipientProvinceState: InputType.TEXT,
  recipientCity: InputType.TEXT,
  recipientEmail: InputType.TEXT,
  recipientDateOfBirth: InputType.TEXT,
  recipientIdentificationIssuer: InputType.TEXT,
  recipientIdentificationIssueDate: InputType.TEXT,
  recipientIdentificationExpiryDate: InputType.TEXT,
  recipientGender: InputType.SELECT,
  recipientZipCode: InputType.TEXT
}

export const INDIVIDUAL_INPUT = {
  lastName: InputType.TEXT,
  firstName: InputType.TEXT,
  gender: InputType.SELECT,
  email: InputType.TEXT,
  provinceState: InputType.TEXT,
  city: InputType.TEXT,
  address: InputType.TEXT,
  countryCode: InputType.SELECT,
  zipCode: InputType.TEXT,
  dateOfBirth: InputType.DATE,
  mobileNumber: InputType.TEXT,
  identificationType: InputType.SELECT,
  identificationNumber: InputType.TEXT,
  identificationIssuer: InputType.TEXT,
  identificationIssueDate: InputType.DATE,
  identificationExpiryDate: InputType.DATE,
  nationality: InputType.TEXT,
  occupation: InputType.SELECT,
  remarks: InputType.TEXT
}

export const COMPANY_INPUT = {
  registeredName: InputType.TEXT,
  tradingName: InputType.TEXT,
  registrationType: InputType.TEXT,
  registrationNumber: InputType.TEXT,
  registrationDate: InputType.DATE,
  registrationExpiryDate: InputType.DATE,
  registrationCountry: InputType.TEXT,
  email: InputType.TEXT,
  phoneNumber: InputType.TEXT,
  address: InputType.TEXT,
  countryCode: InputType.SELECT,
  zipCode: InputType.TEXT,
  city: InputType.TEXT,
  provinceState: InputType.TEXT,
  mobileNumber: InputType.TEXT,
  remarks: InputType.TEXT,
  businessNature: InputType.SELECT
}

export const OPTIONS_MAP = (countries, currencies) => ({
  countryCode: countries,
  currency: currencies,
  accountType: Object.keys(AccountType).map((_item) => ({
    value: AccountType[_item],
    label: AccountType[_item]
  })),
  bankAccountType: Object.keys(BankAccountType).map((_item) => ({
    value: BankAccountType[_item],
    label: _.startCase(_.toLower(BankAccountType[_item]))
  })),
  routingType: Object.keys(RoutingType).map((_item) => ({
    value: RoutingType[_item],
    label: RoutingType[_item]
  })),
  gender: Object.keys(Gender).map((_item) => ({
    value: Gender[_item],
    label: _.startCase(_.toLower(Gender[_item]))
  })),
  identificationType: Object.keys(IdentificationType).map((_item) => ({
    value: IdentificationType[_item],
    label: _.startCase(_.toLower(IdentificationType[_item]))
  })),
  occupation: Object.keys(Occupation).map((_item) => ({
    value: Occupation[_item],
    label: _.startCase(_.toLower(Occupation[_item]))
  })),
  businessNature: Object.keys(BusinessNature).map((_item) => ({
    value: BusinessNature[_item],
    label: _.startCase(_.toLower(BusinessNature[_item]))
  }))
})

export const IGNORED_FIELDS = [
  'lastName',
  'firstName',
  'registeredName',
  'countryCode',
  'bankId',
  'bankName',
  'currency',
  'countryCode',
  'accountName',
  'accountNumber',
  'routingCode'
]
export const IGNORED_VALIDATE_FIELDS = ['lastName', 'firstName', 'registeredName', 'bankId']
