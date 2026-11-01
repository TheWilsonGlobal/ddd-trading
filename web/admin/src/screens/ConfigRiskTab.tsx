import React, { useState } from 'react';
import { Sliders, ShieldAlert, Lock, CheckCircle, AlertOctagon } from 'lucide-react';
import { Modal } from '../components/Modal';

export const ConfigRiskTab: React.FC = () => {
  const [globalHalt, setGlobalHalt] = useState<boolean>(false);
  const [collarPercent, setCollarPercent] = useState<number>(7.0);
  const [maxOrderValue, setMaxOrderValue] = useState<number>(500000000);
  const [rateLimitRps, setRateLimitRps] = useState<number>(100);
  const [jwtAuthMode, setJwtAuthMode] = useState<string>('jwt');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggleGlobalHalt = () => {
    setGlobalHalt((prev) => !prev);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-xl font-bold text-white">Risk Controls & Market Circuit Breakers</h2>
        <p className="text-xs text-slate-400">
          Configure price volatility collars, maximum notional order sizes, API rate limits, and the emergency kill switch.
        </p>
      </div>

      {/* Global Kill Switch Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        globalHalt
          ? 'bg-rose-950/60 border-rose-600 shadow-lg shadow-rose-950/50'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${globalHalt ? 'bg-rose-600 text-white' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white">Emergency Global Kill Switch</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  globalHalt ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {globalHalt ? 'HALTED ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Immediately rejects all incoming order placement requests across all matching engine books (APX, VN30, FPT) and pauses trade settlement.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition shadow-md shrink-0 ${
              globalHalt
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
            }`}
          >
            {globalHalt ? 'Resume Global Trading' : 'Engage Emergency Kill Switch'}
          </button>
        </div>
      </div>

      {/* Risk Parameters Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Pre-Trade Risk & Volatility Collars</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Price Collar */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Price Volatility Collar (% from Reference Price)
            </label>
            <p className="text-slate-400 text-[11px]">
              Orders outside $\pm X\%$ will be rejected by pre-trade validation.
            </p>
            <input
              type="number"
              step="0.5"
              value={collarPercent}
              onChange={(e) => setCollarPercent(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Max Order Value Limit */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Max Single Order Value Limit (VND)
            </label>
            <p className="text-slate-400 text-[11px]">
              Maximum notional transaction value allowed per order.
            </p>
            <input
              type="number"
              step="50000000"
              value={maxOrderValue}
              onChange={(e) => setMaxOrderValue(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Rate Limit RPS */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              API Gateway Rate Limit (RPS per IP)
            </label>
            <p className="text-slate-400 text-[11px]">
              Token-bucket enforcement at Gateway edge.
            </p>
            <input
              type="number"
              value={rateLimitRps}
              onChange={(e) => setRateLimitRps(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* JWT Auth Enforcement */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Gateway Authentication Mode
            </label>
            <p className="text-slate-400 text-[11px]">
              Enforce cryptographic JWT signature verification vs. header fallback.
            </p>
            <select
              value={jwtAuthMode}
              onChange={(e) => setJwtAuthMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="jwt">Enforce Supabase RS256 JWT</option>
              <option value="dev">Dev Sandbox (X-Account-ID Header)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-black transition flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Apply Risk Configuration</span>
          </button>

          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle className="w-4 h-4" />
              <span>Parameters deployed to Gateway & Engine</span>
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleToggleGlobalHalt}
        title={globalHalt ? 'Resume Global Trading Operations' : 'ENGAGE EMERGENCY GLOBAL KILL SWITCH'}
        description={
          globalHalt
            ? 'Are you sure you want to resume matching across all symbols? Orders in queues will resume execution.'
            : 'CRITICAL ACTION: This will immediately reject every inbound order across all symbols and halt the trading engine. Confirm only during verified system anomalies.'
        }
        confirmLabel={globalHalt ? 'Confirm Resume' : 'EXECUTE GLOBAL HALT'}
        confirmVariant={globalHalt ? 'primary' : 'danger'}
      />
    </div>
  );
};
