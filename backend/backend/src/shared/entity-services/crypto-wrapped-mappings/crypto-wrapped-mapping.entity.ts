import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'

@Entity()
export class CryptoWrappedMapping extends BaseEntity {
  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'wrapped_cryptocurrency_id' })
  wrappedCryptocurrency: Cryptocurrency

  static create(params: {
    cryptocurrency: Cryptocurrency
    wrappedCryptocurrency: Cryptocurrency
  }): CryptoWrappedMapping {
    const contractConfiguration = new CryptoWrappedMapping()
    contractConfiguration.cryptocurrency = params.cryptocurrency
    contractConfiguration.wrappedCryptocurrency = params.wrappedCryptocurrency
    return contractConfiguration
  }
}
