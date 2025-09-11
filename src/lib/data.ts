import { Trade } from '@/lib/types';

export const initialTrades: Trade[] = [
  { id: '1', pair: 'EUR/GBP Short', status: 'win', pips: 44, lotSize: 0.1, profit: 220, date: '2024-03-27T10:00:00Z', strategy: '3G', strategyColor: 'rgb(4, 120, 87)', notes: 'Buena entrada siguiendo la tendencia principal.' },
  { id: '2', pair: 'USD/JPY Long', status: 'win', pips: 32, lotSize: 0.1, profit: 160, date: '2024-03-26T10:00:00Z', strategy: '1G', strategyColor: 'rgb(16, 185, 129)', notes: 'Confirmación con patrón de velas.' },
  { id: '3', pair: 'GBP/CHF Short', status: 'loss', pips: -19, lotSize: 0.05, profit: -95, date: '2024-03-25T10:00:00Z', strategy: '2C', strategyColor: 'rgb(29, 78, 216)', notes: 'Entrada precipitada, el mercado se giró.' },
  { id: '4', pair: 'EUR/USD Long', status: 'win', pips: 42, lotSize: 0.2, profit: 280, date: '2024-03-24T10:00:00Z', strategy: '5G', strategyColor: 'rgb(6, 78, 59)' },
  { id: '5', pair: 'USD/CAD Short', status: 'loss', pips: -15, lotSize: 0.05, profit: -75, date: '2024-03-09T10:00:00Z', strategy: '1C', strategyColor: 'rgb(59, 130, 246)' },
  { id: '6', pair: 'AUD/JPY Long', status: 'win', pips: 38, lotSize: 0.1, profit: 190, date: '2024-03-06T10:00:00Z', strategy: '4G', strategyColor: 'rgb(6, 95, 70)', notes: 'Operación a favor de la tendencia semanal.' },
  { id: '7', pair: 'GBP/USD Long', status: 'loss', pips: -22, lotSize: 0.1, profit: -110, date: '2024-03-03T10:00:00Z', strategy: '3C', strategyColor: 'rgb(220, 38, 38)' },
  { id: '8', pair: 'EUR/JPY Short', status: 'win', pips: 28, lotSize: 0.1, profit: 140, date: '2024-02-29T10:00:00Z', strategy: '2C', strategyColor: 'rgb(29, 78, 216)' },
  { id: '9', pair: 'USD/CHF Long', status: 'win', pips: 50, lotSize: 0.2, profit: 320, date: '2024-02-11T10:00:00Z', strategy: '1G', strategyColor: 'rgb(16, 185, 129)' },
  { id: '10', pair: 'GBP/JPY Short', status: 'loss', pips: -12, lotSize: 0.05, profit: -60, date: '2024-02-07T10:00:00Z', strategy: '4C', strategyColor: 'rgb(30, 58, 138)', notes: 'Stop loss ajustado demasiado pronto.' }
];
