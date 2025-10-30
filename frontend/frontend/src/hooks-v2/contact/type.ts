import { EContactType } from '@/slice/contacts/contacts.types'

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}
export enum IdentificationType {
  RESIDENT_CARD = 'RESIDENT_CARD',
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  TAX_ID = 'TAX_ID',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  OTHER = 'OTHER'
}
export enum Occupation {
  FREELANCER = 'FREELANCER',
  NURSE = 'NURSE',
  OTHER = 'OTHER',
  LAWYER = 'LAWYER',
  DOCTOR = 'DOCTOR',
  PUBLIC_EMPLOYEE = 'PUBLIC_EMPLOYEE',
  OFFICE_WORKER = 'OFFICE_WORKER',
  UNEMPLOYED = 'UNEMPLOYED',
  GOVERNMENT_OFFICER = 'GOVERNMENT_OFFICER',
  RETIREMENT = 'RETIREMENT',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  HOUSEWIFE = 'HOUSEWIFE',
  OFFICER = 'OFFICER',
  AGRICULTURE = 'AGRICULTURE',
  SELF_EMPLOYED = 'SELF_EMPLOYED'
}
export enum BusinessNature {
  AGRICULTURE_FOOD_CROPS = 'AGRICULTURE_FOOD_CROPS',
  AGRICULTURE_OTHER_CROPS = 'AGRICULTURE_OTHER_CROPS',
  AGIRCULTURE_FARMING = 'AGIRCULTURE_FARMING',
  ENERGY_EQUIPMENT_SERVICES = 'ENERGY_EQUIPMENT_SERVICES',
  ENERGY_NON_RENEWABLE_RESOURCES = 'ENERGY_NON_RENEWABLE_RESOURCES',
  ENERGY_RENEWABLES_RESOURCES = 'ENERGY_RENEWABLES_RESOURCES',
  FINANCIAL_SERVICES_BANK = 'FINANCIAL_SERVICES_BANK',
  FINANCIAL_SERVICES_INSURANCE = 'FINANCIAL_SERVICES_INSURANCE',
  FINANCIAL_SERVICES_INVESTMENT = 'FINANCIAL_SERVICES_INVESTMENT',
  FINANCIAL_SERVICES_LENDING = 'FINANCIAL_SERVICES_LENDING',
  FINANCIAL_SERVICES_REMITTANCE = 'FINANCIAL_SERVICES_REMITTANCE',
  HEALTH_CARE_SERVICES = 'HEALTH_CARE_SERVICES',
  HEALTH_CARE_EQUIPMENT = 'HEALTH_CARE_EQUIPMENT',
  HEALTH_CARE_PHARMA_AND_LIFE_SCIENCES = 'HEALTH_CARE_PHARMA_AND_LIFE_SCIENCES',
  INDUSTRIAL_AEROSPACE_DEFENSE = 'INDUSTRIAL_AEROSPACE_DEFENSE',
  INDUSTRIAL_CONSTRUCTION_ENGINEERING = 'INDUSTRIAL_CONSTRUCTION_ENGINEERING',
  INDUSTRIAL_ELECTRICAL_EQUIPMENT_MACHINERY = 'INDUSTRIAL_ELECTRICAL_EQUIPMENT_MACHINERY',
  INFORMATION_TECHNOLOGY_SOFTWARE_SERVICES = 'INFORMATION_TECHNOLOGY_SOFTWARE_SERVICES',
  INFORMATION_TECHNOLOGY_HARDWARE_EQUIPMENT_COMPONENTS = 'INFORMATION_TECHNOLOGY_HARDWARE_EQUIPMENT_COMPONENTS',
  INFORMATION_TECHNOLOGY_ECOMMERCE = 'INFORMATION_TECHNOLOGY_ECOMMERCE',
  MANUFACTURING_AUTOMOBILES_AND_COMPONENTS = 'MANUFACTURING_AUTOMOBILES_AND_COMPONENTS',
  MANUFACTURING_CONSUMER_GOODS = 'MANUFACTURING_CONSUMER_GOODS',
  MANUFACTURING_FOOD_PRODUCTS = 'MANUFACTURING_FOOD_PRODUCTS',
  MATERIALS_METAL_AND_BASIC_MATERIALS = 'MATERIALS_METAL_AND_BASIC_MATERIALS',
  MATERIALS_CHEMICALS = 'MATERIALS_CHEMICALS',
  MATERIALS_CONSTRUCTION = 'MATERIALS_CONSTRUCTION',
  MATERIALS_MANUFACTURING = 'MATERIALS_MANUFACTURING',
  MEDIA_AND_COMMUNICATION_TELECOMMUNICATION = 'MEDIA_AND_COMMUNICATION_TELECOMMUNICATION',
  MEDIA_AND_COMMUNICATION_MEDIA_ENTERTAINMENT_SPORTS = 'MEDIA_AND_COMMUNICATION_MEDIA_ENTERTAINMENT_SPORTS',
  PROFESSIONAL_SERVICES_LEGAL_HR_CONSULTING = 'PROFESSIONAL_SERVICES_LEGAL_HR_CONSULTING',
  PROFESSIONAL_SERVICES_OTHERS = 'PROFESSIONAL_SERVICES_OTHERS',
  PUBLIC_SECTOR_GOVERNMENT_ADMINISTRATION = 'PUBLIC_SECTOR_GOVERNMENT_ADMINISTRATION',
  PUBLIC_SECTOR_NGOS = 'PUBLIC_SECTOR_NGOS',
  PUBLIC_SECTOR_OTHERS = 'PUBLIC_SECTOR_OTHERS',
  RETAIL_TRADING_AND_DISTRIBUTION = 'RETAIL_TRADING_AND_DISTRIBUTION',
  RETAIL_RETAILER = 'RETAIL_RETAILER',
  RETAIL_FOOD_BEVERAGES = 'RETAIL_FOOD_BEVERAGES',
  RETAIL_HOTELS_LEISURE_ENTERTAINMENT = 'RETAIL_HOTELS_LEISURE_ENTERTAINMENT',
  TRANSPORTATION_ROAD_AND_RAIL = 'TRANSPORTATION_ROAD_AND_RAIL',
  TRANSPORTATION_AIR = 'TRANSPORTATION_AIR',
  TRANSPORTATION_MARINE = 'TRANSPORTATION_MARINE',
  TRANSPORTATION_LOGISTICS = 'TRANSPORTATION_LOGISTICS',
  UTILITIES_ENERGY = 'UTILITIES_ENERGY',
  UTILITIES_WATER = 'UTILITIES_WATER',
  REAL_ESTATE = 'REAL_ESTATE'
}
export enum RoutingType {
  SWIFT_BIC = 'SWIFT-BIC',
  BIK = 'BIK',
  IFSC = 'IFSC',
  SORT_CODE = 'Sort code',
  ABA = 'ABA',
  BSB = 'BSB',
  ROUTING_NUMBER = 'Routing Number'
}
export enum BankAccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING'
}
export enum AccountType {
  IBAN = 'IBAN',
  CLABE = 'CLABE',
  CBU = 'CBU',
  CBU_ALIAS = 'CBU ALIAS',
  ACCOUNT_NUMBER = 'ACCOUNT NUMBER'
}
export enum TripleARecipientType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}

