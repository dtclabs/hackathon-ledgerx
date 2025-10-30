import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { CryptocurrencyMetadataDto } from './interfaces'

export type OwnedCryptocurrenciesMetadata = {
  [key in SupportedBlockchains]?: CryptocurrencyMetadataDto[]
}
