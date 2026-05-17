import Header from "@/components/Header";

export const dynamic = "force-dynamic";

const REUSED = [
  "273 production-grade collectors (CollectorBase plugin framework)",
  "JWT + API Key authentication middleware",
  "Celery worker × 2 + Beat scheduler (3-priority queue)",
  "Redis cache + Celery broker",
  "PostgreSQL + pgvector (1024-dim BGE-M3 embeddings)",
  "AI Daily report framework (qwen3-max + GLM-4.5-Air)",
  "429 rate-limit detection + exponential back-off",
  "Health-check endpoint with three-tier aggregation",
  "Auto-generated ORM entities + auto-registered sources",
];

const ADDED = [
  "6 new crypto collectors: CoinDesk, Cointelegraph, Decrypt, The Block, Bitcoin Magazine, DefiLlama On-Chain Pulse",
  "services/okx_adapter.py — OKX X-Agent skill wrapper (onchainos CLI preferred, HTTP fallback)",
  "6 new public endpoints under /mp/v1/crypto/",
  "SSE stream for auto-generated paper trade signals",
  "Whole new frontend: this terminal (Next.js 14 + Tailwind + shadcn-style)",
  "Macro → Crypto correlation matrix engine",
];

const SKILLS = [
  {
    name: "market-structure-analyzer",
    why: "Real-time BTC / ETH / SOL price, funding rate, OI, DeFi TVL",
    where: "Market Watch column + ticker + composite score",
  },
  {
    name: "macro-intelligence",
    why: "84+ news sources, FRED macro data, Fear & Greed, Polymarket odds",
    where: "Geo Pulse Feed column + macro classification",
  },
  {
    name: "smart-money-signal-copy-trade (paper mode)",
    why: "Autonomous decision loop: signal → entry → TP/SL → PnL",
    where: "AI Signal Stream column (SSE-driven)",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 w-full">
        <section>
          <div className="text-xs font-mono-tight text-zinc-500 uppercase tracking-widest mb-2">
            Architecture & Trust
          </div>
          <h1 className="font-mono-tight text-3xl text-zinc-100 leading-tight mb-3">
            Built on a production intelligence stack
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            GeoPulse is not a hello-world hackathon project. The data layer is Message Platform —
            a 273-source intelligence collection system that has been running in production since 2026,
            with JWT auth, rate-limited Celery queues, pgvector semantic search, and a 6-type AI daily
            report engine. For this hackathon we extended it with 6 crypto-specific collectors, an OKX
            X-Agent skill adapter, and an autonomous paper-trade signal generator — then built this
            entire trading terminal on top.
          </p>
        </section>

        <section>
          <SectionTitle>System Layers</SectionTitle>
          <pre className="bg-bg-panel border div-line p-4 text-xs font-mono-tight text-zinc-300 overflow-x-auto leading-relaxed">
{`┌─────────────────────────────────────────────────────────────────┐
│ Layer 4 │ GeoPulse Terminal  (Next.js 14 / Vercel, this UI)     │
├─────────┼───────────────────────────────────────────────────────┤
│ Layer 3 │ OKX X-Agent Skill Suite                               │
│         │  market-structure-analyzer / macro-intelligence /     │
│         │  smart-money-signal-copy-trade (paper mode)           │
├─────────┼───────────────────────────────────────────────────────┤
│ Layer 2 │ OKX Adapter (services/okx_adapter.py)                 │
│         │  - 60 RPM rate limit / 60s cache                      │
│         │  - onchainos CLI when available, HTTP fallback        │
├─────────┼───────────────────────────────────────────────────────┤
│ Layer 1 │ Message Platform (FastAPI + Celery + PostgreSQL)      │
│         │  - 273 collectors plug-in framework                   │
│         │  - +6 new: CoinDesk / Cointelegraph / Decrypt /       │
│         │    The Block / Bitcoin Magazine / DefiLlama Pulse     │
│         │  - JWT + API Key auth, 3-priority Celery queue        │
│         │  - pgvector 1024-d embeddings, AI Daily framework     │
└─────────┴───────────────────────────────────────────────────────┘`}
          </pre>
        </section>

        <section>
          <SectionTitle>OKX X-Agent Skills In Use</SectionTitle>
          <ul className="space-y-3">
            {SKILLS.map((s) => (
              <li key={s.name} className="border div-line bg-bg-panel p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-accent-green text-xs">✓</span>
                  <span className="font-mono-tight text-sm font-bold text-zinc-100">{s.name}</span>
                </div>
                <div className="text-xs text-zinc-400 font-mono-tight">
                  <div><span className="text-zinc-600">why · </span>{s.why}</div>
                  <div className="mt-1"><span className="text-zinc-600">where · </span>{s.where}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid md:grid-cols-2 gap-px bg-bg-border">
          <div className="bg-bg-panel p-5">
            <SectionTitle>Reused (from production)</SectionTitle>
            <ul className="space-y-2 text-sm text-zinc-300 font-mono-tight">
              {REUSED.map((r) => (
                <li key={r} className="flex gap-2"><span className="text-zinc-600">·</span>{r}</li>
              ))}
            </ul>
          </div>
          <div className="bg-bg-panel p-5">
            <SectionTitle>Added (for this hackathon)</SectionTitle>
            <ul className="space-y-2 text-sm text-zinc-300 font-mono-tight">
              {ADDED.map((a) => (
                <li key={a} className="flex gap-2"><span className="text-accent-green">+</span>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <SectionTitle>Reliability Built In</SectionTitle>
          <div className="text-sm text-zinc-400 leading-relaxed space-y-3">
            <p>
              Every API call layer through the OKX adapter is rate-limited at 60 requests per minute and
              cached for 60 seconds. The collector framework inherited from Message Platform handles
              429 detection with fixed 60-second back-off, semaphore-controlled concurrent initialization
              to avoid Playwright crashes on Windows, exponential retry on init failures, and per-collector
              health monitoring with failure-count tracking.
            </p>
            <p>
              The auth middleware whitelists <code className="text-accent-green">/mp/v1/crypto/</code> for
              public access (no signup required for judges), while the rest of Message Platform's surface
              area remains protected by API Key + JWT.
            </p>
            <p>
              When <code>onchainos</code> CLI is available in PATH, the adapter prefers it for richer
              OKX skill semantics. When not, it falls back to the same underlying public data sources
              (CoinGecko, Alternative.me, DefiLlama, Binance public) that the OKX skills themselves use
              internally. Either path produces identical user-visible behavior.
            </p>
          </div>
        </section>

        <footer className="text-xs text-zinc-600 font-mono-tight pt-8 border-t div-line">
          GeoPulse · submitted to Build X-Agent Hackathon × OKX, May 2026
        </footer>
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono-tight text-lg uppercase tracking-widest text-zinc-200 mb-4">{children}</h2>
  );
}
