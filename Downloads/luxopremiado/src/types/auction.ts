export type AuctionStatus = "scheduled" | "open" | "closed" | "settled";
export type AuctionWinnerStatus = "pending" | "contacted" | "paid" | "delivered" | "defaulted";
export type AuctionTimelineEventType =
  | "bid"
  | "proxy_bid"
  | "extension"
  | "pause"
  | "resume"
  | "manual_close"
  | "reopen"
  | "disqualification"
  | "winner_update"
  | "trust";

export interface AuctionSnapshot {
  id: string;
  raffle_slug: string;
  slug: string;
  lot_label?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  highlight_badge?: string | null;
  image_url?: string | null;
  gallery_urls: string[];
  feature_bullets: string[];
  video_url?: string | null;
  condition_summary?: string | null;
  shipping_info?: string | null;
  pickup_info?: string | null;
  authenticity_info?: string | null;
  invoice_info?: string | null;
  lot_story?: string | null;
  condition_report?: string | null;
  authenticity_assets: string[];
  appraisal_notes?: string | null;
  tie_break_rule: string;
  settlement_deadline_hours: number;
  pause_reason?: string | null;
  paused_at?: string | null;
  opening_bid_cents: number;
  current_bid_cents: number;
  min_increment_cents: number;
  reserve_price_cents?: number | null;
  market_value_cents?: number | null;
  bid_extension_window_seconds: number;
  bid_extension_seconds: number;
  total_bids: number;
  unique_bidder_count: number;
  last_bid_at?: string | null;
  ends_at: string;
  status: AuctionStatus;
  leading_bidder_user_id?: string | null;
  leading_bidder_name?: string | null;
  leading_bidder_contact?: string | null;
  winner_user_id?: string | null;
  winner_name?: string | null;
  winner_contact?: string | null;
  winner_bid_cents?: number | null;
  winner_status: AuctionWinnerStatus;
  winner_contacted_at?: string | null;
  winner_paid_at?: string | null;
  winner_delivered_at?: string | null;
  finalized_at?: string | null;
}

export interface AuctionBidEntry {
  id: number;
  amount_cents: number;
  bidder_user_id?: string | null;
  bidder_name?: string | null;
  bidder_contact?: string | null;
  created_at: string;
  source?: "manual" | "proxy" | "admin";
  disqualified_at?: string | null;
  disqualified_reason?: string | null;
  is_leading?: boolean;
  is_viewer?: boolean;
}

export interface AuctionLeaderboardEntry {
  bidder_name?: string | null;
  bidder_contact?: string | null;
  bidder_user_id?: string | null;
  amount_cents: number;
  created_at: string;
  streak_count?: number;
  rank?: number;
  is_viewer?: boolean;
}

export interface AuctionViewerState {
  authenticated: boolean;
  has_bid: boolean;
  is_leading: boolean;
  highest_bid_cents: number | null;
  rank: number | null;
  total_ranked_bidders: number;
  gap_to_lead_cents: number | null;
  rival_bidder_name?: string | null;
  rival_amount_cents?: number | null;
  rival_gap_cents?: number | null;
  streak_count: number;
  outside_podium: boolean;
  auto_bid_max_cents: number | null;
}

export interface AuctionSocialStats {
  total_bids: number;
  unique_bidders: number;
  reserve_met: boolean;
  next_min_bid_cents: number;
  last_bid_at?: string | null;
  leader_streak_count: number;
  visitors: number;
  participant_rate: number;
  average_bid_interval_seconds: number | null;
  total_raised_cents: number;
  auto_bid_count: number;
}

export interface AuctionTimelineEvent {
  id: string;
  type: AuctionTimelineEventType;
  headline: string;
  description?: string | null;
  amount_cents?: number | null;
  created_at: string;
  is_highlight?: boolean;
}

export interface AuctionTrustInfo {
  reserve_price_cents?: number | null;
  reserve_met: boolean;
  bid_extension_window_seconds: number;
  bid_extension_seconds: number;
  tie_break_rule: string;
  settlement_deadline_hours: number;
}

export interface AuctionPerformanceSnapshot {
  visitors: number;
  participant_rate: number;
  total_raised_cents: number;
  average_bid_interval_seconds: number | null;
  auto_bid_count: number;
}

export interface AuctionPublicResponse {
  auction: AuctionSnapshot;
  recentBids: AuctionBidEntry[];
  leaderboard: AuctionLeaderboardEntry[];
  viewer: AuctionViewerState;
  stats: AuctionSocialStats;
  trust: AuctionTrustInfo;
  performance: AuctionPerformanceSnapshot;
  timeline: AuctionTimelineEvent[];
}

export interface AuctionAdminConfig {
  raffleSlug: string;
  slug: string;
  lotLabel: string;
  title: string;
  subtitle: string;
  description: string;
  highlightBadge: string;
  imageUrl: string;
  galleryUrls: string[];
  featureBullets: string[];
  videoUrl: string;
  conditionSummary: string;
  shippingInfo: string;
  pickupInfo: string;
  authenticityInfo: string;
  invoiceInfo: string;
  lotStory: string;
  conditionReport: string;
  authenticityAssets: string[];
  appraisalNotes: string;
  tieBreakRule: string;
  settlementDeadlineHours: number;
  openingBidCents: number;
  minIncrementCents: number;
  reservePriceCents: number | null;
  marketValueCents: number | null;
  endsAt: string;
  bidExtensionWindowSeconds: number;
  bidExtensionSeconds: number;
  status: AuctionStatus;
}

export interface AuctionWinnerWorkflow {
  winnerName?: string | null;
  winnerContact?: string | null;
  winnerBidCents?: number | null;
  winnerStatus: AuctionWinnerStatus;
  winnerContactedAt?: string | null;
  winnerPaidAt?: string | null;
  winnerDeliveredAt?: string | null;
}

export interface AuctionProxyEntry {
  id: string;
  bidder_name?: string | null;
  bidder_contact?: string | null;
  bidder_user_id?: string | null;
  max_amount_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface AuctionPerformanceAdminSnapshot extends AuctionPerformanceSnapshot {
  total_bids: number;
  unique_bidders: number;
}

export interface AuctionAdminPayload {
  auction: AuctionAdminConfig;
  winner: AuctionWinnerWorkflow;
  performance: AuctionPerformanceAdminSnapshot;
  recentBids: AuctionBidEntry[];
  autoBids: AuctionProxyEntry[];
  timeline: AuctionTimelineEvent[];
}
