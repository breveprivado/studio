export type TradeStatus = 'win' | 'loss' | 'doji';

export interface Trade {
  id: string;
  pair: string;
  status: TradeStatus;
  pips?: number;
  lotSize?: number;
  profit: number;
  date: string;
  strategy?: string;
  strategyColor?: string;
  notes?: string;
  discipline?: number;
}

export type TimeRange = 'daily' | 'monthly' | 'anual';