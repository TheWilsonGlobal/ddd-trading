import React, { useState } from 'react';
import { ShieldAlert, Play, Square, Layers } from 'lucide-react';
import { OrderBookSummary } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface OrderBookMonitorTabProps {
  books: OrderBookSummary[];
  onToggleHalt: (symbol: string) => void;
  onHaltAll: () => void;
  onResumeAll: () => void;
}

export const OrderBookMonitorTab: React.FC<OrderBookMonitorTabProps> = ({
  books,
  onToggleHalt,
  onHaltAll,
  onResumeAll,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('APX');
  const currentBook = books.find((b) => b.symbol === selectedSymbol) || books[0];

  // Mock L2 book levels for the selected symbol
  const mockBids = [
    { price: currentBook.bestBid, qty: 3200, orders: 4 },
    { price: currentBook.bestBid - currentBook.tickSize, qty: 5400, orders: 8 },
    { price: currentBook.bestBid - currentBook.tickSize * 2, qty: 8100, orders: 12 },
    { price: currentBook.bestBid - currentBook.tickSize * 3, qty: 4500, orders: 6 },
    { price: currentBook.bestBid - currentBook.tickSize * 4, qty: 12000, orders: 15 },
  ];

  const mockAsks = [
    { price: currentBook.bestAsk, qty: 2800, orders: 3 },
    { price: currentBook.bestAsk + currentBook.tickSize, qty: 4100, orders: 7 },
    { price: currentBook.bestAsk + currentBook.tickSize * 2, qty: 6900, orders: 9 },
    { price: currentBook.bestAsk + currentBook.tickSize * 3, qty: 3200, orders: 5 },
    { price: currentBook.bestAsk + currentBook.tickSize * 4, qty: 9500, orders: 11 },
  ];

  const totalBidQty = mockBids.reduce((a, b) => a + b.qty, 0);
  const totalAskQty = mockAsks.reduce((a, b) => a + b.qty, 0);
  const imbalance = Math.round(((totalBidQty - totalAskQty) / (totalBidQty + totalAskQty)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Order Book & L2 Market Depth</h2>
          <p className="text-xs text-slate-400">
            Real-time Level 2 order books, spread collars, and circuit breakers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResumeAll}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resume All</span>
          </button>
          <button
            onClick={onHaltAll}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900 transition flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Halt All Symbols</span>
          </button>
        </div>
      </div>

      {/* Symbol Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {books.map((b) => (
          <button
            key={b.symbol}
            onClick={() => setSelectedSymbol(b.symbol)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition flex items-center gap-3 ${
              selectedSymbol === b.symbol
                ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="font-bold">{b.symbol}</span>
            <span className="text-cyan-400 font-semibold">{b.lastPrice.toLocaleString()}</span>
            <StatusBadge status={b.status} />
          </button>
        ))}
      </div>

      {/* Detail Book Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Bid/Ask Depth Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-white">{currentBook.symbol}</span>
              <StatusBadge status={currentBook.status} />
              <span className="text-xs font-mono text-slate-400">
                Tick: {currentBook.tickSize} | Lot: {currentBook.lotSize}
              </span>
            </div>
            <button
              onClick={() => onToggleHalt(currentBook.symbol)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                currentBook.status === 'TRADING'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{currentBook.status === 'TRADING' ? 'Halt Symbol' : 'Resume Symbol'}</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Bids */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 font-mono flex justify-between">
                <span>Buy Depth (Bids)</span>
                <span>Qty</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {mockBids.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 relative overflow-hidden"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                      style={{ width: `${(b.qty / 12000) * 100}%` }}
                    />
                    <span className="text-emerald-400 font-bold">{b.price.toLocaleString()}</span>
                    <span className="text-slate-200">{b.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 font-mono flex justify-between">
                <span>Sell Depth (Asks)</span>
                <span>Qty</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {mockAsks.map((a, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 relative overflow-hidden"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                      style={{ width: `${(a.qty / 12000) * 100}%` }}
                    />
                    <span className="text-rose-400 font-bold">{a.price.toLocaleString()}</span>
                    <span className="text-slate-200">{a.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Depth Metrics & Circuit Breaker Limits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Liquidity Metrics
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Spread:</span>
              <span className="text-cyan-400 font-bold">{currentBook.spread.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Bid Liquidity:</span>
              <span className="text-emerald-400 font-bold">{totalBidQty.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Ask Liquidity:</span>
              <span className="text-rose-400 font-bold">{totalAskQty.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Depth Imbalance:</span>
              <span
                className={`font-bold ${
                  imbalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {imbalance > 0 ? `+${imbalance}%` : `${imbalance}%`}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Layers className="w-4 h-4" />
              <span>Matching Rules</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Price-Time Priority (FIFO). In-memory ring buffer with $O(1)$ order placement and cancellation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
