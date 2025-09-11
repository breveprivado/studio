export type TradeStatus = 'win' | 'loss';

export interface Trade {
  id: string;
  pair: string;
  status: TradeStatus;
  pips: number;
  lotSize: number;
  profit: number;
  date: string;
  strategy?: string;
  strategyColor?: string;
}

export type TimeRange = 'daily' | 'monthly' | 'anual';
