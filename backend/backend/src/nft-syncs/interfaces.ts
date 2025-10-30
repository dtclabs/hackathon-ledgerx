import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { NftSyncStatus } from '../shared/entity-services/nft-syncs/interfaces'
import { NftOrganizationSync } from '../shared/entity-services/nft-syncs/nft-organization-sync.entity'

export class NftSyncDto {
  @ApiProperty({ example: NftSyncStatus.COMPLETED, enum: NftSyncStatus })
  @IsNotEmpty()
  status: string

  @ApiProperty({ example: '2023-02-28T07:58:47.000Z', type: Date })
  @IsNotEmpty()
  createdAt: Date

  @ApiProperty({ example: '2023-02-28T07:58:47.000Z', type: Date })
  @IsNotEmpty()
  updatedAt: Date

  static map(nftOrganizationSync: NftOrganizationSync): NftSyncDto {
    const dto = new NftSyncDto()
    dto.status = nftOrganizationSync.status
    dto.createdAt = nftOrganizationSync.createdAt
    dto.updatedAt = nftOrganizationSync.updatedAt

    return dto
  }
}
