import React from 'react';
import { Database, HardDrive, Cpu, Radio, Network } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const InfrastructureTab: React.FC = () => {
  const kafkaTopics = [
    { name: 'trading.orders', partitions: 3, messagesTotal: '1,420,890', consumerLag: 0 },
    { name: 'trading.trades', partitions: 3, messagesTotal: '284,110', consumerLag: 0 },
    { name: 'trading.market-depth', partitions: 3, messagesTotal: '8,920,400', consumerLag: 0 },
    { name: 'trading.settlement', partitions: 3, messagesTotal: '284,110', consumerLag: 0 },
  ];

  const redisKeys = [
    { key: 'idem:ord:ORD-99104', type: 'String', ttl: '86400s', size: '128 B' },
    { key: 'depth:APX:L2', type: 'Hash', ttl: 'No TTL', size: '4.2 KB' },
    { key: 'depth:VN30:L2', type: 'Hash', ttl: 'No TTL', size: '5.1 KB' },
    { key: 'rate:ip:127.0.0.1', type: 'String', ttl: '1s', size: '32 B' },
    { key: 'session:usr_admin_001', type: 'String', ttl: '3600s', size: '512 B' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-xl font-bold text-white">Infrastructure & Event Streaming Backbone</h2>
        <p className="text-xs text-slate-400">
          Telemetry for Kafka/Redpanda event bus, Redis idempotency store, and Supabase PostgreSQL.
        </p>
      </div>

      {/* Grid of Kafka and Redis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kafka Topics Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Kafka / Redpanda Event Bus</h3>
                <span className="text-[11px] font-mono text-slate-400">Brokers: localhost:9092</span>
              </div>
            </div>
            <StatusBadge status="CONNECTED" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-2">
                  <th className="pb-2 font-semibold">Topic Name</th>
                  <th className="pb-2 font-semibold">Partitions</th>
                  <th className="pb-2 font-semibold">Messages</th>
                  <th className="pb-2 font-semibold text-right">Consumer Lag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {kafkaTopics.map((t) => (
                  <tr key={t.name} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 font-bold text-cyan-300">{t.name}</td>
                    <td className="py-2.5 text-slate-300">{t.partitions}</td>
                    <td className="py-2.5 text-white">{t.messagesTotal}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {t.consumerLag} lag
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Redis Cache Keys Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-950 text-rose-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Redis Cache & Idempotency Store</h3>
                <span className="text-[11px] font-mono text-slate-400">Port 6379 | In-Memory</span>
              </div>
            </div>
            <StatusBadge status="CONNECTED" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-2">
                  <th className="pb-2 font-semibold">Key</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">TTL</th>
                  <th className="pb-2 font-semibold text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {redisKeys.map((k) => (
                  <tr key={k.key} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 font-bold text-slate-200">{k.key}</td>
                    <td className="py-2.5 text-cyan-400">{k.type}</td>
                    <td className="py-2.5 text-slate-400">{k.ttl}</td>
                    <td className="py-2.5 text-right text-slate-300">{k.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Supabase Connection Pooler Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supabase PostgreSQL 16 Cluster</h3>
              <span className="text-[11px] font-mono text-slate-400">
                Project Ref: dxbbbhwqokvfsedoiths | Region: ap-southeast-1
              </span>
            </div>
          </div>
          <StatusBadge status="CONNECTED" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px]">Transaction Pooler (Port 6543)</span>
            <div className="text-white font-bold">aws-0-ap-southeast-1.pooler.supabase.com</div>
            <span className="text-emerald-400 text-[11px]">Active Batch Workers: 2</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px]">Direct Connection (Port 5432)</span>
            <div className="text-white font-bold">db.dxbbbhwqokvfsedoiths.supabase.co</div>
            <span className="text-slate-400 text-[11px]">Reserved for Migrations/DDL</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px]">Financial Tables</span>
            <div className="text-cyan-400 font-bold">accounts, ledger_entries, trades</div>
            <span className="text-slate-400 text-[11px]">Strict Foreign Keys & Check Constraints</span>
          </div>
        </div>
      </div>
    </div>
  );
};