export type IDestinationAccount = {
  bankId: string
  bankName: string
  currency: string
  countryCode: string
  alias?: string
  cashpoint?: string
  mobileNumber?: string
  accountName: string
  accountNumber: string
  accountType?: AccountType | ''
  bankAccountType?: BankAccountType | ''
  routingType?: RoutingType | ''
  routingCode?: string
  branchCode?: string
  recipientName?: string
  recipientIdentificationType?: IdentificationType | ''
  recipientIdentificationNumber?: string
  recipientNationality?: string
  recipientAddress?: string
  recipientProvinceState?: string
  recipientCity?: string
  recipientEmail?: string
  recipientDateOfBirth?: string
  recipientIdentificationIssuer?: string
  recipientIdentificationIssueDate?: string
  recipientIdentificationExpiryDate?: string
  recipientGender?: Gender | ''
  recipientZipCode?: string
}

export interface IIndividualInfo {
  lastName: string
  firstName: string
  gender?: Gender
  email: string
  provinceState: string
  city: string
  address: string
  countryCode: string
  zipCode: string
  dateOfBirth: string
  mobileNumber: string
  identificationType?: IdentificationType | ''
  identificationNumber: string
  identificationIssuer: string
  identificationIssueDate: string
  identificationExpiryDate: string
  nationality: string
  occupation?: Occupation | ''
  remarks: string
}

export interface ICompanyInfo {
  registeredName: string
  tradingName: string
  registrationType: string
  registrationNumber: string
  registrationDate: string
  registrationExpiryDate: string
  registrationCountry: string
  email: string
  phoneNumber: string
  address: string
  countryCode: string
  zipCode: string
  city: string
  provinceState: string
  mobileNumber: string
  remarks: string
  businessNature?: BusinessNature | ''
}
export interface IBankAccountField {
  id?: string
  destinationAccount?: IDestinationAccount
  company?: Partial<ICompanyInfo>
  individual?: Partial<IIndividualInfo>
  publicId?: string
}

export type IWalletField = {
  id?: string
  blockchainId?: string
  cryptocurrencySymbol?: string
  walletAddress?: string
}
export type IProviderField = { id?: string; providerId?: string; content?: string }

export interface IAddContact {
  id?: string
  contactName: string
  type: EContactType
  organizationName?: string
  organizationAddress?: string
  wallets?: IWalletField[]
  providers?: IProviderField[]
  bankAccounts?: IBankAccountField[]
}

export interface IUseCreateContact {
  control: any
  errors: any
  apiError: string
  isLoading: boolean
  isBankAccountsLoading: boolean
  walletFields: IWalletField[]
  providerFields: IProviderField[]
  bankAccountFields?: IBankAccountField[]
  onRemoveWallet: (index: number) => void
  onAppendWallet: () => void
  onUpdateWallet: (index: number, value) => void
  onRemoveProvider: (index: number) => void
  onAppendProvider: () => void
  onUpdateProvider: (index: number, value) => void
  onRemoveBankAccount: (index: number) => void
  onAppendBankAccount: (value?: IBankAccountField) => void
  onUpdateBankAccount: (index: number, value) => void
  onCreateContact: (data: any) => Promise<any>
  onEditContact: (data: any) => Promise<any>
  onDeleteContact: () => void
  currencyOptions: { value: string; label: string }[]
  countryOptions: { value: string; label: string }[]
  bankOptions: { value: string; label: string; country: string; fiatCurrency: string }[]
  defaultBankAccount: IBankAccountField
}
