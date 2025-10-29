import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { PaymentStatus, PaymentMethod, SubscriptionDetails, InvoiceMetadata } from './interfaces'
import { Organization } from '../organizations/organization.entity'

@Entity()
export class BillingHistory extends PublicEntity {
  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'billing_currency' })
  billingCurrency: string

  @Column({ name: 'billed_amount' })
  billedAmount: string

  @Column()
  status: PaymentStatus

  @Column({ name: 'paid_amount', nullable: true })
  paidAmount: string

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date

  @Column({ name: 'payment_currency', nullable: true })
  paymentCurrency: string

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: PaymentMethod

  @Column({ name: 'subscription_details', type: 'json', nullable: true })
  subscriptionDetails: SubscriptionDetails

  @Column({ name: 'invoice_metadata', type: 'json', nullable: true })
  invoiceMetadata: InvoiceMetadata
}
