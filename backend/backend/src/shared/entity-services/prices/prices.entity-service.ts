import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { Price } from './prices.entity'

@Injectable()
export class PricesEntityService extends BaseEntityService<Price> {
  constructor(
    @InjectRepository(Price)
    private pricesRepository: Repository<Price>
  ) {
    super(pricesRepository)
  }

  upsertByCryptoAndFiatAndDate(params: {
    cryptocurrency: Cryptocurrency
    fiatCurrency: string
    price: number
    dateComponent: string
  }) {
    return this.pricesRepository.manager.transaction(async (entityManager) => {
      const priceEntity = await entityManager.findOne(Price, {
        where: {
          date: params.dateComponent,
          cryptocurrency: {
            id: params.cryptocurrency.id
          },
          fiatCurrency: params.fiatCurrency.toUpperCase()
        }
      })

      if (!priceEntity) {
        const priceEntity: DeepPartial<Price> = {
          cryptocurrency: {
            id: params.cryptocurrency.id
          },
          tokenId: params.cryptocurrency.coingeckoId,
          fiatCurrency: params.fiatCurrency.toUpperCase(),
          date: params.dateComponent,
          price: params.price
        }
        return await entityManager.save(Price, priceEntity)
      } else {
        return await entityManager.save(Price, { id: priceEntity.id, price: params.price })
      }
    })
  }

  getByCryptoAndFiatAndDate(params: { dateComponent: string; cryptocurrencyId: string; fiatCurrency: string }) {
    return this.findOne({
      where: {
        date: params.dateComponent,
        cryptocurrency: {
          id: params.cryptocurrencyId
        },
        fiatCurrency: params.fiatCurrency.toUpperCase()
      }
    })
  }
}
