import type {
  MarketResponse,
  Headline,
  Signal,
  CorrelationMatrix,
  CompositeScore,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://globalmessage.godpenai.com/mp/v1";

const FETCH_OPTS: RequestInit = {
  headers: { Accept: "application/json" },
  cache: "no-store",
};

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, FETCH_OPTS);
    if (!res.ok) {
      console.warn(`[GeoPulse API] ${path} returned ${res.status}`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`[GeoPulse API] ${path} failed:`, e);
    return fallback;
  }
}

export async function fetchMarket(): Promise<MarketResponse> {
  return safeFetch<MarketResponse>("/crypto/market", {
    market: { as_of: new Date().toISOString(), source: "unavailable" },
    fear_greed: {
      value: 50,
      classification: "Neutral",
      as_of: new Date().toISOString(),
      source: "unavailable",
    },
    defi_tvl_top10: [],
    as_of: new Date().toISOString(),
  });
}

export async function fetchHeadlines(limit = 40): Promise<{
  count: number;
  headlines: Headline[];
  as_of: string;
}> {
  return safeFetch(`/crypto/feed?limit=${limit}`, {
    count: 0,
    headlines: [],
    as_of: new Date().toISOString(),
  });
}

export async function fetchRecentSignals(limit = 20): Promise<{
  count: number;
  signals: Signal[];
}> {
  return safeFetch(`/crypto/signals/recent?limit=${limit}`, {
    count: 0,
    signals: [],
  });
}

export async function fetchCorrelation(): Promise<CorrelationMatrix> {
  return safeFetch<CorrelationMatrix>("/crypto/macro-correlation", {
    event_types: [],
    assets: [],
    matrix: {},
    methodology: "unavailable",
    as_of: new Date().toISOString(),
  });
}

export async function fetchCompositeScore(): Promise<CompositeScore> {
  return safeFetch<CompositeScore>("/crypto/composite-score", {
    score: 50,
    bias: "neutral",
    btc_change_24h: 0,
    eth_change_24h: 0,
    sol_change_24h: 0,
    fear_greed: null,
    as_of: new Date().toISOString(),
  });
}

export function getSignalStreamUrl(): string {
  return `${API_BASE}/crypto/signals/stream`;
}
