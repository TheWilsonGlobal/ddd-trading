import React, { useState } from 'react';
import { Tab } from './types';
import { AuthProvider } from './auth/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useSystemHealth } from './hooks/useSystemHealth';
import { useLiveOrderBook } from './hooks/useLiveOrderBook';
import { useSettlementMetrics } from './hooks/useSettlementMetrics';

// Screens
import { DashboardTab } from './screens/DashboardTab';
import { OrderBookMonitorTab } from './screens/OrderBookMonitorTab';
import { OrdersInspectorTab } from './screens/OrdersInspectorTab';
import { SettlementLedgerTab } from './screens/SettlementLedgerTab';
import { AccountsRiskTab } from './screens/AccountsRiskTab';
import { InfrastructureTab } from './screens/InfrastructureTab';
import { ConfigRiskTab } from './screens/ConfigRiskTab';

function AdminDashboardContent() {
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const { nodes, isLiveConnected } = useSystemHealth(3000);
  const { books, toggleHalt, haltAll, resumeAll } = useLiveOrderBook();
  const { vouchers } = useSettlementMetrics();

  const haltedBooksCount = books.filter((b) => b.status === 'HALTED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header isLiveConnected={isLiveConnected} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          unsettledCount={0}
          haltedCount={haltedBooksCount}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950/90">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardTab
                nodes={nodes}
                books={books}
                vouchers={vouchers}
                onHaltSymbol={toggleHalt}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'orderbooks' && (
              <OrderBookMonitorTab
                books={books}
                onToggleHalt={toggleHalt}
                onHaltAll={haltAll}
                onResumeAll={resumeAll}
              />
            )}

            {currentTab === 'orders' && <OrdersInspectorTab />}

            {currentTab === 'settlement' && <SettlementLedgerTab vouchers={vouchers} />}

            {currentTab === 'accounts' && <AccountsRiskTab />}

            {currentTab === 'infra' && <InfrastructureTab />}

            {currentTab === 'config' && <ConfigRiskTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}
