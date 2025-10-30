import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthWallet } from './wallet.entity'
import { AuthEmail } from './email.entity'
import { AuthTwitter } from './twitter.entity'
import { WalletsEntityService } from './wallets.entity-service'
import { EmailEntityService } from './email.entity-service'
import { TwitterEntityService } from './twitter.entity-service'
import { AuthXero } from './xero-account.entity'
import { XeroEntityService } from './xero-account.entity-service'

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthWallet]),
    TypeOrmModule.forFeature([AuthEmail]),
    TypeOrmModule.forFeature([AuthTwitter]),
    TypeOrmModule.forFeature([AuthXero])
  ],
  providers: [WalletsEntityService, EmailEntityService, TwitterEntityService, XeroEntityService],
  exports: [TypeOrmModule, WalletsEntityService, EmailEntityService, TwitterEntityService, XeroEntityService]
})
export class ProvidersEntityModule {}
