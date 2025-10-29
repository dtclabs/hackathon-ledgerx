export enum NftEventType {
  POLL_ADDRESS_SYNC = 'nfts.poll-address-sync'
}

export interface PollNftAddressSyncEvent {
  nftAddressSyncId: string
}
