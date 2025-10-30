export interface TripleAOAuthResponse {
  access_token: string // '2de232b4a13f2795418acc6447f3da3ab164185e'
  token_type: string // 'Bearer'
  expires_in: number // 3599
}

export interface TripleABankResponse {
  id: string // '497f6eca-6276-4993-bfeb-53cbbbba6f08'
  type: string // 'bank'
  name: string // 'Citibank'
  country_code: string // 'USA'
  currency: string // 'USD'
}

export interface TripleARequiredFieldsResponse {
  [country_code: string]: {
    bank_account: {
      individual_recipient: { field: string; accepted_values?: string[] }[]
      company_recipient: { field: string; accepted_values?: string[] }[]
      destination_account: { field: string; accepted_values?: string[] }[]
    }
  }
}

export interface TripleACreateIndividualRequest {
  externalId?: string // '9c0eb636-84ac-4f78-a83c-83ab108d8cee'
  gender?: TripleAGender // 'female'
  lastName: string // 'Zhang'
  firstName: string // 'James'
  email?: string // 'james.zhang@example.com'
  countryCode: string // 'USA'
  provinceState?: string // 'New York'
  city?: string // 'New York City'
  address?: string // '1 Falcon Ave, California'
  zipCode?: string // '12345'
  dateOfBirth?: string // '2019-08-24'
  mobileNumber?: string // '198766234'
  identificationType?: TripleAIdentificationType // 'RESIDENT_CARD'
  identificationNumber?: string // 'S98765433X'
  identificationIssuer?: string
  identificationIssueDate?: string // '2022-01-01'
  identificationExpiryDate?: string // '2022-09-01'
  nationality?: string // 'SGP'
  occupation?: TripleAOccupation // 'FREELANCER'
  remarks?: string
  role?: TripleARole // 'sender'
}

export interface TripleACreateCompanyRequest {
  externalId?: string // 'my_user_millerinc01'
  registeredName: string // 'Miller'
  tradingName?: string // 'Miller Inc'
  registrationType?: string // 'trade license'
  registrationNumber?: string // '001205682'
  registrationDate?: string // '2021-02-16'
  registrationExpiryDate?: string // '2021-02-16'
  registrationCountry?: string // 'USA'
  email?: string // 'finance@miller.com'
  phoneNumber?: string // '+13152455710'
  address?: string // '7950 Lewis Rd'
  countryCode?: string // 'USA'
  zipCode?: string // '13305'
  city?: string // 'New York City'
  provinceState?: string // 'New York'
  mobileNumber?: string // '+13152455710'
  remarks?: string
  role?: TripleARole // 'sender'
  businessNature?: TripleABusinessNature // 'AGRICULTURE_FOOD_CROPS'
}

export interface TripleACreateDestinationAccountRequest {
  type?: TripleADestinationAccountType // 'bank_account'
  ownerId?: string // '8826ee2e-7933-4665-aef2-2393f84a0d05'
  externalId?: string
  receivingInstitutionId: string // '0873b9a0-2306-48ef-8729-90970f30c5d7'
  currency: string // 'USD'
  countryCode: string // 'USA'
  alias?: string // 'Account 1'
  account: {
    cashpoint?: string
    recipientName?: string
    recipientIdentificationType?: string // 'NATIONAL_ID'
    recipientIdentificationNumber?: string // 'S98765433X'
    recipientNationality?: string // 'SGP'
    recipientAddress?: string // '1 Falcon Ave, California'
    recipientProvinceState?: string // 'New York'
    recipientCity?: string // 'New York City'
    recipientEmail?: string // 'james.zhang@example.com'
    recipientDateOfBirth?: string // '2019-08-24'
    recipientIdentificationIssuer?: string // 'City hall'
    recipientIdentificationIssueDate?: string // '2019-08-24'
    recipientIdentificationExpiryDate?: string // '2025-08-24'
    recipientGender?: string // 'female'
    recipientZipCode?: string // '12345'
    mobileNumber?: string
    accountName: string // 'John Zuckerberg'
    accountNumber: string // '9876543201'
    accountType?: TripleAAccountType // 'IBAN'
    bankAccountType?: TripleABankAccountType // 'SAVINGS'
    routingType?: TripleARoutingType // 'SWIFT-BIC'
    routingCode?: string
    branchCode?: string
    bankName?: string
  }
}

