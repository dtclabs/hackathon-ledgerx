import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TokensEntityService } from './tokens.entity-service'
import { Token } from './token.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [],
  providers: [TokensEntityService],
  exports: [TypeOrmModule, TokensEntityService]
})
export class TokensEntityModule {}
