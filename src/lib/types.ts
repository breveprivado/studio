export type TradeStatus = 'win' | 'loss';
export type Emotion = 'happy' | 'neutral' | 'sad';

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
  emotion?: Emotion;
  discipline?: number;
}

export type TimeRange = 'daily' | 'monthly' | 'anual';
