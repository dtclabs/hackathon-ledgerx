import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { CryptoWrappedMapping } from './crypto-wrapped-mapping.entity'

@Injectable()
export class CryptoWrappedMappingsEntityService extends BaseEntityService<CryptoWrappedMapping> {
  constructor(
    @InjectRepository(CryptoWrappedMapping)
    private cryptoWrappedMappingRepository: Repository<CryptoWrappedMapping>
  ) {
    super(cryptoWrappedMappingRepository)
  }

  async getByPairAddresses(contractAddress1: string, contractAddress2: string) {
    return this.findOne({
      where: {
        cryptocurrency: {
          id: In([contractAddress1, contractAddress2])
        },
        wrappedCryptocurrency: {
          id: In([contractAddress1, contractAddress2])
        }
      }
    })
  }

  getAll(): Promise<CryptoWrappedMapping[]> {
    return this.find({
      relations: {
        cryptocurrency: true,
        wrappedCryptocurrency: true
      }
    })
  }
}
