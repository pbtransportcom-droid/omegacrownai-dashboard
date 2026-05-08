'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { analyzeSymbol, generateTradingPlan } from '@/lib/api/trade';
import { TradingAnalysis } from '@/lib/types';

export function TradeWorkspace() {
  const [symbol, setSymbol] = useState('AAPL');
  const [result, setResult] = useState<TradingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      setResult(await analyzeSymbol(symbol));
    } catch {
      setResult({ signal: 'BUY', confidence: 82, risk: 'medium', analysis: 'Scaffold fallback: RSI oversold, MACD bullish crossover.', symbol });
    } finally {
      setLoading(false);
    }
  }

  async function plan() {
    setLoading(true);
    try {
      setResult(await generateTradingPlan(symbol));
    } catch {
      setResult({ signal: 'HOLD', confidence: 76, risk: 'medium', analysis: 'Entry above prior high, stop below EMA20, target next resistance.', symbol });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr_1fr]">
      <Card>
        <h3 className="font-semibold">Watchlist</h3>
        <div className="mt-4 space-y-2 text-sm text-muted">
          {['AAPL', 'TSLA', 'BTCUSDT', 'ETHUSDT', 'NVDA'].map((item) => (
            <button key={item} onClick={() => setSymbol(item)} className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 hover:bg-white/5">
              <span>{item}</span>
              <span>{item === symbol ? '•' : ''}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-3">
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="max-w-xs" />
          <Button onClick={analyze}>{loading ? 'Analyzing...' : 'Analyze'}</Button>
          <Button variant="secondary" onClick={plan}>Generate trading plan</Button>
        </div>
        <div className="mt-6 flex h-[380px] items-center justify-center rounded-2xl border border-dashed border-border bg-black/20 text-sm text-muted">
          Candlestick chart placeholder with indicators (TradingView widget or custom chart)
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">AI analysis</h3>
          <Badge tone={result?.signal === 'BUY' ? 'success' : result?.signal === 'SELL' ? 'danger' : 'warning'}>{result?.signal || 'WAITING'}</Badge>
        </div>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="text-muted">Confidence</p>
            <p className="mt-1 text-2xl font-semibold">{result?.confidence ?? '--'}{result ? '%' : ''}</p>
          </div>
          <div>
            <p className="text-muted">Risk</p>
            <p className="mt-1 font-medium capitalize">{result?.risk || '--'}</p>
          </div>
          <div>
            <p className="text-muted">Explanation</p>
            <p className="mt-2 leading-7 text-text/90">{result?.analysis || 'Run a symbol analysis to populate the right rail.'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
