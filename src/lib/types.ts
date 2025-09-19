







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
  expirationTime?: string;
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

export interface Adjustment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export type Activity = { type: 'trade', id: string, date: string } & Partial<Trade> | 
                       { type: 'withdrawal', id: string, date: string } & Partial<Withdrawal> | 
                       { type: 'balance', id: string, date: string } & Partial<BalanceAddition> | 
                       { type: 'adjustment', id: string, date: string } & Partial<Adjustment>;

export interface Encounter {
  id: string;
  date: string;
  status: 'win' | 'loss';
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

export interface DailyLedgerData {
  initialBalance: number;
  weeklyGainPercentage: number;
  balances: { [date: string]: number }; // Key is 'YYYY-MM-DD'
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
  chatHistory: { role: 'user' | 'model'; content: string }[];
}
    
export interface HabitTask {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  color: string;
}
    
    




