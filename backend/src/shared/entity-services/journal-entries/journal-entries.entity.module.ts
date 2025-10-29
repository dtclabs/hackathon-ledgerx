import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { JournalEntriesEntityService } from './journal-entries.entity-service'
import { JournalEntry } from './journal-entry.entity'
import { JournalLine } from './journal-line.entity'

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalLine])],
  controllers: [],
  providers: [JournalEntriesEntityService],
  exports: [TypeOrmModule, JournalEntriesEntityService]
})
export class JournalEntriesEntityModule {}
