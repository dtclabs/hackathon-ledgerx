export interface ITag {
  id: string
  name: string
}

export interface IAnnotation {
  id: string
  type?: string
  name: string
}

export interface CreateTagPayload {
  organizationId: string
  payload: {
    name: string
  }
}

export interface UpdateTagPayload {
  organizationId: string
  id: string
  payload: {
    name: string
  }
}
