"use client";

import { useEffect, useState } from "react";
import { fetchMarket, fetchHeadlines } from "@/lib/api";
import type { AssetSnapshot, Headline } from "@/lib/types";
import { formatPrice, formatPct, classNames, colorForChange } from "@/lib/utils";

type TickerItem =
  | { kind: "price"; symbol: string; price: number | null; change: number | null }
  | { kind: "news"; title: string; tag: string };

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const [m, n] = await Promise.all([fetchMarket(), fetchHeadlines(8)]);
      if (!mounted) return;
      const prices: TickerItem[] = (["btc", "eth", "sol"] as const).flatMap((k) => {
        const s = (m.market as any)?.[k] as AssetSnapshot | undefined;
        if (!s) return [];
        return [{ kind: "price" as const, symbol: k.toUpperCase(), price: s.price ?? null, change: s.change_24h_pct ?? null }];
      });
      const news: TickerItem[] = n.headlines.slice(0, 8).map((h: Headline) => ({
        kind: "news" as const,
        title: h.title,
        tag: h.tag,
      }));
      setItems([...prices, ...news]);
    };
    tick();
    const i = setInterval(tick, 30_000);
    return () => {
      mounted = false;
      clearInterval(i);
    };
  }, []);

  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div className="border-t div-line bg-bg-base overflow-hidden">
      <div className="ticker-track flex items-center gap-8 py-2 whitespace-nowrap">
        {doubled.map((it, idx) =>
          it.kind === "price" ? (
            <span key={idx} className="font-mono-tight text-xs flex items-center gap-2">
              <span className="text-zinc-500 uppercase">{it.symbol}</span>
              <span className="text-zinc-100 tabular-nums">${formatPrice(it.price)}</span>
              <span className={classNames("tabular-nums", colorForChange(it.change))}>
                {formatPct(it.change)}
              </span>
            </span>
          ) : (
            <span key={idx} className="font-mono-tight text-xs flex items-center gap-2">
              <span
                className={classNames(
                  "text-[9px] uppercase tracking-widest px-1.5 py-0.5 border",
                  it.tag === "crypto"
                    ? "text-emerald-300 border-emerald-500/30"
                    : it.tag === "macro"
                      ? "text-rose-300 border-rose-500/30"
                      : "text-amber-300 border-amber-500/30",
                )}
              >
                {it.tag.toUpperCase()}
              </span>
              <span className="text-zinc-300 truncate max-w-md">{it.title}</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
