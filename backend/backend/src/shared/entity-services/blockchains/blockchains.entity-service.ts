import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Direction } from '../../../core/interfaces'
import { BaseEntityService } from '../base.entity-service'
import { Blockchain } from './blockchain.entity'

@Injectable()
export class BlockchainsEntityService extends BaseEntityService<Blockchain> {
  constructor(
    @InjectRepository(Blockchain)
    private blockchainsRepository: Repository<Blockchain>
  ) {
    super(blockchainsRepository)
  }

  getByPublicId(publicId: string) {
    return this.blockchainsRepository.findOne({ where: { publicId: publicId, isEnabled: true }, cache: 60000 })
  }

  getEnabledBlockchains() {
    // Cache query for 1 minute
    return this.blockchainsRepository.find({ where: { isEnabled: true }, cache: 60000, order: { id: Direction.ASC } })
  }

  async getEnabledBlockchainPublicIds() {
    // Cache query for 1 minute
    const blockchains = await this.blockchainsRepository.find({ where: { isEnabled: true }, cache: 60000 })
    return blockchains?.map((bc) => bc.publicId)
  }

  async getEnabledIdsFrom(blockchainIds: string[]) {
    const allEnabledBlockchains = await this.getEnabledFrom(blockchainIds)
    return allEnabledBlockchains.map((bc) => bc.publicId)
  }

  async getEnabledFrom(blockchainIds: string[]) {
    const allEnabledBlockchains = await this.getEnabledBlockchains()
    if (!blockchainIds) {
      return []
    }

    // find the intersection of the two arrays
    return allEnabledBlockchains.filter((element) => blockchainIds.includes(element.publicId))
  }

  async getSolanaBlockchains() {
    const allBlockchains = await this.getEnabledBlockchains()
    return allBlockchains.filter(blockchain => blockchain.publicId.includes('solana'))
  }

  async getSolanaBlockchainPublicIds() {
    const solanaBlockchains = await this.getSolanaBlockchains()
    return solanaBlockchains.map(bc => bc.publicId)
  }

  async getEnabledIdsFromOrDefaultIfEmpty(blockchainIds: string[]) {
    const getEnabledIds = await this.getEnabledIdsFrom(blockchainIds)
    if (getEnabledIds.length) {
      return getEnabledIds
    }
    return await this.getEnabledBlockchainPublicIds()
  }

  async getEnabledFromOrDefaultIfEmpty(blockchainIds: string[]) {
    const getEnabled = await this.getEnabledFrom(blockchainIds)
    if (getEnabled.length) {
      return getEnabled
    }
    return await this.getEnabledBlockchains()
  }

  async isEnabled(blockchainId: string) {
    const allEnabledBlockchainIds = await this.getEnabledBlockchainPublicIds()
    return allEnabledBlockchainIds.includes(blockchainId)
  }
}
