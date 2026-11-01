import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  ListOrdered,
  Radio,
  FileSpreadsheet,
  Users,
  Server,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Tab } from '../types';
import { useAuth } from '../auth/AuthContext';
import { getAllowedTabs } from '../auth/permissions';

interface SidebarProps {
  currentTab: Tab;
  onSelectTab: (tab: Tab) => void;
  unsettledCount?: number;
  haltedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unsettledCount = 0,
  haltedCount = 0,
}) => {
  const { user } = useAuth();
  const allowedTabs = getAllowedTabs(user.role);

  const navItems: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; badgeVariant?: 'rose' | 'slate' | 'cyan' }[] = [
    { key: 'dashboard', label: 'System Overview', icon: LayoutDashboard },
    {
      key: 'orderbooks',
      label: 'Order Books & L2',
      icon: BarChart3,
      badge: haltedCount > 0 ? `${haltedCount} Halted` : undefined,
      badgeVariant: 'rose',
    },
    { key: 'orders', label: 'Orders Inspector', icon: ListOrdered },
    {
      key: 'events',
      label: 'Kafka Event Stream',
      icon: Radio,
      badge: 'Live',
      badgeVariant: 'cyan',
    },
    {
      key: 'settlement',
      label: 'Ledger',
      icon: FileSpreadsheet,
      badge: unsettledCount > 0 ? unsettledCount : 'Verified',
      badgeVariant: unsettledCount > 0 ? 'rose' : 'cyan',
    },
    { key: 'accounts', label: 'Accounts & Balances', icon: Users },
    { key: 'infra', label: 'Infra & Event Stream', icon: Server },
    { key: 'config', label: 'Risk & Kill Switches', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur p-4 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 pb-3 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Operations & Control
        </div>
        {navItems
          .filter((item) => allowedTabs.includes(item.key))
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.badgeVariant === 'rose'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          : item.badgeVariant === 'cyan'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
      </div>

      {/* Operator identity card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400">Operator Identity</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="mt-1 text-xs font-bold text-white truncate">{user.name}</div>
          <div className="text-[11px] font-mono text-cyan-400 truncate">{user.role}</div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">{user.email}</div>
        </div>
      </div>
    </aside>
  );
};
