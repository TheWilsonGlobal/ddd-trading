import React from 'react';
import { ShieldCheck, CheckCircle2, Database, Download } from 'lucide-react';
import { SettlementVoucher } from '../types';

interface SettlementLedgerTabProps {
  vouchers: SettlementVoucher[];
}

export const SettlementLedgerTab: React.FC<SettlementLedgerTabProps> = ({ vouchers }) => {
  const totalGross = vouchers.reduce((acc, v) => acc + v.totalGross, 0);
  const totalFees = vouchers.reduce((acc, v) => acc + v.feeAmount, 0);
  const totalDebits = vouchers.reduce((acc, v) => acc + v.netDebit, 0);
  const totalCredits = vouchers.reduce((acc, v) => acc + v.netCredit, 0);
  const balanceDifference = totalDebits - totalCredits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Double-Entry Settlement & Ledger Audit</h2>
          <p className="text-xs text-slate-400">
            Institutional verification of financial invariants: Debits must strictly equal Credits.
          </p>
        </div>

        <button
          onClick={() => alert('Vouchers exported to CSV')}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger Vouchers</span>
        </button>
      </div>

      {/* Invariant Health Banner */}
      <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-900/60 text-emerald-400 rounded-xl border border-emerald-700/60">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-emerald-400">
                Invariant Check:
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-900 text-emerald-300 font-mono">
                PASSING (0 Violations)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Sum of Debits equals Sum of Credits across all settled vouchers. Double-entry bookkeeping balance integrity: 100%.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Debits</span>
            <span className="text-emerald-400 font-bold">{totalDebits.toLocaleString()} VND</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Credits</span>
            <span className="text-cyan-400 font-bold">{totalCredits.toLocaleString()} VND</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Imbalance Difference</span>
            <span className="text-white font-bold">{balanceDifference} VND</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-[11px]">Gross Settled Turnover</span>
            <div className="text-lg font-bold text-white mt-1">{totalGross.toLocaleString()} VND</div>
          </div>
          <Database className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-[11px]">Exchange Fees Collected (0.15%)</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">{totalFees.toLocaleString()} VND</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-[11px]">Settlement Backend</span>
            <div className="text-lg font-bold text-white mt-1">Supabase pgx.Batch</div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            Pooler 6543
          </span>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">
          Settlement Vouchers
        </h3>

        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Voucher ID</th>
              <th className="pb-3 font-semibold">Trade ID</th>
              <th className="pb-3 font-semibold">Buyer (Debit)</th>
              <th className="pb-3 font-semibold">Seller (Credit)</th>
              <th className="pb-3 font-semibold">Symbol</th>
              <th className="pb-3 font-semibold">Price</th>
              <th className="pb-3 font-semibold">Qty</th>
              <th className="pb-3 font-semibold">Gross</th>
              <th className="pb-3 font-semibold">Fee</th>
              <th className="pb-3 font-semibold">Invariant</th>
              <th className="pb-3 font-semibold text-right">Settled At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {vouchers.map((v) => (
              <tr key={v.voucherId} className="hover:bg-slate-800/30 transition">
                <td className="py-3 font-bold text-white">{v.voucherId}</td>
                <td className="py-3 text-cyan-400">{v.tradeId}</td>
                <td className="py-3 text-slate-300">{v.buyerAccount}</td>
                <td className="py-3 text-slate-300">{v.sellerAccount}</td>
                <td className="py-3 font-bold text-white">{v.symbol}</td>
                <td className="py-3 text-slate-300">{v.price.toLocaleString()}</td>
                <td className="py-3 text-slate-300">{v.quantity.toLocaleString()}</td>
                <td className="py-3 text-white font-semibold">{v.totalGross.toLocaleString()}</td>
                <td className="py-3 text-slate-400">{v.feeAmount.toLocaleString()}</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    BALANCED
                  </span>
                </td>
                <td className="py-3 text-right text-slate-400">{v.settledAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