export interface TripleACreateQuoteRequest {
  mode?: TripleATransferMode // 'sending'
  feeMode?: TripleAFeeMode // 'excluded'
  sourceCountry?: string // 'USA'
  destinationAccountType?: TripleADestinationAccountType // 'bank_account'
  destinationCountry: string // 'USA'
  sendingAmount?: number // 0.001
  sendingCurrency: string // 'BTC'
  receivingAmount?: number // 57.15
  receivingCurrency: string // 'USD'
  meToMeTransfer?: boolean // false
}

export interface TripleACreateTransferRequest {
  externalId?: string
  senderId: string // '3194e023-c19f-4a42-9172-9e18d68e3a3a'
  recipientId?: string // 'b6731cb5-d462-49ea-afb8-7933b670b560'
  destinationAccountId: string // '8695e0db-8457-4784-9058-cf427152bff1'
  purposeOfRemittance: TripleAPurposeOfRemittance // 'OTHER_FEES'
  sourceOfFunds?: TripleASourceOfFunds // 'GIFT'
  relationship?: TripleARelationship // 'FAMILY'
  remarks?: string
}

export interface TripleAConfirmTransferRequest {
  paymentMethod?: TripleAPaymentMethod // 'crypto_page'
  successUrl?: string
  cancelUrl?: string
  amountToPay?: number // 100
  cryptocurrency?: string // 'BTC'
  cardId?: string // '66f6e46c-f6a1-4af8-a1bd-49666bc01304'
}

export interface TripleAIndividualResponse {
  id: string // '497f6eca-6276-4993-bfeb-53cbbbba6f08'
  external_id: string // '9c0eb636-84ac-4f78-a83c-83ab108d8cee'
  first_name: string // 'James'
  last_name: string // 'Zhang'
  country_code: string // 'USA'
  gender: TripleAGender // 'female'
  email: string // 'james.zhang@example.com'
  province_state: string // 'New York'
  city: string // 'New York City'
  address: string // '1 Falcon Ave, California'
  zip_code: string // '12345'
  date_of_birth: string // '2019-08-24'
  mobile_number: string // '+198766234'
  identification_type: TripleAIdentificationType // 'RESIDENT_CARD'
  identification_number: string // 'S98765433X'
  nationality: string // SGP'
  remarks: string // ''
}

export interface TripleACompanyResponse {
  id: string // '497f6eca-6276-4993-bfeb-53cbbbba6f08'
  external_id: string // 'my_user_millerinc01'
  registered_name: string // 'Miller'
  trading_name: string // 'Miller Inc'
  country_code: string // 'USA'
  registration_type: string // 'trade license'
  registration_number: string // '001205682'
  registration_date: string // '2021-02-16'
  registration_expiry_date: string // '2021-02-16'
  registration_country: string // 'USA'
  email: string // 'finance@miller.com'
  phone_number: string // '+13152455710'
  address: string // '7950 Lewis Rd'
  zip_code: string // '13305'
  city: string // 'New York City'
  province_state: string // 'New York'
  mobile_number: string // '+13152455710'
  remarks: string
  business_nature: TripleABusinessNature // 'AGRICULTURE_FOOD_CROPS'
}

