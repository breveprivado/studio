import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade, Withdrawal, Activity } from '@/lib/types';
import TradeItem from './trade-item';
import WithdrawalItem from './withdrawal-item';

interface RecentTradesProps {
  activities: Activity[];
  onDeleteTrade: (id: string) => void;
  onDeleteWithdrawal: (id: string) => void;
  onSelectTrade: (trade: Trade) => void;
  formatCurrency: (value: number) => string;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ activities, onDeleteTrade, onDeleteWithdrawal, onSelectTrade, formatCurrency }) => {
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
               <p className="text-sm mt-1">Usa el botón "Nueva Operación" o "Registrar Retiro" para empezar.</p>
             </div>
          ) : (
            activities.map(activity => {
              if (activity.type === 'trade') {
                return <TradeItem key={activity.id} trade={activity} onDelete={onDeleteTrade} onSelect={onSelectTrade} formatCurrency={formatCurrency} />
              } else {
                return <WithdrawalItem key={activity.id} withdrawal={activity} onDelete={onDeleteWithdrawal} formatCurrency={formatCurrency} />
              }
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTrades;
