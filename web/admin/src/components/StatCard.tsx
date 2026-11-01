import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  badge,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 bg-slate-800/80 rounded-lg text-cyan-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {subValue && <span className="text-xs text-slate-400">{subValue}</span>}
      </div>
      {(trendValue || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
          {trendValue && (
            <span
              className={`font-mono font-medium ${
                trend === 'up'
                  ? 'text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trendValue}
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
