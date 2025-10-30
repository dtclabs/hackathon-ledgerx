export enum RecipientBankAccountEventType {
  RECIPIENT_BANK_ACCOUNT_DELETED = 'recipient_bank_account.deleted'
}

export class RecipientBankAccountDeletedEvent {
  constructor(public readonly recipientBankAccountId: string, public readonly organizationId: string) {}
}
