export type EventType =
  | 'nft_minted'
  | 'cashback_friday'
  | 'campaign_award'
  | 'dao_proposal'
  | 'dao_update'
  | 'new_brand_nft'
  | 'new_brand_campaign'
  | 'brand_cashback'
  | 'brand_decisions'
  | 'brand_purchases'
  | 'nft_proximity'
  | 'oracle_event'
  | 'tamagotchi_requirement'
  | 'consumer_achievement'
  | 'nft_on_amm'
  | 'audit_requirement_consumer'
  | 'platform_new_brand_nft'
  | 'vault_threshold'
  | 'dbnft_distribution'
  | 'audit_requirement_brand'
  | 'c2c_message'

export type SenderType = 'blockchain' | 'brand' | 'platform' | 'consumer'

export interface DynamicEvent {
  id: string
  eventType: EventType
  title: string
  body: string
  createdAt: string
  readAt?: string
  expiresAt?: string
  senderName?: string
  senderType?: SenderType
}
