import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoPulse — Where Macro Signals Meet Crypto Execution",
  description:
    "A trading terminal built on Message Platform (273 sources) + OKX X-Agent skill suite. Macro events, market structure, autonomous paper-trade signals — one screen.",
  themeColor: "#0a0a0c",
  openGraph: {
    title: "GeoPulse",
    description: "Where Macro Signals Meet Crypto Execution",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grid-bg min-h-screen">{children}</body>
    </html>
  );
}
