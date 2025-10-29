import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator'
import { IsEthereumOrSolanaAddress } from '../shared/validators/address.validator'

export class CreateWalletDto {
  @ApiProperty({ 
    example: '0x0000000000000000000000000000000000000000',
    description: 'Ethereum or Solana wallet address'
  })
  @IsEthereumOrSolanaAddress()
  address: string

  @ApiPropertyOptional()
  name?: string

  @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  firstName: string

  @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  lastName: string

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  agreementSignedAt: Date
}

export class UpdateWalletDto {
  @ApiProperty({ 
    example: '0x0000000000000000000000000000000000000000',
    description: 'Ethereum or Solana wallet address'
  })
  @IsEthereumOrSolanaAddress()
  address: string

  @ApiProperty()
  @IsNotEmpty()
  name: string
}
