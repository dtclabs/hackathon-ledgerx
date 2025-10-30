import { IAccount } from '../account/account-interface'
import { ITime } from '../../api/interface'
import { EOrganizationType } from '../organization/organization.types'

export enum CategoryType {
  EXPENSE = 'Expense',
  REVENUE = 'Revenue'
  // DIRECT_COSTS = 'Direct Costs',
  // EQUITY = 'Equity'
}

export interface ICategories extends ITime {
  id: string
  name: string
  organization?: {
    createdAt: string
    deletedAt: string | null
    id: string
    name: string
    publicId: string
    type: EOrganizationType
    updatedAt: string
  }
  type: CategoryType
  code: string
  description: string
  createdBy: IAccount
}

export interface ICategoryFilters {
  [key: string]: string[]
}

export interface IPayload {
  totalItems?: number
  totalPages?: number
  page?: number
  order?: string
  direction?: string
  limit?: number
  size?: number
  search?: string
  type?: string
}

export interface IPayloadPostCategory {
  id?: string
  name: string
  type: CategoryType
  code: string
  description?: string
}
