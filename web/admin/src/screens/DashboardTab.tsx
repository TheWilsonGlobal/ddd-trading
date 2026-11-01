import React from 'react';
import {
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { SystemNode, OrderBookSummary, SettlementVoucher } from '../types';

interface DashboardTabProps {
  nodes: SystemNode[];
  books: OrderBookSummary[];
  vouchers: SettlementVoucher[];
  onHaltSymbol: (symbol: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  nodes,
  books,
  vouchers,
  onHaltSymbol,
  onNavigateTab,
}) => {
  const allNodesHealthy = nodes.every((n) => n.status === 'HEALTHY');
  const totalSettledToday = vouchers.reduce((acc, v) => acc + v.totalGross, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / System State */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Platform Status
            </span>
            <StatusBadge status={allNodesHealthy ? 'HEALTHY' : 'DEGRADED'} />
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-white tracking-tight">
            Institutional Matching Engine Core
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Microsecond order matching, Supabase PostgreSQL persistence, and asynchronous double-entry settlement.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('config')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition flex items-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Emergency Kill Switch</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Matching Throughput"
          value="12,450"
          subValue="orders / sec"
          icon={Zap}
          trend="up"
          trendValue="+14.2% vs yesterday"
          badge="FIFO L3"
        />
        <StatCard
          title="Matching Latency"
          value="0.42"
          subValue="ms (P99)"
          icon={Cpu}
          trend="neutral"
          trendValue="Sub-millisecond"
          badge="Go In-Memory"
        />
        <StatCard
          title="Settled Gross (Today)"
          value={`${(totalSettledToday / 1_000_000).toFixed(1)}M`}
          subValue="VND"
          icon={Layers}
          trend="up"
          trendValue="100% Balanced"
          badge="Double-Entry"
        />
        <StatCard
          title="Active Order Books"
          value={books.length}
          subValue={`${books.filter((b) => b.status === 'TRADING').length} Trading`}
          icon={Activity}
          trend="neutral"
          trendValue="APX, VN30, FPT"
          badge="REST + WS"
        />
      </div>

      {/* Core Node Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Distributed Core Infrastructure</h3>
            <p className="text-xs text-slate-400">
              Live status, ports, and telemetry across Go services and datastores.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Polling every 3s</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{node.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{node.role}</span>
                </div>
                <StatusBadge status={node.status} />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Port: {node.port}</span>
                <span className="text-cyan-400 font-medium">{node.latencyMs} ms</span>
                <span className="text-slate-400">Uptime: {node.uptime}</span>
              </div>

              {node.details && (
                <div className="mt-2 pt-2 border-t border-slate-800/40 text-[10px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                  {Object.entries(node.details).map(([k, v]) => (
                    <span key={k}>
                      {k}: <span className="text-slate-300 font-semibold">{String(v)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Market Overview Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Active Order Books</h3>
            <p className="text-xs text-slate-400">Live BBO, spread, and circuit breaker status.</p>
          </div>
          <button
            onClick={() => onNavigateTab('orderbooks')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Full Depth</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Symbol</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Last Price</th>
                <th className="pb-3 font-semibold">24h Change</th>
                <th className="pb-3 font-semibold">Best Bid</th>
                <th className="pb-3 font-semibold">Best Ask</th>
                <th className="pb-3 font-semibold">Spread</th>
                <th className="pb-3 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {books.map((book) => (
                <tr key={book.symbol} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 font-bold text-white">{book.symbol}</td>
                  <td className="py-3">
                    <StatusBadge status={book.status} />
                  </td>
                  <td className="py-3 text-cyan-300 font-bold">{book.lastPrice.toLocaleString()}</td>
                  <td
                    className={`py-3 font-semibold ${
                      book.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {book.change24h >= 0 ? `+${book.change24h}%` : `${book.change24h}%`}
                  </td>
                  <td className="py-3 text-emerald-400">{book.bestBid.toLocaleString()}</td>
                  <td className="py-3 text-rose-400">{book.bestAsk.toLocaleString()}</td>
                  <td className="py-3 text-slate-300">{book.spread.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onHaltSymbol(book.symbol)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        book.status === 'TRADING'
                          ? 'bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800'
                      }`}
                    >
                      {book.status === 'TRADING' ? 'Halt Trading' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
