import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'
import { Account } from '../shared/entity-services/account/account.entity'

export class LoginAuthDto {
  @ApiProperty()
  token: string

  @ApiProperty()
  address: string

  @ApiProperty()
  signature: string

  @ApiProperty()
  @IsNotEmpty()
  provider: EProvider
}

export class AuthorizationDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateIf((obj) => obj.provider !== EProvider.WALLET)
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @ValidateIf((obj) => obj.provider === EProvider.WALLET)
  address: string

  @ApiProperty()
  @IsNotEmpty()
  @ValidateIf((obj) => obj.provider === EProvider.WALLET)
  signature: string

  @ApiProperty()
  @IsNotEmpty()
  provider: EProvider
}

export class SignUpAuthDto extends LoginAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  agreementSignedAt: Date
}

export enum EProvider {
  EMAIL = 'email',
  TWITTER = 'twitter',
  WALLET = 'wallet',
  XERO = 'xero'
}

export interface JwtPayload {
  verifierId: string
  authId: string
  accountId: string
  address: string
  walletId: string
  provider: string
  organizationId?: string
  roles?: string[]
  iat?: number
  exp?: number
}

export class AuthorizationResponseDto {
  accessToken: string
  account: Account
  isNewAccount: boolean
}
