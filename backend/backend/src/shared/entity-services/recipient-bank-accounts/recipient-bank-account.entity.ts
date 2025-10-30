import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { FiatCurrency } from '../fiat-currencies/fiat-currency.entity'
import { Recipient } from '../contacts/recipient.entity'

@Entity()
@Unique('UQ_recipient_bank_account_triple_a_id', ['tripleAId'])
export class RecipientBankAccount extends PublicEntity {
  @Column({ name: 'triple_a_id' })
  tripleAId: string

  @ManyToOne(() => Recipient, (recipient) => recipient.recipientBankAccounts, { nullable: false })
  @JoinColumn({ name: 'recipient_id' })
  recipient: Recipient

  @Column({ name: 'bank_name' })
  bankName: string

  @Column({ name: 'account_number_last_4' })
  accountNumberLast4: string

  @ManyToOne(() => FiatCurrency, { nullable: false })
  @JoinColumn({ name: 'fiat_currency_id' })
  fiatCurrency: FiatCurrency
}
