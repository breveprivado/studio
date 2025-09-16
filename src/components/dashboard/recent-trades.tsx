import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade, Withdrawal, Activity, BalanceAddition, Creature } from '@/lib/types';
import TradeItem from './trade-item';
import WithdrawalItem from './withdrawal-item';
import BalanceItem from './balance-item';

interface RecentTradesProps {
  activities: Activity[];
  creatures: Creature[];
  onDeleteTrade: (id: string) => void;
  onUpdateTrade: (id: string, updatedData: Partial<Trade>) => void;
  onDeleteWithdrawal: (id: string) => void;
  onUpdateWithdrawal: (id: string, updatedData: Partial<Withdrawal>) => void;
  onDeleteBalance: (id: string) => void;
  onUpdateBalance: (id: string, updatedData: Partial<BalanceAddition>) => void;
  onSelectTrade: (trade: Trade) => void;
  formatCurrency: (value: number) => string;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ 
    activities, 
    creatures, 
    onDeleteTrade, 
    onUpdateTrade, 
    onDeleteWithdrawal,
    onUpdateWithdrawal,
    onDeleteBalance, 
    onUpdateBalance,
    onSelectTrade, 
    formatCurrency 
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <CardHeader className="p-0 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de Actividad</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {activities.length === 0 ? (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
               <p>Aún no has registrado ninguna actividad.</p>
               <p className="text-sm mt-1">Usa los botones de acción para empezar.</p>
             </div>
          ) : (
            activities.map(activity => {
              if (activity.type === 'trade') {
                return <TradeItem key={`trade-${activity.id}`} trade={activity} creatures={creatures} onDelete={onDeleteTrade} onUpdate={onUpdateTrade} onSelect={onSelectTrade} formatCurrency={formatCurrency} />
              } else if (activity.type === 'withdrawal') {
                return <WithdrawalItem key={`withdrawal-${activity.id}`} withdrawal={activity} onDelete={onDeleteWithdrawal} onUpdate={onUpdateWithdrawal} formatCurrency={formatCurrency} />
              } else {
                 return <BalanceItem key={`balance-${activity.id}`} balance={activity} onDelete={onDeleteBalance} onUpdate={onUpdateBalance} formatCurrency={formatCurrency} />
              }
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTrades;

    
