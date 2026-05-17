"use client";

import { useEffect, useState } from "react";
import { fetchHeadlines } from "@/lib/api";
import type { Headline } from "@/lib/types";
import { formatRelativeTime, classNames } from "@/lib/utils";

const TAG_COLORS: Record<string, string> = {
  crypto: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  macro: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  geopolitical: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  news: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const TAG_LABEL: Record<string, string> = {
  crypto: "ON-CHAIN",
  macro: "MACRO",
  geopolitical: "GEO",
  news: "NEWS",
};

export default function MacroFeed() {
  const [items, setItems] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const r = await fetchHeadlines(60);
      if (mounted) {
        setItems(r.headlines);
        setLoading(false);
      }
    };
    tick();
    const i = setInterval(tick, 30_000);
    return () => {
      mounted = false;
      clearInterval(i);
    };
  }, []);

  return (
    <section className="bg-bg-panel border div-line h-full flex flex-col">
      <div className="px-4 py-3 border-b div-line flex items-center justify-between">
        <h2 className="font-mono-tight text-sm uppercase tracking-widest text-zinc-300">
          Geo Pulse Feed
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green live-dot" />
          <span className="text-[10px] font-mono-tight text-zinc-500 uppercase">
            273 sources
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-zinc-600 font-mono-tight text-xs animate-pulse">
            connecting to Message Platform…
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 font-mono-tight text-xs">
            <div>Feed temporarily unavailable</div>
            <div className="text-zinc-700 mt-2">
              backend: <code>/mp/v1/crypto/feed</code>
            </div>
          </div>
        ) : (
          <ul className="divide-y div-line">
            {items.map((h) => (
              <li
                key={h.id}
                className="px-4 py-3 hover:bg-bg-elevated/60 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={classNames(
                      "text-[9px] font-mono-tight uppercase tracking-widest px-1.5 py-0.5 border",
                      TAG_COLORS[h.tag] || TAG_COLORS.news,
                    )}
                  >
                    {TAG_LABEL[h.tag] || "NEWS"}
                  </span>
                  <span className="text-[10px] font-mono-tight text-zinc-500 truncate">
                    {h.source_name}
                  </span>
                  <span className="text-[10px] font-mono-tight text-zinc-600 ml-auto shrink-0">
                    {formatRelativeTime(h.published_at)}
                  </span>
                </div>
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-zinc-200 hover:text-accent-green text-sm leading-snug line-clamp-2"
                >
                  {h.title}
                </a>
                {h.sentiment_score !== 0 && (
                  <SentimentBar score={h.sentiment_score} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SentimentBar({ score }: { score: number }) {
  const positive = score > 0;
  const width = Math.min(100, Math.abs(score) * 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-[9px] font-mono-tight uppercase tracking-wider text-zinc-600">
        SENT
      </span>
      <div className="flex-1 h-1 bg-zinc-800 overflow-hidden">
        <div
          className={positive ? "h-full bg-accent-green" : "h-full bg-accent-red"}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={classNames(
          "text-[9px] font-mono-tight tabular-nums w-10 text-right",
          positive ? "text-accent-green" : "text-accent-red",
        )}
      >
        {positive ? "+" : ""}
        {(score * 100).toFixed(0)}
      </span>
    </div>
  );
}
