import { IMember } from '@/slice/members/members.types'

export enum EOrganizationType {
  DAO = 'DAO',
  COMPANY = 'COMPANY'
}

export interface IConnectOrganization {
  accessToken: string
  organization: IOrganization
}

export interface IConnectOrgParams {
  organisationId: string
}

export interface ICreateOrganizationParams {
  name: string
  type: EOrganizationType
  jobTitle?: string
  contacts?: any
}

export type ICreateOrganizationResponse = {
  data: IOrganization
}

export interface IUpdateOrgParams {
  orgId: string
  data: {
    id: string
    name: string
    type: string
  }
}

export interface IOrganization {
  createdAt: string
  deletedAt: string | null
  id: string
  name: string
  members: IMember[]
  publicId: string
  type: EOrganizationType
  updatedAt: string
}
