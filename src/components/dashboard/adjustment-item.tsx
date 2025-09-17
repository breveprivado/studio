
import React from 'react';
import { Adjustment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Wand } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DateEditor from './date-editor';
import { cn } from '@/lib/utils';

interface AdjustmentItemProps {
  adjustment: Adjustment;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Adjustment>) => void;
  formatCurrency: (value: number) => string;
}

const AdjustmentItem: React.FC<AdjustmentItemProps> = ({ adjustment, onDelete, onUpdate, formatCurrency }) => {
  
  const handleDateUpdate = (newDate: Date) => {
    const originalDate = new Date(adjustment.date);
    // Preserve seconds and milliseconds from original date
    newDate.setSeconds(originalDate.getSeconds(), originalDate.getMilliseconds());
    onUpdate(adjustment.id, { date: newDate.toISOString() });
  };
  
  const isPositive = adjustment.amount >= 0;
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group bg-blue-50/50 dark:bg-blue-900/10">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Wand className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">AJUSTE</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {adjustment.notes || 'Corrección de saldo'}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
             <DateEditor date={adjustment.date} onUpdate={handleDateUpdate} />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <div className="text-right">
          <span className={cn(
            "text-lg font-bold",
            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {isPositive ? '+' : ''}{formatCurrency(adjustment.amount)}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors h-8 w-8" onClick={(e) => { e.stopPropagation(); onDelete(adjustment.id); }} title="Eliminar ajuste">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdjustmentItem;
