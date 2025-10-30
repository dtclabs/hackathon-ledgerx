export enum RecipientEventType {
  RECIPIENT_CREATED = 'recipient.created',
  RECIPIENT_UPDATED = 'recipient.updated',
  RECIPIENT_DELETED = 'recipient.deleted'
}

export class RecipientCreatedEvent {
  constructor(public readonly recipientId: string, public readonly organizationId: string) {}
}

export class RecipientUpdateEvent {
  constructor(public readonly recipientId: string, public readonly organizationId: string) {}
}

export class RecipientDeletedEvent {
  constructor(public readonly recipientId: string, public readonly organizationId: string) {}
}
