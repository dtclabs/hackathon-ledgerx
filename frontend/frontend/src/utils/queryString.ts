import { IGetAllOptions } from '@/api/interface'
// Todo: Delete this file once old api files are converted to new rtk query api
export function queryString<T>(query: Partial<T>) {
  let queryParam = ''
  if (query) {
    for (const key in query) {
      if (query[key] !== undefined && query[key] !== '') {
        if (queryParam === '') queryParam += `?${key}=${query[key]}`
        else queryParam += `&${key}=${query[key]}`
      }
    }
  }
  return queryParam
}
