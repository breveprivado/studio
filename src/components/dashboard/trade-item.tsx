import React from 'react';
import { Trade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TradeItemProps {
  trade: Trade;
  onDelete: (id: string) => void;
  onSelect: (trade: Trade) => void;
  formatCurrency: (value: number) => string;
}

const TradeItem: React.FC<TradeItemProps> = ({ trade, onDelete, onSelect, formatCurrency }) => {
  const isWin = trade.status === 'win';
  const statusText = isWin ? 'GANADORA' : 'PERDEDORA';
  const statusColor = isWin ? 'text-green-600' : 'text-red-600';
  const iconBgColor = isWin ? 'bg-green-50' : 'bg-red-50';
  const profitColor = isWin ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
      <div 
        className="flex items-center space-x-4 flex-1 min-w-0 cursor-pointer"
        onClick={() => onSelect(trade)}
      >
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          <TrendingUp className={`h-5 w-5 ${statusColor} ${!isWin && 'rotate-180'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
            {trade.strategy && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: trade.strategyColor || 'gray' }}>
                {trade.strategy}
              </span>
            )}
            <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate group-hover:underline">{trade.pair}</p>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1 flex-wrap">
            <span>{format(new Date(trade.date), 'dd MMM yyyy', { locale: es })}</span>
            {trade.pips && <><span>•</span><span>{trade.pips > 0 ? '+' : ''}{trade.pips} pips</span></>}
            {trade.lotSize && <><span>•</span><span>Lote: {trade.lotSize}</span></>}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <div className="text-right" onClick={() => onSelect(trade)} >
          <span className={`text-lg font-bold ${profitColor}`}>{isWin ? '+' : ''}{formatCurrency(Math.abs(trade.profit))}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 transition-colors h-8 w-8" onClick={(e) => {e.stopPropagation(); onDelete(trade.id)}} title="Eliminar operación">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TradeItem;
