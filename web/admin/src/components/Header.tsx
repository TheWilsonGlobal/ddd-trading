import React, { useState, useEffect } from 'react';
import { Activity, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { AdminRole } from '../types';

interface HeaderProps {
  isLiveConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLiveConnected }) => {
  const { user, setRole } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-black shadow-lg shadow-cyan-500/20">
            DDT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">
                Trading Core
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">L3 FIFO Engine & Double-Entry Ledger</p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-2" />

        {/* System connectivity pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-300 font-mono text-[11px]">
            {isLiveConnected ? 'Gateway Connected (:5470)' : 'Gateway Reconnecting...'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Link to Trader Terminal */}
        <a
          href="http://localhost:5471"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700/60"
        >
          <span>Trader Terminal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time}</span>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <Shield className="w-4 h-4 text-cyan-400" />
          <select
            value={user.role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="bg-slate-950 text-xs font-mono text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="SUPER_ADMIN">Role: SuperAdmin</option>
            <option value="RISK_OFFICER">Role: RiskOfficer</option>
            <option value="OPERATOR">Role: Operator</option>
            <option value="VIEWER">Role: Auditor (Read-Only)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
