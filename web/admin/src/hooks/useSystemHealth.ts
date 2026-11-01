import { useState, useEffect } from 'react';
import { SystemNode } from '../types';

export function useSystemHealth(pollingIntervalMs: number = 3000) {
  const [nodes, setNodes] = useState<SystemNode[]>([
    {
      id: 'gateway',
      name: 'API Gateway (REST / WebSocket)',
      role: 'Core Edge Ingestion',
      port: 5470,
      status: 'HEALTHY',
      latencyMs: 1.2,
      uptime: '99.99%',
      lastChecked: new Date().toLocaleTimeString(),
      details: {
        activeClients: 14,
        rateLimitRps: 100,
        authMode: 'JWT (Supabase RS256)',
      },
    },
    {
      id: 'engine',
      name: 'Matching Engine (FIFO L3)',
      role: 'In-Memory Price-Time Priority',
      port: 5470,
      status: 'HEALTHY',
      latencyMs: 0.4,
      uptime: '100%',
      lastChecked: new Date().toLocaleTimeString(),
      details: {
        throughput: '12,450 orders/sec',
        activeSymbols: 3,
        queueDepth: 0,
      },
    },
    {
      id: 'settlement',
      name: 'Settlement Worker (Async Ledger)',
      role: 'Batch Postgres Double-Entry',
      port: 6543,
      status: 'HEALTHY',
      latencyMs: 8.5,
      uptime: '99.95%',
      lastChecked: new Date().toLocaleTimeString(),
      details: {
        batchSize: 50,
        unsettledLag: 0,
        invariantsViolated: 0,
      },
    },
    {
      id: 'supabase',
      name: 'Supabase PostgreSQL 16',
      role: 'System of Record & Ledger',
      port: 6543,
      status: 'HEALTHY',
      latencyMs: 14.1,
      uptime: '99.98%',
      lastChecked: new Date().toLocaleTimeString(),
      details: {
        connectionPool: 'Transaction (IPv4)',
        activePoolConnections: 8,
        region: 'ap-southeast-1',
      },
    },
    {
      id: 'redis',
      name: 'Redis Cache & Idempotency',
      role: 'Order Deduplication & Token Bucket',
      port: 6379,
      status: 'HEALTHY',
      latencyMs: 0.8,
      uptime: '99.99%',
      lastChecked: new Date().toLocaleTimeString(),
      details: {
        memoryUsed: '24.6 MB',
        cachedKeys: 182,
        hitRate: '99.4%',
      },
    },
    {
      id: 'redpanda',
      name: 'Redpanda / Kafka Cluster',
      role: 'Market Event Bus (Watermill)',
      port: 9092,
      status: 'HEALTHY',
      latencyMs: 2.1,
      uptime: '99.99%',
      lastChecked: new Date().toLocaleTimeString(),
      details: {
        topics: 4,
        consumerLag: 0,
        partitionCount: 12,
      },
    },
  ]);

  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkGatewayHealth = async () => {
      try {
        const start = performance.now();
        const res = await fetch('/v1/health', { method: 'GET', signal: AbortSignal.timeout(2000) });
        const latency = Math.round((performance.now() - start) * 10) / 10;

        if (isMounted) {
          setIsLiveConnected(res.ok);
          setNodes((prev) =>
            prev.map((node) => {
              if (node.id === 'gateway') {
                return {
                  ...node,
                  status: res.ok ? 'HEALTHY' : 'DEGRADED',
                  latencyMs: latency,
                  lastChecked: new Date().toLocaleTimeString(),
                };
              }
              return node;
            })
          );
        }
      } catch (err) {
        if (isMounted) {
          setIsLiveConnected(false);
          // If gateway offline, mark node
          setNodes((prev) =>
            prev.map((node) => {
              if (node.id === 'gateway') {
                return {
                  ...node,
                  status: 'DEGRADED',
                  latencyMs: 0,
                  lastChecked: new Date().toLocaleTimeString(),
                };
              }
              return node;
            })
          );
        }
      }
    };

    checkGatewayHealth();
    const interval = setInterval(checkGatewayHealth, pollingIntervalMs);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollingIntervalMs]);

  return { nodes, isLiveConnected };
}
