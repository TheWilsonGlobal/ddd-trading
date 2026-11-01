export type Tab =
  | 'dashboard'
  | 'orderbooks'
  | 'orders'
  | 'settlement'
  | 'accounts'
  | 'infra'
  | 'config';

export type SystemStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'HALTED';

export interface SystemNode {
  id: string;
  name: string;
  role: string;
  port: number;
  status: SystemStatus;
  latencyMs: number;
  uptime: string;
  lastChecked: string;
  details?: Record<string, string | number | boolean>;
}

export interface OrderBookSummary {
  symbol: string;
  status: 'TRADING' | 'HALTED' | 'AUCTION';
  lastPrice: number;
  change24h: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  bidDepthTotal: number;
  askDepthTotal: number;
  tickSize: number;
  lotSize: number;
}

export interface OrderRecord {
  orderId: string;
  accountId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP';
  price: number;
  quantity: number;
  filledQuantity: number;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  timestamp: string;
}

export interface SettlementVoucher {
  voucherId: string;
  tradeId: string;
  buyerAccount: string;
  sellerAccount: string;
  symbol: string;
  price: number;
  quantity: number;
  totalGross: number;
  feeAmount: number;
  netDebit: number;
  netCredit: number;
  invariantPassed: boolean;
  settledAt: string;
}

export interface AccountRecord {
  accountId: string;
  name: string;
  tier: 'INSTITUTIONAL' | 'RETAIL' | 'MARKET_MAKER';
  cashBalance: number;
  heldMargin: number;
  purchasingPower: number;
  securities: {
    symbol: string;
    quantity: number;
    frozenQuantity: number;
    averagePrice: number;
  }[];
  status: 'ACTIVE' | 'SUSPENDED' | 'MARGIN_CALL';
}

export interface InfraMetric {
  service: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  endpoint: string;
  latencyMs: number;
  stats: Record<string, string | number>;
}

export interface SystemRiskConfig {
  globalTradingHalt: boolean;
  maxOrderValueLimit: number;
  priceCollarPercentage: number;
  rateLimitPerSec: number;
  jwtAuthEnforced: boolean;
  circuitBreakerTriggerCount: number;
}

export type AdminRole = 'SUPER_ADMIN' | 'RISK_OFFICER' | 'OPERATOR' | 'VIEWER';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}
