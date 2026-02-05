export type OnboardRow = {
  registered_at: string;
  registered_at_utc8: string;
  username: string | null;
  handle: string;
  followers_count: number | null;
  bio: string | null;
  category: string | null;
  wallet_address: string | null;
  grok_summary?: string | null;
  grok_recent_focus?: string[] | null;
  grok_experience?: string[] | null;
  grok_highlights?: string[] | null;
  grok_crypto_attitude?: string | null;
  grok_checked_at?: string | null;
};

export type RecordsResponse = {
  items: OnboardRow[];
  total: number;
  page: number;
  pageSize: number;
};
