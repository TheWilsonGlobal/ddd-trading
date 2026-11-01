import React, { useState } from 'react';
import { Search, PlusCircle, MinusCircle, Wallet, ArrowRightLeft } from 'lucide-react';
import { AccountRecord } from '../types';
import { Modal } from '../components/Modal';

export const AccountsRiskTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<AccountRecord | null>(null);
  const [modalAction, setModalAction] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);
  const [amountInput, setAmountInput] = useState<string>('50000000');

  const [accounts, setAccounts] = useState<AccountRecord[]>([
    {
      accountId: 'ACC_APX_001',
      name: 'Alpha Apex Primary Trader',
      tier: 'INSTITUTIONAL',
      cashBalance: 485000000,
      heldMargin: 42600000,
      purchasingPower: 442400000,
      securities: [
        { symbol: 'APX', quantity: 15000, frozenQuantity: 500, averagePrice: 82000 },
        { symbol: 'FPT', quantity: 4200, frozenQuantity: 0, averagePrice: 131000 },
      ],
      status: 'ACTIVE',
    },
    {
      accountId: 'ACC_MM_001',
      name: 'Omni Market Maker Hub',
      tier: 'MARKET_MAKER',
      cashBalance: 1200000000,
      heldMargin: 85000000,
      purchasingPower: 1115000000,
      securities: [
        { symbol: 'APX', quantity: 50000, frozenQuantity: 1200, averagePrice: 84000 },
        { symbol: 'VN30', quantity: 300, frozenQuantity: 10, averagePrice: 1280.0 },
      ],
      status: 'ACTIVE',
    },
    {
      accountId: 'ACC_RETAIL_102',
      name: 'Nguyen Van A (Retail VIP)',
      tier: 'RETAIL',
      cashBalance: 75000000,
      heldMargin: 12855000,
      purchasingPower: 62145000,
      securities: [{ symbol: 'VN30', quantity: 45, frozenQuantity: 0, averagePrice: 1278.5 }],
      status: 'ACTIVE',
    },
    {
      accountId: 'ACC_INST_901',
      name: 'Dragon Capital Growth Fund',
      tier: 'INSTITUTIONAL',
      cashBalance: 3450000000,
      heldMargin: 0,
      purchasingPower: 3450000000,
      securities: [{ symbol: 'FPT', quantity: 25000, frozenQuantity: 1500, averagePrice: 129000 }],
      status: 'ACTIVE',
    },
  ]);

  const handleApplyFunds = () => {
    if (!selectedAccount || !modalAction) return;
    const delta = Number(amountInput) || 0;
    if (delta <= 0) return;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.accountId === selectedAccount.accountId) {
          const newCash =
            modalAction === 'DEPOSIT' ? acc.cashBalance + delta : acc.cashBalance - delta;
          const newPower = newCash - acc.heldMargin;
          return {
            ...acc,
            cashBalance: newCash,
            purchasingPower: newPower,
          };
        }
        return acc;
      })
    );

    setModalAction(null);
    setSelectedAccount(null);
  };

  const filtered = accounts.filter(
    (a) =>
      a.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">Accounts & Purchasing Power Desk</h2>
          <p className="text-xs text-slate-400">
            Real-time trader purchasing power ("sức mua"), cash balances, and securities custody.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Account ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-60"
          />
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((acc) => (
          <div
            key={acc.accountId}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{acc.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {acc.tier}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-medium">
                  {acc.accountId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAccount(acc);
                    setModalAction('DEPOSIT');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 transition flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAccount(acc);
                    setModalAction('WITHDRAW');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-950 text-amber-400 hover:bg-amber-900 border border-amber-800 transition flex items-center gap-1"
                >
                  <MinusCircle className="w-3 h-3" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>

            {/* Financial Balance Strip */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Cash</span>
                <span className="text-white font-bold">{acc.cashBalance.toLocaleString()} VND</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Held Margin</span>
                <span className="text-amber-400 font-bold">{acc.heldMargin.toLocaleString()} VND</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Purchasing Power</span>
                <span className="text-emerald-400 font-bold">
                  {acc.purchasingPower.toLocaleString()} VND
                </span>
              </div>
            </div>

            {/* Securities Portfolio */}
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Securities Portfolio
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                {acc.securities.map((sec) => (
                  <div
                    key={sec.symbol}
                    className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{sec.symbol}</span>
                      <span className="text-slate-400 text-[11px]">
                        @ {sec.averagePrice.toLocaleString()} VND
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-300 font-bold">
                        {sec.quantity.toLocaleString()} units
                      </span>
                      {sec.frozenQuantity > 0 && (
                        <span className="text-amber-400 text-[10px] ml-2">
                          ({sec.frozenQuantity} locked)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deposit / Withdraw Modal */}
      <Modal
        isOpen={!!modalAction && !!selectedAccount}
        onClose={() => {
          setModalAction(null);
          setSelectedAccount(null);
        }}
        onConfirm={handleApplyFunds}
        title={`${modalAction === 'DEPOSIT' ? 'Deposit Funds' : 'Simulate Cash Withdrawal'} - ${
          selectedAccount?.accountId
        }`}
        description={`Simulate adjusting cash balance for account ${selectedAccount?.name}. This executes an immediate double-entry adjustment voucher.`}
        confirmLabel={modalAction === 'DEPOSIT' ? 'Execute Deposit' : 'Execute Withdrawal'}
        confirmVariant={modalAction === 'DEPOSIT' ? 'primary' : 'danger'}
      />
    </div>
  );
};
