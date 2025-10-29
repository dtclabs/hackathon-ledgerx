import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator'

export enum AccountRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  INVITED = 'invited',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export class CreateAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}

export class UpdateAccountDto {
  @IsOptional()
  @ApiProperty()
  image: string

  @IsOptional()
  @ApiProperty()
  firstName: string

  @IsOptional()
  @ApiProperty()
  lastName: string

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  agreementSignedAt: Date
}
