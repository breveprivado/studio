import React from 'react';
import { Withdrawal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DateEditor from './date-editor';

interface WithdrawalItemProps {
  withdrawal: Withdrawal;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Withdrawal>) => void;
  formatCurrency: (value: number) => string;
}

const WithdrawalItem: React.FC<WithdrawalItemProps> = ({ withdrawal, onDelete, onUpdate, formatCurrency }) => {
  
  const handleDateUpdate = (newDate: Date) => {
    const originalDate = new Date(withdrawal.date);
    // Preserve seconds and milliseconds from original date
    newDate.setSeconds(originalDate.getSeconds(), originalDate.getMilliseconds());
    onUpdate(withdrawal.id, { date: newDate.toISOString() });
  };
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group bg-red-50/50 dark:bg-red-900/10">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
          <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">RETIRO</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {withdrawal.notes || 'Retiro de fondos'}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <DateEditor date={withdrawal.date} onUpdate={handleDateUpdate} />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <div className="text-right">
          <span className="text-lg font-bold text-red-600 dark:text-red-400">-{formatCurrency(withdrawal.amount)}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(withdrawal.id); }} title="Eliminar retiro">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalItem;
