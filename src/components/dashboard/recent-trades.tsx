import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/types';
import TradeItem from './trade-item';

interface RecentTradesProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  onSelectTrade: (trade: Trade) => void;
  formatCurrency: (value: number) => string;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ trades, onDeleteTrade, onSelectTrade, formatCurrency }) => {
  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <CardHeader className="p-0 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Operaciones Recientes</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {trades.length === 0 ? (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
               <p>Aún no has registrado ninguna operación.</p>
               <p className="text-sm mt-1">Usa el botón "Nueva Operación" para empezar.</p>
             </div>
          ) : (
            trades.map(trade => (
              <TradeItem key={trade.id} trade={trade} onDelete={onDeleteTrade} onSelect={onSelectTrade} formatCurrency={formatCurrency} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTrades;