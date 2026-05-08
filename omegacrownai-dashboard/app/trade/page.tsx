import { Suspense } from "react";
import TradeClient from "@/components/trade/TradeClient";

export default function TradePage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">Loading trading engine...</div>}>
      <TradeClient />
    </Suspense>
  );
}
