export type AssetSnapshot = {
  price: number | null;
  change_24h_pct: number | null;
  market_cap?: number | null;
  volume_24h?: number | null;
  high_24h?: number | null;
  low_24h?: number | null;
  funding_rate?: number | null;
  open_interest_proxy?: number | null;
};

export type MarketResponse = {
  market: {
    btc?: AssetSnapshot;
    eth?: AssetSnapshot;
    sol?: AssetSnapshot;
    as_of: string;
    source: "okx_skill" | "fallback_http" | string;
  };
  fear_greed: {
    value: number;
    classification: string;
    as_of: string;
    source: string;
  };
  defi_tvl_top10: Array<{
    name: string;
    category: string;
    tvl: number;
    change_1d: number | null;
    change_7d: number | null;
    chains: string[];
    url: string;
  }>;
  as_of: string;
};

export type Headline = {
  id: string;
  title: string;
  url: string;
  source_name: string;
  source_adapter: string;
  published_at: string | null;
  tag: "crypto" | "macro" | "geopolitical" | "news";
  summary: string;
  sentiment_score: number;
};

export type Signal = {
  id: string;
  generated_at: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  entry_price: number | null;
  take_profit_pct: number;
  stop_loss_pct: number;
  composite_score: number;
  reasoning: string;
  macro_events: Array<{
    title: string;
    url: string;
    event_type: string;
    sentiment_score: number;
  }>;
  market_snapshot: Record<string, number | null>;
  okx_skills_used: string[];
  mode: "paper";
};

export type CorrelationMatrix = {
  event_types: string[];
  assets: string[];
  matrix: Record<string, Record<string, number>>;
  methodology: string;
  as_of: string;
};

export type CompositeScore = {
  score: number;
  bias: "bullish" | "bearish" | "neutral";
  btc_change_24h: number;
  eth_change_24h: number;
  sol_change_24h: number;
  fear_greed: number | null;
  as_of: string;
};
