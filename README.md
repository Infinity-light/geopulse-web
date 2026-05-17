# GeoPulse

**Where macro signals meet crypto execution.**

A Bloomberg-style trading terminal that fuses a 273-source production intelligence platform with the OKX X-Agent skill suite — geopolitical news, macro events, market structure and autonomous paper-trade signals on a single screen.

Built for **Build X-Agent Hackathon × OKX, May 2026**.

![GeoPulse Demo](media/demo.gif)

> The GIF above is the same flow as [`media/demo.mp4`](media/demo.mp4). Click through for HD.

---

## What you're looking at

The terminal is three columns under a live composite bull/bear score:

- **Geo Pulse Feed** *(left)* — real-time headlines streamed from the underlying 273-source Message Platform, AI-classified as `Macro / Geopolitical / Crypto / News` with per-headline sentiment bars.
- **Market Watch** *(center)* — BTC / ETH / SOL price, 24h change, funding rate, market cap, plus a live DeFi TVL Top-10 (including OKX's own $25B TVL) and a macro→crypto correlation heatmap.
- **AI Signal Stream** *(right)* — autonomous paper-trade signals streamed via SSE, generated every 45–60 s by composing macro headlines × market structure. Each signal carries direction, TP/SL, composite score and human-readable reasoning.

The ticker at the bottom rolls live prices + breaking headlines. Top-right composite score is a single number that summarizes "bullish how much" right now.

Three pages: `/` Trading Terminal · `/daily` Crypto AI Daily report · `/about` Architecture & Trust.

---

## OKX X-Agent skills in use

| Skill | Where it shows up |
|-------|-------------------|
| `market-structure-analyzer` | Live BTC / ETH / SOL prices, funding rate, OI, DeFi TVL — Market Watch column + ticker + composite score |
| `macro-intelligence` | 84+ news sources, FRED macro, Fear & Greed (now 27 = Fear), Polymarket odds — Geo Pulse Feed column + macro classification |
| `smart-money-signal-copy-trade` (paper mode) | Autonomous signal → entry → TP/SL loop — AI Signal Stream column, SSE-driven |

Skill calls go through [`services/okx_adapter.py`](https://github.com/Infinity-light/Message-Platform/blob/feature/geopulse-crypto-hackathon/services/okx_adapter.py) — 60 RPM rate limit, 60 s cache, `onchainos` CLI preferred when available, public HTTP fallback (CoinGecko / Alternative.me / DefiLlama / Binance public) when not. Either path returns identical user-visible behavior.

---

## Built on a production intelligence stack

GeoPulse is not a hello-world hackathon project. The data plane is **Message Platform** — a FastAPI + Celery + PostgreSQL + Redis system that has been running 273 collectors in production with JWT + API Key auth, pgvector semantic search, AI Daily reports and 429-aware rate limit handling. For this hackathon we extended it minimally:

**Reused** *(zero changes)*:
- 273 production-grade collectors via `CollectorBase` plugin framework
- JWT + API Key authentication middleware
- Celery worker × 2 + Beat scheduler (3-priority queue)
- 429 rate-limit detection + exponential back-off
- Auto-generated ORM entities + auto-registered sources
- PostgreSQL + pgvector (1024-d BGE-M3 embeddings)
- AI Daily report framework (qwen3-max + GLM-4.5-Air)

**Added for this hackathon**:
- **6 new crypto collectors**: CoinDesk, Cointelegraph, Decrypt, The Block, Bitcoin Magazine, **DefiLlama On-Chain Pulse** (the last one is a TVL-anomaly event generator — not a feed, but a synthesizer that detects >15% 24h TVL moves on protocols >$10M and emits them as structured events)
- `services/okx_adapter.py` — OKX X-Agent skill wrapper (191 lines)
- `api/crypto_routes.py` — 6 public endpoints under `/mp/v1/crypto/` (220 lines)
- `whitelist += ['/mp/v1/crypto/']` in auth middleware — public, no API key
- This entire frontend — Next.js 14 + Tailwind, ~1300 lines of TS

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4 │ GeoPulse Terminal  (Next.js 14 / Vercel, this UI)    │
├─────────┼───────────────────────────────────────────────────────┤
│ Layer 3 │ OKX X-Agent Skill Suite                              │
│         │  market-structure-analyzer / macro-intelligence /    │
│         │  smart-money-signal-copy-trade (paper mode)          │
├─────────┼───────────────────────────────────────────────────────┤
│ Layer 2 │ OKX Adapter (services/okx_adapter.py)                │
│         │  - 60 RPM rate limit / 60 s cache                    │
│         │  - onchainos CLI when available, HTTP fallback       │
├─────────┼───────────────────────────────────────────────────────┤
│ Layer 1 │ Message Platform (FastAPI + Celery + PostgreSQL)     │
│         │  - 273 collectors plug-in framework                  │
│         │  - +6 new: CoinDesk / Cointelegraph / Decrypt /      │
│         │    The Block / Bitcoin Magazine / DefiLlama Pulse    │
│         │  - JWT + API Key auth, 3-priority Celery queue       │
│         │  - pgvector 1024-d embeddings, AI Daily framework    │
└─────────┴───────────────────────────────────────────────────────┘
```

Public endpoints (no auth required, courtesy of the adapter whitelist):

```
GET  /mp/v1/crypto/market              live snapshot (BTC/ETH/SOL + F&G + DeFi TVL Top10)
GET  /mp/v1/crypto/macro-correlation   macro events ↔ crypto assets correlation matrix
GET  /mp/v1/crypto/feed?limit=N        aggregated headlines from 273 sources
GET  /mp/v1/crypto/composite-score     0–100 bull/bear score + bias
GET  /mp/v1/crypto/signals/recent      last N paper trade signals
GET  /mp/v1/crypto/signals/stream      SSE — new signals as they are generated
```

---

## Running locally

```bash
# 1. Backend (Message Platform with crypto extensions)
git clone https://github.com/Infinity-light/Message-Platform.git
cd Message-Platform
git checkout feature/geopulse-crypto-hackathon
pip install -r requirements.txt
# PostgreSQL + Redis required, see message_platform/.env.example
python auto_register_sources.py
uvicorn main:app --host 127.0.0.1 --port 11528

# 2. Frontend
git clone https://github.com/Infinity-light/geopulse-web.git
cd geopulse-web
npm install
echo "NEXT_PUBLIC_API_BASE=http://127.0.0.1:11528/mp/v1" > .env.local
npm run dev   # localhost:3000
```

---

## Verify a few things in 60 seconds

```bash
# Live market snapshot (real BTC/ETH/SOL from CoinGecko via OKX adapter)
curl http://127.0.0.1:11528/mp/v1/crypto/market | jq .

# Composite score
curl http://127.0.0.1:11528/mp/v1/crypto/composite-score | jq .

# Aggregated headlines (real data from the 273-source platform)
curl http://127.0.0.1:11528/mp/v1/crypto/feed?limit=5 | jq .

# Live SSE signal stream (Ctrl-C to stop)
curl -N http://127.0.0.1:11528/mp/v1/crypto/signals/stream
```

---

## Submitted by

- **GitHub** *(frontend)*: https://github.com/Infinity-light/geopulse-web
- **GitHub** *(backend feature branch)*: `Message-Platform` @ `feature/geopulse-crypto-hackathon`
- **Demo video**: [`media/demo.mp4`](media/demo.mp4)
- **Demo GIF**: [`media/demo.gif`](media/demo.gif)
- For: **Build X-Agent Hackathon × OKX**, May 2026
