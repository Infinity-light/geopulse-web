"use client";

import { useEffect, useState } from "react";
import { fetchCorrelation } from "@/lib/api";
import type { CorrelationMatrix } from "@/lib/types";
import { classNames } from "@/lib/utils";

export default function CorrelationHeatmap() {
  const [data, setData] = useState<CorrelationMatrix | null>(null);

  useEffect(() => {
    fetchCorrelation().then(setData);
  }, []);

  if (!data || data.event_types.length === 0) {
    return (
      <section className="bg-bg-panel border div-line p-4">
        <div className="text-xs text-zinc-600 font-mono-tight">correlation matrix loading…</div>
      </section>
    );
  }

  return (
    <section className="bg-bg-panel border div-line">
      <div className="px-4 py-3 border-b div-line flex items-center justify-between">
        <h2 className="font-mono-tight text-sm uppercase tracking-widest text-zinc-300">
          Macro → Crypto Correlation
        </h2>
        <span className="text-[10px] font-mono-tight text-zinc-600">
          historical 24h reaction
        </span>
      </div>
      <div className="p-3 overflow-x-auto">
        <table className="w-full text-xs font-mono-tight border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="text-left text-zinc-600 font-normal uppercase text-[10px] tracking-widest p-2">
                event type
              </th>
              {data.assets.map((a) => (
                <th key={a} className="text-zinc-400 font-bold text-center px-3">
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.event_types.map((et) => (
              <tr key={et}>
                <td className="text-zinc-300 py-1.5 whitespace-nowrap pr-3">{et}</td>
                {data.assets.map((a) => {
                  const v = data.matrix[et]?.[a] ?? 0;
                  return (
                    <td key={a} className="text-center">
                      <Cell value={v} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t div-line text-[10px] font-mono-tight text-zinc-600 flex items-center justify-between gap-3">
        <span>{data.methodology}</span>
        <Legend />
      </div>
    </section>
  );
}

function Cell({ value }: { value: number }) {
  const intensity = Math.min(1, Math.abs(value));
  const bg =
    value > 0
      ? `rgba(0, 255, 156, ${0.1 + intensity * 0.4})`
      : value < 0
        ? `rgba(255, 59, 107, ${0.1 + intensity * 0.4})`
        : "rgba(120,120,140,0.1)";
  return (
    <span
      className="inline-block px-3 py-1 tabular-nums text-zinc-100 min-w-[64px]"
      style={{ backgroundColor: bg }}
    >
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}
    </span>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-700">-1</span>
      <span className="h-2 w-24 bg-gradient-to-r from-accent-red via-zinc-700 to-accent-green" />
      <span className="text-zinc-700">+1</span>
    </div>
  );
}
