export function formatPrice(p: number | null | undefined, decimals = 2): string {
  if (p === null || p === undefined || Number.isNaN(p)) return "—";
  if (p >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(decimals);
  return p.toFixed(4);
}

export function formatPct(p: number | null | undefined, withSign = true): string {
  if (p === null || p === undefined || Number.isNaN(p)) return "—";
  const v = p.toFixed(2);
  return withSign ? `${p >= 0 ? "+" : ""}${v}%` : `${v}%`;
}

export function formatLargeNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function colorForChange(p: number | null | undefined): string {
  if (p === null || p === undefined || Number.isNaN(p)) return "text-zinc-500";
  if (p > 0) return "text-accent-green";
  if (p < 0) return "text-accent-red";
  return "text-zinc-400";
}

export function classNames(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(" ");
}
