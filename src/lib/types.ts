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
  emotion?: 'happy' | 'neutral' | 'sad';
}

export type TimeRange = 'daily' | 'monthly' | 'anual';

export interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface BalanceAddition {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export type Activity = (Trade & { type: 'trade' }) | (Withdrawal & { type: 'withdrawal' }) | (BalanceAddition & { type: 'balance' });

export interface Encounter {
  id: string;
  date: string;
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  encounters: Encounter[];
}

export interface PlayerStats {
    level: number;
    xp: number;
}
