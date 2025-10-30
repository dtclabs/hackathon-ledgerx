export interface HqDataApiResponse<T> {
  data: T
  description: string
  error: number
}

export enum HqDataJobStatus {
  RUNNING = 0,
  COMPLETED = 1,
  FAILED = 2
}

export interface HqDataJob {
  id: string
  indexed_address: string
  status: HqDataJobStatus // 0 - running, 1 - completed, 2 - failed
  created_at: string
  updated_at: string
}

export interface HqDataNft {
  collection_id: string
  id: string
  token_id: string
  indexed_address: string
  quantity: string
  first_acquired_at: Date
  last_acquired_at: Date
  status: HqDataNftStatus
  status_updated_at: string
  created_at: string
  updated_at: string
  chain: string
  contract_address: string
  name: string
  description: string
  image_url: string
  image_properties: string // Note: This could be a more specific type based on the actual structure
  external_url: string
  acquisitions: HqDataNftAcquisitions[]
  deleted_acquisition_ids: string[]
  token_count: string
  owner_count: string
  owners: string // Note: This could be a more specific type based on the actual structure
  last_sale: HqDataNftLastSale
  rarity: HqDataNftRarity // Note: This could be a more specific type based on the actual structure
  traits: HqDataNftTrait[] // Note: This could be a more specific type based on the actual structure
  royalty_opensea: string[] // Note: This could be a more specific type based on the actual structure
}

export enum HqDataNftStatus {
  OWNED = 'owned',
  NOT_OWNED = 'not_owned'
}

export interface HqDataNftRarity {
  rank: number
  score: number
  unique_attributes: number
}

export interface HqDataNftCollection {
  id: string
  name: string
  description: string
  image_url: string
  banner_image_url: string
  category: string
  external_url: string
  twitter_username: string
  discord_url: string
  marketplace_pages: string // Note: This property is a string representation of an array, consider changing it to an actual array if needed
  distinct_owner_count: number
  distinct_nft_count: number
  total_quantity: number
  chains: string // Note: This property is a string representation of an array, consider changing it to an actual array if needed
  top_contracts: string // Note: This property is a string representation of an array, consider changing it to an actual array if needed
  created_at: string
  updated_at: string
  contract_standard: string
}

export interface HqDataNftAcquisitions {
  acquired_at: Date
  acquisition_id: string
  method: string
  quantity: number
  status: HqDataNftStatus
  sale_details: HqDataNftAcquisitionSaleDetails
}

export interface HqDataNftAcquisitionSaleDetails {
  payment_token_id: string
  payment_token_symbol: string
  payment_token_decimals: string
  unit_price: string
  is_bundle_sale: boolean
}

export interface HqDataNftLastSale {
  from_address: string
  to_address: string
  quantity: string
  timestamp: string
  transaction: string
  marketplace_id: string
  marketplace_name: string
  is_bundle_sale: boolean
  unit_price: string
  total_price: string
  unit_price_usd_cents: string
  nft_id: string
  payment_token_id: string
  payment_token_name: string
  payment_token_symbol: string
  payment_token_address: string | null
  payment_token_decimals: string
}

export interface HqDataPrice {
  id: string
  collection_id: string
  marketplace_id: string
  marketplace_name: string
  value: string
  value_usd_cents: string
  payment_token_id: string
  payment_token_name: string
  payment_token_symbol: string
  payment_token_decimals: string
  created_at: string
  updated_at: string
}

export interface HqDataNftTrait {
  display_type: null | string
  percentage: number
  trait_type: string
  value: string
}