export interface TripleADestinationAccountResponse {
  id: string // '497f6eca-6276-4993-bfeb-53cbbbba6f08'
  external_id: string
  owner_id: string // '8826ee2e-7933-4665-aef2-2393f84a0d05'
  receiving_institution_id: string // '0873b9a0-2306-48ef-8729-90970f30c5d7'
  currency: string // 'USD'
  country_code: string // 'USA'
  alias: string // 'Account 1'
  account: {
    branch_code: string
    account_name: string // 'John Zuckerberg'
    account_type: TripleAAccountType // 'IBAN'
    routing_code: string
    routing_type: TripleARoutingType // 'SWIFT-BIC'
    mobile_number: string
    account_number: string // '9876543201'
    bank_account_type: TripleABankAccountType // 'SAVINGS'
    cashpoint: string
    recipient_name: string
    recipient_identification_type: TripleAIdentificationType // 'NATIONAL_ID'
    recipient_identification_number: string // 'S98765433X'
    recipient_nationality: string // 'SGP'
    recipient_address: string // '1 Falcon Ave, California'
    recipient_province_state: string // 'New York'
    recipient_city: string // 'New York City'
    recipient_email: string // 'james.zhang@example.com'
    recipient_date_of_birth: string // '2019-08-24'
    recipient_identification_issuer: string // 'City hall'
    recipient_identification_issue_date: string // '2019-08-24'
    recipient_identification_expiry_date: string // '2025-08-24'
    recipient_gender: TripleAGender // 'female'
    recipient_zip_code: string // '12345'
    bank_name: string
  }
}

export interface TripleAQuoteResponse {
  id: string // '497f6eca-6276-4993-bfeb-53cbbbba6f08'
  mode: TripleATransferMode // 'sending'
  destination_country: string // 'CHN'
  destination_account_type: TripleADestinationAccountType // 'bank_account'
  sending_amount: number // 0.01
  sending_currency: string // 'BTC'
  receiving_amount: number // 57.15
  receiving_currency: string // 'USD'
  exchange_rate: number // 57151.5
  fee: number // 57.15
  fee_currency: string // 'USD'
  expires_at: string // '023-07-13T15:31:02.886Z'
}

export interface TripleATransferResponse {
  id: string // '497f6eca-6276-4993-bfeb-53cbbbba6f08'
  status: TripleATransferStatus // 'created'
  sub_status: TripleATransferSubStatus // 'created'
  expires_at: string // '2019-08-24T14:15:22Z'
  mode: TripleATransferMode //"sending",
  sending_amount: number // 0.001,
  sending_currency: string // "BTC",
  receiving_amount: number // 57.15,
  receiving_currency: string // 'USD'
  purpose_of_remittance: TripleAPurposeOfRemittance // 'OTHER_FEES'
  fee: number // 57.15
  fee_currency: string // 'USD'
}

export enum TripleARole {
  SENDER = 'sender',
  RECIPIENT = 'recipient'
}

export enum TripleAIdentificationType {
  RESIDENT_CARD = 'RESIDENT_CARD',
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  TAX_ID = 'TAX_ID',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  OTHER = 'OTHER'
}

export enum TripleAGender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum TripleAOccupation {
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

export enum TripleABusinessNature {
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

export enum TripleADestinationAccountType {
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CASH_PICKUP = 'cash_pickup',
  CARD = 'card'
}

export enum TripleAAccountType {
  IBAN = 'IBAN',
  CLABE = 'CLABE',
  CBU = 'CBU',
  CBU_ALIAS = 'CBU ALIAS',
  ACCOUNT_NUMBER = 'ACCOUNT NUMBER'
}

export enum TripleABankAccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING'
}

export enum TripleARoutingType {
  SWIFT_BIC = 'SWIFT-BIC',
  BIK = 'BIK',
  IFSC = 'IFSC',
  SORT_CODE = 'Sort code',
  ABA = 'ABA',
  BSB = 'BSB',
  ROUTING_NUMBER = 'Routing Number'
}

export enum TripleATransferMode {
  SENDING = 'sending',
  RECEIVING = 'receiving'
}

export enum TripleAFeeMode {
  INCLUDED = 'included',
  EXCLUDED = 'excluded'
}

export enum TripleAPurposeOfRemittance {
  OTHER_FEES = 'OTHER_FEES',
  INSURANCE_CLAIMS = 'INSURANCE_CLAIMS',
  MAINTENANCE_EXPENSES = 'MAINTENANCE_EXPENSES',
  SMALL_VALUE_REMITTANCE = 'SMALL_VALUE_REMITTANCE',
  TRANSPORTATION_FEES = 'TRANSPORTATION_FEES',
  GIFT_AND_DONATION = 'GIFT_AND_DONATION',
  OFFICE_EXPENSES = 'OFFICE_EXPENSES',
  EXPORTED_GOODS = 'EXPORTED_GOODS',
  PERSONAL_TRANSFER = 'PERSONAL_TRANSFER',
  OTHER = 'OTHER',
  LIBERALIZED_REMITTANCE = 'LIBERALIZED_REMITTANCE',
  TAX_PAYMENT = 'TAX_PAYMENT',
  MEDICAL_TREATMENT = 'MEDICAL_TREATMENT',
  SHARES_INVESTMENT = 'SHARES_INVESTMENT',
  ROYALTY_FEES = 'ROYALTY_FEES',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  BUSINESS_INSURANCE = 'BUSINESS_INSURANCE',
  ADVERTISING_EXPENSES = 'ADVERTISING_EXPENSES',
  TRAVEL = 'TRAVEL',
  DELIVERY_FEES = 'DELIVERY_FEES',
  PROPERTY_PURCHASE = 'PROPERTY_PURCHASE',
  FAMILY_SUPPORT = 'FAMILY_SUPPORT',
  UTILITY_BILLS = 'UTILITY_BILLS',
  CONSTRUCTION_EXPENSES = 'CONSTRUCTION_EXPENSES',
  PROPERTY_RENTAL = 'PROPERTY_RENTAL',
  SERVICE_CHARGES = 'SERVICE_CHARGES',
  HOTEL_ACCOMMODATION = 'HOTEL_ACCOMMODATION',
  SALARY_PAYMENT = 'SALARY_PAYMENT',
  EDUCATION = 'EDUCATION',
  ADVISORY_FEES = 'ADVISORY_FEES',
  FUND_INVESTMENT = 'FUND_INVESTMENT',
  COMPANY_EXPENSES = 'COMPANY_EXPENSES',
  BILLS = 'BILLS',
  INSURANCE = 'INSURANCE',
  INVESTMENT = 'INVESTMENT',
  REMITTANCE = 'REMITTANCE',
  HEALTH = 'HEALTH',
  TAXES = 'TAXES'
}

export enum TripleASourceOfFunds {
  GIFT = 'GIFT',
  SALARY = 'SALARY',
  LOTTERY = 'LOTTERY',
  SAVINGS = 'SAVINGS',
  CASH = 'CASH',
  OTHER = 'OTHER',
  BUSINESS = 'BUSINESS'
}

export enum TripleARelationship {
  FAMILY = 'FAMILY',
  GRAND_FATHER = 'GRAND_FATHER',
  FATHER = 'FATHER',
  FATHER_IN_LAW = 'FATHER_IN_LAW',
  GRAND_MOTHER = 'GRAND_MOTHER',
  MOTHER = 'MOTHER',
  MOTHER_IN_LAW = 'MOTHER_IN_LAW',
  UNCLE = 'UNCLE',
  AUNT = 'AUNT',
  BROTHER = 'BROTHER',
  SISTER = 'SISTER',
  FRIEND = 'FRIEND',
  EX_SPOUSE = 'EX_SPOUSE',
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',
  NIECE = 'NIECE',
  NEPHEW = 'NEPHEW',
  SISTER_IN_LAW = 'SISTER_IN_LAW',
  BROTHER_IN_LAW = 'BROTHER_IN_LAW',
  HUSBAND = 'HUSBAND',
  WIFE = 'WIFE',
  SELF = 'SELF',
  SPOUSE = 'SPOUSE',
  COUSIN = 'COUSIN',
  OTHER = 'OTHER'
}

export enum TripleATransferStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  SUBMITTED = 'submitted',
  DECLINED = 'declined',
  COMPLETED = 'completed',
  REVERSED = 'reversed'
}

export enum TripleATransferSubStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  SUBMITTED = 'submitted',
  DECLINED = 'declined',
  COMPLETED = 'completed',
  REVERSED = 'reversed'
}

export enum TripleAPaymentMethod {
  CRYPTO_PAGE = 'crypto_page',
  PREFUNDING = 'prefunding',
  CRYPTO_ADDRESS = 'crypto_address',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card'
}

export enum TripleARecipientType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company'
}
