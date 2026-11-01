import React, { useState } from 'react';
import { Search, Ban, CheckCircle2, Clock } from 'lucide-react';
import { OrderRecord } from '../types';
import { Modal } from '../components/Modal';

export const OrdersInspectorTab: React.FC = () => {
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [filterSide, setFilterSide] = useState<string>('ALL');
  const [searchAccount, setSearchAccount] = useState<string>('');
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<OrderRecord | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      orderId: 'ORD-99104',
      accountId: 'ACC_APX_001',
      symbol: 'APX',
      side: 'BUY',
      type: 'LIMIT',
      price: 85100,
      quantity: 500,
      filledQuantity: 200,
      status: 'PARTIALLY_FILLED',
      timestamp: '15:22:10',
    },
    {
      orderId: 'ORD-99105',
      accountId: 'ACC_MM_001',
      symbol: 'APX',
      side: 'SELL',
      type: 'LIMIT',
      price: 85300,
      quantity: 1200,
      filledQuantity: 0,
      status: 'NEW',
      timestamp: '15:22:45',
    },
    {
      orderId: 'ORD-99106',
      accountId: 'ACC_RETAIL_102',
      symbol: 'VN30',
      side: 'BUY',
      type: 'LIMIT',
      price: 1285.0,
      quantity: 25,
      filledQuantity: 25,
      status: 'FILLED',
      timestamp: '15:23:01',
    },
    {
      orderId: 'ORD-99107',
      accountId: 'ACC_INST_901',
      symbol: 'FPT',
      side: 'BUY',
      type: 'LIMIT',
      price: 134200,
      quantity: 1500,
      filledQuantity: 0,
      status: 'NEW',
      timestamp: '15:23:14',
    },
    {
      orderId: 'ORD-99108',
      accountId: 'ACC_APX_001',
      symbol: 'FPT',
      side: 'SELL',
      type: 'LIMIT',
      price: 135000,
      quantity: 800,
      filledQuantity: 0,
      status: 'NEW',
      timestamp: '15:23:29',
    },
  ]);

  const handleConfirmCancel = () => {
    if (!selectedOrderToCancel) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === selectedOrderToCancel.orderId ? { ...o, status: 'CANCELLED' } : o
      )
    );
    setSelectedOrderToCancel(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterSymbol !== 'ALL' && o.symbol !== filterSymbol) return false;
    if (filterSide !== 'ALL' && o.side !== filterSide) return false;
    if (searchAccount && !o.accountId.toLowerCase().includes(searchAccount.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Orders & Execution Inspector</h2>
          <p className="text-xs text-slate-400">
            Real-time audit log of active, filled, and cancelled orders across accounts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Account ID..."
              value={searchAccount}
              onChange={(e) => setSearchAccount(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          <select
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Symbols</option>
            <option value="APX">APX</option>
            <option value="VN30">VN30</option>
            <option value="FPT">FPT</option>
          </select>

          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Account ID</th>
              <th className="pb-3 font-semibold">Symbol</th>
              <th className="pb-3 font-semibold">Side</th>
              <th className="pb-3 font-semibold">Price</th>
              <th className="pb-3 font-semibold">Quantity</th>
              <th className="pb-3 font-semibold">Filled</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredOrders.map((o) => (
              <tr key={o.orderId} className="hover:bg-slate-800/30 transition">
                <td className="py-3 font-bold text-white">{o.orderId}</td>
                <td className="py-3 text-slate-400">{o.timestamp}</td>
                <td className="py-3 text-cyan-400 font-medium">{o.accountId}</td>
                <td className="py-3 font-bold text-white">{o.symbol}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.side === 'BUY'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {o.side}
                  </span>
                </td>
                <td className="py-3 text-white">{o.price.toLocaleString()}</td>
                <td className="py-3 text-slate-300">{o.quantity.toLocaleString()}</td>
                <td className="py-3 text-slate-300">{o.filledQuantity.toLocaleString()}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'FILLED'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : o.status === 'PARTIALLY_FILLED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : o.status === 'CANCELLED'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {o.status === 'FILLED' && <CheckCircle2 className="w-3 h-3" />}
                    {o.status === 'NEW' && <Clock className="w-3 h-3" />}
                    {o.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {o.status !== 'FILLED' && o.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setSelectedOrderToCancel(o)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 transition flex items-center gap-1 ml-auto"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!selectedOrderToCancel}
        onClose={() => setSelectedOrderToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Emergency Order Cancellation"
        description={`Are you sure you want to forcibly cancel Order ${selectedOrderToCancel?.orderId} for account ${selectedOrderToCancel?.accountId}? In-memory locked purchasing power / margin will be immediately unlocked.`}
        confirmLabel="Force Cancel Order"
        confirmVariant="danger"
      />
    </div>
  );
};
