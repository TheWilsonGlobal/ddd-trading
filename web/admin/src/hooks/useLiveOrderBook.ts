import { useState } from 'react';
import { OrderBookSummary } from '../types';

export function useLiveOrderBook() {
  const [books, setBooks] = useState<OrderBookSummary[]>([
    {
      symbol: 'APX',
      status: 'TRADING',
      lastPrice: 85200,
      change24h: 3.45,
      bestBid: 85100,
      bestAsk: 85200,
      spread: 100,
      bidDepthTotal: 18450,
      askDepthTotal: 14200,
      tickSize: 100,
      lotSize: 100,
    },
    {
      symbol: 'VN30',
      status: 'TRADING',
      lastPrice: 1285.5,
      change24h: -0.42,
      bestBid: 1285.0,
      bestAsk: 1285.5,
      spread: 0.5,
      bidDepthTotal: 45000,
      askDepthTotal: 52100,
      tickSize: 0.1,
      lotSize: 1,
    },
    {
      symbol: 'FPT',
      status: 'TRADING',
      lastPrice: 134500,
      change24h: 1.89,
      bestBid: 134400,
      bestAsk: 134500,
      spread: 100,
      bidDepthTotal: 29000,
      askDepthTotal: 21500,
      tickSize: 100,
      lotSize: 100,
    },
  ]);

  const toggleHalt = (symbol: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.symbol === symbol) {
          const nextStatus = book.status === 'TRADING' ? 'HALTED' : 'TRADING';
          return { ...book, status: nextStatus };
        }
        return book;
      })
    );
  };

  const haltAll = () => {
    setBooks((prev) => prev.map((book) => ({ ...book, status: 'HALTED' })));
  };

  const resumeAll = () => {
    setBooks((prev) => prev.map((book) => ({ ...book, status: 'TRADING' })));
  };

  return { books, toggleHalt, haltAll, resumeAll };
}
