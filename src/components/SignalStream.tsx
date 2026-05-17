"use client";

import { useEffect, useRef, useState } from "react";
import { fetchRecentSignals, getSignalStreamUrl } from "@/lib/api";
import type { Signal } from "@/lib/types";
import { formatPrice, formatRelativeTime, classNames } from "@/lib/utils";

export default function SignalStream() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connected, setConnected] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const r = await fetchRecentSignals(20);
      if (!cancelled && r.signals.length > 0) {
        r.signals.forEach((s) => seenIdsRef.current.add(s.id));
        setSignals(r.signals);
      }
    })();

    let es: EventSource | null = null;
    try {
      es = new EventSource(getSignalStreamUrl());
      es.addEventListener("open", () => setConnected(true));
      es.addEventListener("signal", (ev) => {
        try {
          const sig = JSON.parse((ev as MessageEvent).data) as Signal;
          if (seenIdsRef.current.has(sig.id)) return;
          seenIdsRef.current.add(sig.id);
          setSignals((prev) => [sig, ...prev].slice(0, 30));
        } catch (e) {
          console.warn("[SignalStream] bad payload", e);
        }
      });
      es.addEventListener("error", () => setConnected(false));
    } catch (e) {
      console.warn("[SignalStream] SSE init failed", e);
    }

    return () => {
      cancelled = true;
      es?.close();
    };
  }, []);

  return (
    <section className="bg-bg-panel border div-line h-full flex flex-col">
      <div className="px-4 py-3 border-b div-line flex items-center justify-between">
        <h2 className="font-mono-tight text-sm uppercase tracking-widest text-zinc-300">
          AI Signal Stream
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={classNames(
              "w-1.5 h-1.5 rounded-full",
              connected ? "bg-accent-green live-dot" : "bg-zinc-600",
            )}
          />
          <span className="text-[10px] font-mono-tight text-zinc-500 uppercase">
            {connected ? "SSE live" : "polling"}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 border-b div-line bg-bg-elevated/40">
        <div className="text-[9px] font-mono-tight text-zinc-600 uppercase tracking-widest">
          paper trading · mode: simulation
        </div>
        <div className="text-[10px] font-mono-tight text-zinc-500 mt-0.5">
          composite of macro events × market structure
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {signals.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 font-mono-tight text-xs">
            <div className="animate-pulse">awaiting first signal…</div>
            <div className="text-zinc-700 mt-2 text-[10px]">
              triggered every 45-60s by macro+market composite
            </div>
          </div>
        ) : (
          <ul className="divide-y div-line">
            {signals.map((s, idx) => (
              <SignalRow signal={s} highlight={idx === 0} key={s.id} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SignalRow({ signal, highlight }: { signal: Signal; highlight: boolean }) {
  const isLong = signal.direction === "LONG";
  const dirColor = isLong ? "text-accent-green" : "text-accent-red";
  const dirBg = isLong ? "bg-accent-green/10 border-accent-green/30" : "bg-accent-red/10 border-accent-red/30";
  return (
    <li className={classNames("px-4 py-3", highlight && "signal-new")}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={classNames("text-[10px] font-mono-tight uppercase tracking-widest px-1.5 py-0.5 border font-bold", dirColor, dirBg)}>
          {signal.direction}
        </span>
        <span className="font-mono-tight text-sm font-bold text-zinc-100">
          {signal.symbol}
        </span>
        <span className="font-mono-tight text-xs text-zinc-500 tabular-nums">
          @ ${formatPrice(signal.entry_price)}
        </span>
        <span className="text-[10px] font-mono-tight text-zinc-600 ml-auto">
          {formatRelativeTime(signal.generated_at)}
        </span>
      </div>
      <p className="text-xs text-zinc-400 leading-snug mb-2">{signal.reasoning}</p>
      <div className="flex items-center gap-3 text-[10px] font-mono-tight uppercase">
        <span className="text-zinc-600">TP</span>
        <span className="text-accent-green tabular-nums">+{signal.take_profit_pct.toFixed(1)}%</span>
        <span className="text-zinc-600 ml-2">SL</span>
        <span className="text-accent-red tabular-nums">-{signal.stop_loss_pct.toFixed(1)}%</span>
        <span className="text-zinc-600 ml-auto">score</span>
        <span className={classNames("tabular-nums", dirColor)}>{signal.composite_score >= 0 ? "+" : ""}{signal.composite_score.toFixed(2)}</span>
      </div>
    </li>
  );
}
