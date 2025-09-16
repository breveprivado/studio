import React from 'react';
import { BalanceAddition } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DateEditor from './date-editor';

interface BalanceItemProps {
  balance: BalanceAddition;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<BalanceAddition>) => void;
  formatCurrency: (value: number) => string;
}

const BalanceItem: React.FC<BalanceItemProps> = ({ balance, onDelete, onUpdate, formatCurrency }) => {
  
  const handleDateUpdate = (newDate: Date) => {
    const originalDate = new Date(balance.date);
    // Preserve seconds and milliseconds from original date
    newDate.setSeconds(originalDate.getSeconds(), originalDate.getMilliseconds());
    onUpdate(balance.id, { date: newDate.toISOString() });
  };
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group bg-green-50/50 dark:bg-green-900/10">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
          <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">DEPÓSITO</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {balance.notes || 'Depósito de fondos'}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
             <DateEditor date={balance.date} onUpdate={handleDateUpdate} />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <div className="text-right">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">+{formatCurrency(balance.amount)}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(balance.id); }} title="Eliminar depósito">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BalanceItem;
