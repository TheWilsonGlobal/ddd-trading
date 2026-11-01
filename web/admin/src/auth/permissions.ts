import { AdminRole, Tab } from '../types';

export const ROLE_PERMISSIONS: Record<AdminRole, {
  allowedTabs: Tab[];
  canHaltTrading: boolean;
  canCancelOrders: boolean;
  canAdjustBalances: boolean;
  canModifyRiskConfig: boolean;
}> = {
  SUPER_ADMIN: {
    allowedTabs: ['dashboard', 'orderbooks', 'orders', 'events', 'settlement', 'accounts', 'infra', 'config'],
    canHaltTrading: true,
    canCancelOrders: true,
    canAdjustBalances: true,
    canModifyRiskConfig: true,
  },
  RISK_OFFICER: {
    allowedTabs: ['dashboard', 'orderbooks', 'orders', 'events', 'settlement', 'accounts', 'config'],
    canHaltTrading: true,
    canCancelOrders: true,
    canAdjustBalances: false,
    canModifyRiskConfig: true,
  },
  OPERATOR: {
    allowedTabs: ['dashboard', 'orderbooks', 'orders', 'events', 'settlement', 'accounts', 'infra'],
    canHaltTrading: false,
    canCancelOrders: true,
    canAdjustBalances: false,
    canModifyRiskConfig: false,
  },
  VIEWER: {
    allowedTabs: ['dashboard', 'orderbooks', 'orders', 'events', 'settlement'],
    canHaltTrading: false,
    canCancelOrders: false,
    canAdjustBalances: false,
    canModifyRiskConfig: false,
  },
};

export function getAllowedTabs(role: AdminRole): Tab[] {
  return ROLE_PERMISSIONS[role]?.allowedTabs || ['dashboard'];
}
