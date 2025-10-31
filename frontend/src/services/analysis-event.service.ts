export enum EventType {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP'
}

interface SignInMetadata {
  loginType?: string
}

interface SignUpMetadata {
  action?: 'step_1' | 'step_2' | 'step_3'
  type?: 'xero' | 'xero-store'
}

export type EventMetadataMap = {
  [EventType.SIGN_IN]: SignInMetadata
  [EventType.SIGN_UP]: SignUpMetadata
}

interface TypedEventPayload<T extends EventType> {
  eventType: T
  metadata: EventMetadataMap[T]
}

export function createEventPayload<T extends EventType>(
  eventType: T,
  metadata: EventMetadataMap[T]
): TypedEventPayload<T> {
  return { eventType, metadata }
}
