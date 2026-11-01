import React, { useState } from 'react';
import { Radio, Copy, Check, ChevronDown, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { KafkaEventRecord } from '../types';

export const EventsTab: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchKey, setSearchKey] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [events] = useState<KafkaEventRecord[]>([
    {
      id: 'evt-001',
      topic: 'market.depth',
      eventType: 'MarketDepth',
      partitionKey: 'SSI',
      timestamp: '16:50:28.148',
      payload: {
        symbol: 'SSI',
        bids: [
          { price: 34500, qty: 5200 },
          { price: 34450, qty: 8100 },
        ],
        asks: [
          { price: 34550, qty: 4300 },
          { price: 34600, qty: 9800 },
        ],
        timestamp: 1730454628148,
        sequence: 48920,
      },
    },
    {
      id: 'evt-002',
      topic: 'orders.placement',
      eventType: 'OrderPlaced',
      partitionKey: 'SSI',
      timestamp: '16:50:28.148',
      payload: {
        orderId: 'ORD-99104',
        accountId: 'ACC_APX_001',
        symbol: 'SSI',
        side: 'BUY',
        type: 'LIMIT',
        price: 34500,
        quantity: 500,
        createdAt: '2026-11-01T16:50:28.148Z',
      },
    },
    {
      id: 'evt-003',
      topic: 'orders.events',
      eventType: 'OrderMatched',
      partitionKey: 'APX',
      timestamp: '16:50:28.150',
      payload: {
        tradeId: 'TRD-882194',
        symbol: 'APX',
        makerOrderId: 'ORD-99081',
        takerOrderId: 'ORD-99104',
        makerAccountId: 'ACC_MM_001',
        takerAccountId: 'ACC_APX_001',
        price: 85200,
        quantity: 500,
        grossTurnover: 42600000,
        feeAmount: 63900,
      },
    },
    {
      id: 'evt-004',
      topic: 'market.depth',
      eventType: 'MarketDepth',
      partitionKey: 'APX',
      timestamp: '16:50:28.152',
      payload: {
        symbol: 'APX',
        bids: [{ price: 85100, qty: 3200 }],
        asks: [{ price: 85200, qty: 2800 }],
        sequence: 48921,
      },
    },
    {
      id: 'evt-005',
      topic: 'trading.settlement',
      eventType: 'SettlementCreated',
      partitionKey: 'ACC_APX_001',
      timestamp: '16:50:28.160',
      payload: {
        voucherId: 'VCH-20261101-0089',
        tradeId: 'TRD-882194',
        buyerAccount: 'ACC_APX_001',
        sellerAccount: 'ACC_MM_001',
        netDebit: 42663900,
        netCredit: 42663900,
        invariantBalanced: true,
      },
    },
    {
      id: 'evt-006',
      topic: 'orders.placement',
      eventType: 'OrderPlaced',
      partitionKey: 'VN30',
      timestamp: '16:50:29.012',
      payload: {
        orderId: 'ORD-99106',
        accountId: 'ACC_RETAIL_102',
        symbol: 'VN30',
        side: 'BUY',
        price: 1285.0,
        quantity: 25,
      },
    },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (id: string, payload: Record<string, any>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvents = events.filter((e) => {
    if (selectedTopic !== 'ALL' && e.topic !== selectedTopic) return false;
    if (searchKey && !e.partitionKey.toLowerCase().includes(searchKey.toLowerCase()) && !e.eventType.toLowerCase().includes(searchKey.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Watermill & Kafka Event Log Stream</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Immutable Commit Log
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ordered event distribution with strict Symbol/Account partition keys for deterministic FIFO replay and event sourcing.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Partitions Synchronized (Lag: 0)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'orders.placement', 'orders.events', 'market.depth', 'trading.settlement'].map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTopic === topic
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {topic === 'ALL' ? 'All Topics' : topic}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PartitionKey or Event..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Stream Viewer List */}
      <div className="space-y-2">
        {filteredEvents.map((evt) => {
          const isExpanded = expandedId === evt.id;
          const isCopied = copiedId === evt.id;

          return (
            <div
              key={evt.id}
              className="bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700 transition font-mono text-xs"
            >
              <div
                onClick={() => toggleExpand(evt.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}

                  <span className="text-slate-500 text-[11px] shrink-0">{evt.timestamp}</span>

                  <span className="text-slate-400 shrink-0">
                    topic: <span className="text-slate-200 font-semibold">{evt.topic}</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      evt.eventType === 'OrderPlaced'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : evt.eventType === 'OrderMatched'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : evt.eventType === 'MarketDepth'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {evt.eventType}
                  </span>

                  <span className="text-slate-400 truncate">
                    PartitionKey: <span className="text-cyan-400 font-bold">{evt.partitionKey}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 hover:text-cyan-300 transition">
                    {isExpanded ? 'Collapse' : 'Inspect JSON ▾'}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-slate-950 border-t border-slate-800/80 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(evt.id, evt.payload);
                    }}
                    className="absolute right-4 top-4 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 border border-slate-700 transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <pre className="text-cyan-300 text-xs overflow-x-auto leading-relaxed pt-1">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
