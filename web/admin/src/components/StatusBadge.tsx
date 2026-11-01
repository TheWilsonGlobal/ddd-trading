import React from 'react';
import { SystemStatus } from '../types';

interface StatusBadgeProps {
  status: SystemStatus | 'TRADING' | 'HALTED' | 'AUCTION' | 'ACTIVE' | 'CONNECTED' | 'DISCONNECTED';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'HEALTHY':
    case 'TRADING':
    case 'ACTIVE':
    case 'CONNECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {status}
        </span>
      );
    case 'DEGRADED':
    case 'AUCTION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          {status}
        </span>
      );
    case 'HALTED':
    case 'OFFLINE':
    case 'DISCONNECTED':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          {status}
        </span>
      );
  }
};
