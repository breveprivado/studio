import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/types';
import TradeItem from './trade-item';

interface RecentTradesProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  formatCurrency: (value: number) => string;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ trades, onDeleteTrade, formatCurrency }) => {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <CardHeader className="p-0 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Operaciones Recientes</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {trades.map(trade => (
            <TradeItem key={trade.id} trade={trade} onDelete={onDeleteTrade} formatCurrency={formatCurrency} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTrades;
