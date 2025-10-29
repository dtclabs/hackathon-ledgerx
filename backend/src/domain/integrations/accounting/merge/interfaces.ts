import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export interface MergeEnum {
  value: string
  rawValue: string
}

export class Account {
  @ApiProperty({ description: 'This is the mergeAccountId' })
  id: string
  remote_id: string
  name: string
  description: string
  classification: MergeEnum
  type: string
  status: MergeEnum
  current_balance: number
  currency: MergeEnum
  account_number: string
  parent_account: string
  company: string
  remote_was_deleted: boolean
  modified_at: Date
  field_mappings: object
  remote_data: object[]
}

export class ModifiedAccount extends Account {
  @ApiProperty({ description: 'These are the keys that are modified' })
  keysChangedAtSource: string[]
}

export enum MethodENUM {
  get = 'GET',
  opions = 'OPTIONS',
  head = 'HEAD',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE'
}

export enum RequestFormatENUM {
  json = 'JSON'
}

export enum XeroErrorDetails {
  UNAUTHENTICATED = 'AuthenticationUnsuccessful'
}

export enum XeroPaths {
  accounts = '2.0/Accounts',
  journals = '2.0/Journals'
}

export const QUICKBOOKS_MAX_PAGESIZE = 1000

export enum QuickbooksPaths {
  accounts = '/v3/company/{{LINKED_ACCOUNT_ATTR.realmId}}/query?query=select * from Account where Active in (true, false) STARTPOSITION 1 MAXRESULTS 1000'
}

export interface MergeJournalLine {
  account: string
  net_amount: number
  description: string
}

export interface MergeJournalEntryRequest {
  transaction_date: Date
  memo: string
  lines: MergeJournalLine[]
  integration_params: {
    [key: string]: any
  }
}
