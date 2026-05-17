"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCompositeScore } from "@/lib/api";
import type { CompositeScore } from "@/lib/types";
import { classNames } from "@/lib/utils";

export default function Header() {
  const [score, setScore] = useState<CompositeScore | null>(null);
  const [clock, setClock] = useState<string>("");

  useEffect(() => {
    const refreshScore = async () => setScore(await fetchCompositeScore());
    refreshScore();
    const i = setInterval(refreshScore, 30_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC"),
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const v = score?.score ?? 50;
  const bias = score?.bias ?? "neutral";
  const scoreColor =
    bias === "bullish"
      ? "text-accent-green score-bull"
      : bias === "bearish"
        ? "text-accent-red score-bear"
        : "text-amber-400";

  return (
    <header className="border-b div-line bg-bg-base/95 backdrop-blur sticky top-0 z-40">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-green live-dot" />
          <Link
            href="/"
            className="font-mono-tight text-xl tracking-tight text-zinc-100 font-bold"
          >
            GEO<span className="text-accent-green">PULSE</span>
          </Link>
          <span className="text-zinc-600 text-xs ml-2 hidden sm:inline">
            macro signals → crypto execution
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-mono-tight">
          <Link
            href="/"
            className="text-zinc-300 hover:text-accent-green transition-colors"
          >
            TERMINAL
          </Link>
          <Link
            href="/daily"
            className="text-zinc-300 hover:text-accent-green transition-colors"
          >
            DAILY
          </Link>
          <Link
            href="/about"
            className="text-zinc-300 hover:text-accent-green transition-colors"
          >
            ARCHITECTURE
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-xs font-mono-tight text-zinc-500 text-tabular">
            {clock}
          </div>
          <div className="flex flex-col items-end leading-none">
            <div className="text-[10px] font-mono-tight text-zinc-500 uppercase tracking-widest">
              composite score
            </div>
            <div
              className={classNames(
                "font-mono-tight text-3xl font-bold text-tabular tabular-nums",
                scoreColor,
              )}
            >
              {v.toFixed(1)}
            </div>
            <div
              className={classNames(
                "text-[10px] font-mono-tight uppercase tracking-widest mt-0.5",
                scoreColor,
              )}
            >
              {bias}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
