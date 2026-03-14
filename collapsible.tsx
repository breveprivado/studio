import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade, Withdrawal, Activity, BalanceAddition, Creature, Adjustment } from '@/lib/types';
import TradeItem from './trade-item';
import WithdrawalItem from './withdrawal-item';
import BalanceItem from './balance-item';
import AdjustmentItem from './adjustment-item';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RecentTradesProps {
  activities: Activity[];
  creatures: Creature[];
  onDeleteTrade: (id: string) => void;
  onUpdateTrade: (id: string, updatedData: Partial<Trade>) => void;
  onDeleteWithdrawal: (id: string) => void;
  onUpdateWithdrawal: (id: string, updatedData: Partial<Withdrawal>) => void;
  onDeleteBalance: (id: string) => void;
  onUpdateBalance: (id: string, updatedData: Partial<BalanceAddition>) => void;
  onDeleteAdjustment: (id: string) => void;
  onUpdateAdjustment: (id: string, updatedData: Partial<Adjustment>) => void;
  onSelectTrade: (trade: Trade) => void;
  formatCurrency: (value: number) => string;
  selectedTrades: string[];
  onToggleSelection: (id: string) => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
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
    onDeleteAdjustment,
    onUpdateAdjustment,
    onSelectTrade, 
    formatCurrency,
    selectedTrades,
    onToggleSelection,
    onDeleteSelected,
    onSelectAll,
    onDeselectAll,
}) => {
  const tradeCount = activities.filter(a => a.type === 'trade').length;
  const allTradesSelected = selectedTrades.length > 0 && selectedTrades.length === tradeCount;

  return (
    <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <CardHeader className="p-0 mb-4 flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de Actividad</h3>
        <div className="flex items-center gap-2">
            {selectedTrades.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar ({selectedTrades.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar {selectedTrades.length} operación(es). Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteSelected} className="bg-destructive hover:bg-destructive/90">
                            Sí, eliminar
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
             {tradeCount > 0 && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={allTradesSelected ? onDeselectAll : onSelectAll}
                >
                    {allTradesSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </Button>
             )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
          {activities.length === 0 ? (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
               <p>Aún no has registrado ninguna actividad.</p>
               <p className="text-sm mt-1">Usa los botones de acción para empezar.</p>
             </div>
          ) : (
            activities.map(activity => {
              switch (activity.type) {
                case 'trade':
                  return <TradeItem 
                            key={`trade-${activity.id}`} 
                            trade={activity as Trade} 
                            creatures={creatures} 
                            onDelete={onDeleteTrade} 
                            onUpdate={onUpdateTrade} 
                            onSelect={onSelectTrade} 
                            formatCurrency={formatCurrency}
                            isSelected={selectedTrades.includes(activity.id)}
                            onToggleSelection={onToggleSelection}
                          />
                case 'withdrawal':
                  return <WithdrawalItem key={`withdrawal-${activity.id}`} withdrawal={activity as Withdrawal} onDelete={onDeleteWithdrawal} onUpdate={onUpdateWithdrawal} formatCurrency={formatCurrency} />
                case 'balance':
                  return <BalanceItem key={`balance-${activity.id}`} balance={activity as BalanceAddition} onDelete={onDeleteBalance} onUpdate={onUpdateBalance} formatCurrency={formatCurrency} />
                case 'adjustment':
                  return <AdjustmentItem key={`adjustment-${activity.id}`} adjustment={activity as Adjustment} onDelete={onDeleteAdjustment} onUpdate={onUpdateAdjustment} formatCurrency={formatCurrency} />
                default:
                  return null;
              }
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTrades;
