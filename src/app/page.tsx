import Header from "@/components/Header";
import MacroFeed from "@/components/MacroFeed";
import MarketWatch from "@/components/MarketWatch";
import SignalStream from "@/components/SignalStream";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import Ticker from "@/components/Ticker";

export const dynamic = "force-dynamic";

export default function TerminalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_5fr_3fr] gap-px bg-bg-border min-h-0">
        <div className="min-h-[60vh] lg:min-h-0 lg:h-[calc(100vh-129px)]">
          <MacroFeed />
        </div>

        <div className="min-h-[60vh] lg:min-h-0 lg:h-[calc(100vh-129px)] flex flex-col gap-px bg-bg-border">
          <div className="flex-[3] min-h-0">
            <MarketWatch />
          </div>
          <div className="flex-[2] min-h-0 overflow-auto">
            <CorrelationHeatmap />
          </div>
        </div>

        <div className="min-h-[60vh] lg:min-h-0 lg:h-[calc(100vh-129px)]">
          <SignalStream />
        </div>
      </main>

      <Ticker />
    </div>
  );
}
