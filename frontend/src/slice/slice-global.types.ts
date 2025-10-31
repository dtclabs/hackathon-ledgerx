export interface IPaginated {
  currentPage: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface IPagaintedParams {
  params?: {
    size?: number
    page?: number
  }
}
