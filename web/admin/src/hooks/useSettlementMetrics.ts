import { useState } from 'react';
import { SettlementVoucher } from '../types';

export function useSettlementMetrics() {
  const [vouchers] = useState<SettlementVoucher[]>([
    {
      voucherId: 'VCH-20261101-0089',
      tradeId: 'TRD-882194',
      buyerAccount: 'ACC_APX_001',
      sellerAccount: 'ACC_MM_001',
      symbol: 'APX',
      price: 85200,
      quantity: 500,
      totalGross: 42600000,
      feeAmount: 63900,
      netDebit: 42663900,
      netCredit: 42663900,
      invariantPassed: true,
      settledAt: new Date(Date.now() - 1000 * 25).toLocaleTimeString(),
    },
    {
      voucherId: 'VCH-20261101-0088',
      tradeId: 'TRD-882193',
      buyerAccount: 'ACC_RETAIL_102',
      sellerAccount: 'ACC_APX_001',
      symbol: 'FPT',
      price: 134500,
      quantity: 200,
      totalGross: 26900000,
      feeAmount: 40350,
      netDebit: 26940350,
      netCredit: 26940350,
      invariantPassed: true,
      settledAt: new Date(Date.now() - 1000 * 75).toLocaleTimeString(),
    },
    {
      voucherId: 'VCH-20261101-0087',
      tradeId: 'TRD-882192',
      buyerAccount: 'ACC_MM_001',
      sellerAccount: 'ACC_INST_901',
      symbol: 'VN30',
      price: 1285.5,
      quantity: 10,
      totalGross: 12855000,
      feeAmount: 19280,
      netDebit: 12874280,
      netCredit: 12874280,
      invariantPassed: true,
      settledAt: new Date(Date.now() - 1000 * 140).toLocaleTimeString(),
    },
    {
      voucherId: 'VCH-20261101-0086',
      tradeId: 'TRD-882191',
      buyerAccount: 'ACC_APX_001',
      sellerAccount: 'ACC_RETAIL_105',
      symbol: 'APX',
      price: 85100,
      quantity: 300,
      totalGross: 25530000,
      feeAmount: 38295,
      netDebit: 25568295,
      netCredit: 25568295,
      invariantPassed: true,
      settledAt: new Date(Date.now() - 1000 * 210).toLocaleTimeString(),
    },
  ]);

  const totalSettledAmount = vouchers.reduce((acc, v) => acc + v.totalGross, 0);
  const allInvariantsValid = vouchers.every((v) => v.invariantPassed && v.netDebit === v.netCredit);

  return {
    vouchers,
    totalSettledAmount,
    allInvariantsValid,
    totalVouchersCount: vouchers.length,
  };
}
