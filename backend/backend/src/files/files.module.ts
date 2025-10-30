import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { LoggerModule } from '../shared/logger/logger.module'

@Module({
  imports: [LoggerModule],
  controllers: [FilesController],
  providers: [FilesService, ConfigService],
  exports: [FilesService]
})
export class FilesModule {}
