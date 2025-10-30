export interface AlchemyResponse<T> {
  jsonrpc: string
  id: number
  result: T
}
