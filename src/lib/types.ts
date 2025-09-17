

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
  creatureId?: string;
  isPrideTrade?: boolean;
  isWorstTrade?: boolean;
  imageUrl?: string | null;
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
  status?: 'win' | 'loss';
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  encounters: Encounter[];
}

export interface PlayerStats {
    startDate: string;
    class?: 'Invocador' | 'Arquero' | 'Espadachín' | 'Nigromante' | undefined;
    xp: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  rating: number;
  ratingComment: string;
  imageUrl?: string | null;
}

export interface DailyHealth {
    lives: number;
    date: string;
}

export interface TournamentPost {
  id: string;
  date: string;
  text: string;
  imageUrl: string | null;
  chatHistory?: { role: 'user' | 'model'; content: string }[];
}
    
