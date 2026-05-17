import Header from "@/components/Header";
import { fetchMarket, fetchHeadlines, fetchCompositeScore, fetchRecentSignals } from "@/lib/api";
import { formatPct, formatPrice, formatRelativeTime, colorForChange } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DailyPage() {
  const [market, feed, score, sigs] = await Promise.all([
    fetchMarket(),
    fetchHeadlines(20),
    fetchCompositeScore(),
    fetchRecentSignals(10),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const macroHeadlines = feed.headlines.filter((h) => h.tag === "macro").slice(0, 5);
  const cryptoHeadlines = feed.headlines.filter((h) => h.tag === "crypto").slice(0, 5);
  const geoHeadlines = feed.headlines.filter((h) => h.tag === "geopolitical").slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 w-full">
        <article>
          <div className="text-xs font-mono-tight text-zinc-500 uppercase tracking-widest mb-2">
            GeoPulse · Crypto AI Daily — {today}
          </div>
          <h1 className="font-mono-tight text-3xl text-zinc-100 leading-tight mb-3">
            Today's Macro × Crypto Pulse
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Auto-compiled from {feed.count} headlines across 273 sources + the OKX X-Agent skill suite.
            Composite bias: <span className={score.bias === "bullish" ? "text-accent-green" : score.bias === "bearish" ? "text-accent-red" : "text-amber-400"}>
              {score.bias.toUpperCase()} ({score.score.toFixed(1)})
            </span>
          </p>
        </article>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-border">
          <SnapshotTile label="BTC 24h" change={market.market.btc?.change_24h_pct ?? null} price={market.market.btc?.price ?? null} />
          <SnapshotTile label="ETH 24h" change={market.market.eth?.change_24h_pct ?? null} price={market.market.eth?.price ?? null} />
          <SnapshotTile label="SOL 24h" change={market.market.sol?.change_24h_pct ?? null} price={market.market.sol?.price ?? null} />
        </section>

        <section>
          <SectionHeader title="Macro Pulse" subtitle="What moved Fed / CPI / rates" />
          {macroHeadlines.length === 0 ? (
            <p className="text-zinc-600 text-sm">No macro-classified headlines in the last cycle.</p>
          ) : (
            <ul className="space-y-3">
              {macroHeadlines.map((h) => (
                <HeadlineRow key={h.id} title={h.title} url={h.url} src={h.source_name} time={h.published_at} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader title="On-Chain & Crypto" subtitle="Spot / DeFi / regulation" />
          {cryptoHeadlines.length === 0 ? (
            <p className="text-zinc-600 text-sm">Loading crypto feed…</p>
          ) : (
            <ul className="space-y-3">
              {cryptoHeadlines.map((h) => (
                <HeadlineRow key={h.id} title={h.title} url={h.url} src={h.source_name} time={h.published_at} />
              ))}
            </ul>
          )}
        </section>

        {geoHeadlines.length > 0 && (
          <section>
            <SectionHeader title="Geopolitical Watch" subtitle="Tail risks shaping risk-on / risk-off" />
            <ul className="space-y-3">
              {geoHeadlines.map((h) => (
                <HeadlineRow key={h.id} title={h.title} url={h.url} src={h.source_name} time={h.published_at} />
              ))}
            </ul>
          </section>
        )}

        <section>
          <SectionHeader title="AI Signals — Recent Paper Trades" subtitle="composite of macro × market structure" />
          {sigs.signals.length === 0 ? (
            <p className="text-zinc-600 text-sm">Waiting on first signal of the session…</p>
          ) : (
            <ul className="space-y-3">
              {sigs.signals.slice(0, 6).map((s) => (
                <li key={s.id} className="border div-line bg-bg-panel p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={s.direction === "LONG" ? "text-accent-green font-bold font-mono-tight" : "text-accent-red font-bold font-mono-tight"}>
                      {s.direction}
                    </span>
                    <span className="font-mono-tight text-zinc-100">{s.symbol}</span>
                    <span className="text-xs text-zinc-500 font-mono-tight">
                      @ ${formatPrice(s.entry_price)} · TP +{s.take_profit_pct}% · SL -{s.stop_loss_pct}%
                    </span>
                    <span className="text-xs text-zinc-600 font-mono-tight ml-auto">
                      {formatRelativeTime(s.generated_at)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{s.reasoning}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="text-xs text-zinc-600 font-mono-tight pt-8 border-t div-line">
          generated by GeoPulse · powered by Message Platform (273 sources) + OKX X-Agent skill suite
        </footer>
      </main>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-mono-tight text-xl text-zinc-100">{title}</h2>
      <p className="text-xs text-zinc-500 font-mono-tight uppercase tracking-wider mt-1">{subtitle}</p>
    </div>
  );
}

function SnapshotTile({ label, change, price }: { label: string; change: number | null; price: number | null }) {
  return (
    <div className="bg-bg-panel p-4">
      <div className="text-[10px] font-mono-tight uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <div className="font-mono-tight text-xl font-bold text-zinc-100 tabular-nums">${formatPrice(price)}</div>
      <div className={`text-xs font-mono-tight mt-1 tabular-nums ${colorForChange(change)}`}>{formatPct(change)}</div>
    </div>
  );
}

function HeadlineRow({ title, url, src, time }: { title: string; url: string; src: string; time: string | null }) {
  return (
    <li className="border-b div-line pb-3 last:border-0">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-zinc-100 hover:text-accent-green block leading-snug">
        {title}
      </a>
      <div className="text-xs text-zinc-600 font-mono-tight mt-1">
        {src} · {formatRelativeTime(time)}
      </div>
    </li>
  );
}
