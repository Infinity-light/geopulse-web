"use client";

import { useEffect, useState } from "react";
import { fetchMarket } from "@/lib/api";
import type { MarketResponse, AssetSnapshot } from "@/lib/types";
import { formatPrice, formatPct, formatLargeNum, colorForChange, classNames } from "@/lib/utils";

const ASSETS = [
  { key: "btc", label: "BTC/USDT", emoji: "₿" },
  { key: "eth", label: "ETH/USDT", emoji: "Ξ" },
  { key: "sol", label: "SOL/USDT", emoji: "◎" },
] as const;

export default function MarketWatch() {
  const [data, setData] = useState<MarketResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const r = await fetchMarket();
      if (mounted) setData(r);
    };
    tick();
    const i = setInterval(tick, 15_000);
    return () => {
      mounted = false;
      clearInterval(i);
    };
  }, []);

  return (
    <section className="bg-bg-panel border div-line h-full flex flex-col">
      <div className="px-4 py-3 border-b div-line flex items-center justify-between">
        <h2 className="font-mono-tight text-sm uppercase tracking-widest text-zinc-300">
          Market Watch
        </h2>
        <div className="flex items-center gap-3">
          <SourceBadge source={data?.market?.source ?? "—"} />
          {data?.fear_greed && <FearGreedPill value={data.fear_greed.value} label={data.fear_greed.classification} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-border">
        {ASSETS.map((a) => {
          const snap = (data?.market as any)?.[a.key] as AssetSnapshot | undefined;
          return <AssetCard key={a.key} label={a.label} emoji={a.emoji} snap={snap} />;
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 border-t div-line">
        <div className="text-[10px] font-mono-tight text-zinc-500 uppercase tracking-widest mb-2">
          DeFi TVL — Top 10
        </div>
        <ul className="space-y-1 text-xs font-mono-tight">
          {(data?.defi_tvl_top10 ?? []).map((p, idx) => (
            <li
              key={p.name}
              className="flex items-center gap-3 py-1 border-b border-bg-border/40 last:border-0"
            >
              <span className="text-zinc-600 tabular-nums w-6">{(idx + 1).toString().padStart(2, "0")}</span>
              <span className="text-zinc-300 flex-1 truncate">{p.name}</span>
              <span className="text-zinc-500 hidden sm:inline truncate w-24">{p.category}</span>
              <span className="text-zinc-200 tabular-nums">{formatLargeNum(p.tvl)}</span>
              <span className={classNames("tabular-nums w-16 text-right", colorForChange(p.change_1d))}>
                {formatPct(p.change_1d)}
              </span>
            </li>
          ))}
          {(!data?.defi_tvl_top10 || data.defi_tvl_top10.length === 0) && (
            <li className="text-zinc-600 text-center py-4">loading DefiLlama…</li>
          )}
        </ul>
      </div>
    </section>
  );
}

function AssetCard({ label, emoji, snap }: { label: string; emoji: string; snap?: AssetSnapshot }) {
  const change = snap?.change_24h_pct ?? null;
  return (
    <div className="bg-bg-panel px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-lg font-mono-tight">{emoji}</span>
          <span className="font-mono-tight text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
        </div>
        <span className={classNames("text-xs font-mono-tight tabular-nums", colorForChange(change))}>
          {formatPct(change)}
        </span>
      </div>
      <div className="font-mono-tight text-2xl font-bold text-zinc-100 tabular-nums">
        {formatPrice(snap?.price)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[10px] font-mono-tight uppercase tracking-wider">
        <Stat label="funding 8h" value={snap?.funding_rate} type="rate" />
        <Stat label="mkt cap" value={snap?.market_cap} type="large" />
        <Stat label="24h hi" value={snap?.high_24h} type="price" />
        <Stat label="24h lo" value={snap?.low_24h} type="price" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  type,
}: {
  label: string;
  value: number | null | undefined;
  type: "rate" | "large" | "price";
}) {
  let display = "—";
  let color = "text-zinc-300";
  if (value !== null && value !== undefined) {
    if (type === "rate") {
      display = `${(value * 100).toFixed(4)}%`;
      color = value > 0 ? "text-accent-green" : value < 0 ? "text-accent-red" : "text-zinc-300";
    } else if (type === "large") {
      display = formatLargeNum(value);
    } else {
      display = formatPrice(value);
    }
  }
  return (
    <div>
      <div className="text-zinc-600">{label}</div>
      <div className={classNames("text-tabular tabular-nums text-xs mt-0.5", color)}>{display}</div>
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  const isOkx = source === "okx_skill";
  return (
    <span
      title={isOkx ? "via OKX onchainos CLI" : "via public HTTP fallback (same underlying source)"}
      className={classNames(
        "text-[9px] font-mono-tight uppercase tracking-widest px-1.5 py-0.5 border",
        isOkx
          ? "bg-accent-green/15 text-accent-green border-accent-green/30"
          : "bg-zinc-700/30 text-zinc-400 border-zinc-700",
      )}
    >
      {isOkx ? "OKX SKILL" : "HTTP"}
    </span>
  );
}

function FearGreedPill({ value, label }: { value: number; label: string }) {
  const color =
    value <= 25
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : value >= 75
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return (
    <span
      className={classNames(
        "text-[9px] font-mono-tight uppercase tracking-widest px-1.5 py-0.5 border tabular-nums",
        color,
      )}
    >
      F&G {value} {label}
    </span>
  );
}
