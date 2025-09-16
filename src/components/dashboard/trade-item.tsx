import React, { useState } from 'react';
import { Trade, Creature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trash2, Minus, Target, Pencil, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '../ui/input';

interface PairEditorProps {
  trade: Trade;
  onUpdate: (id: string, updatedData: Partial<Trade>) => void;
}

const PairEditor: React.FC<PairEditorProps> = ({ trade, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [pair, setPair] = useState(trade.pair);

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(trade.id, { pair: pair.toUpperCase() });
        setIsEditing(false);
    };

    const handleInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Input 
                    value={pair} 
                    onChange={e => setPair(e.target.value)} 
                    className="h-8 text-sm"
                    onClick={handleInputClick}
                />
                <Button onClick={handleSave} size="icon" className="h-8 w-8">
                    <Save className="h-4 w-4"/>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 group cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsEditing(true);}}>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:underline flex items-center gap-2">
                {trade.pair}
            </p>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};


interface TradeItemProps {
  trade: Trade;
  creatures: Creature[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Trade>) => void;
  onSelect: (trade: Trade) => void;
  formatCurrency: (value: number) => string;
}

const TradeItem: React.FC<TradeItemProps> = ({ trade, creatures, onDelete, onUpdate, onSelect, formatCurrency }) => {
  const isWin = trade.status === 'win';
  const isLoss = trade.status === 'loss';
  
  let statusText = '';
  let statusColor = '';
  let iconBgColor = '';
  let profitColor = '';
  let icon = <TrendingUp className={`h-5 w-5`} />;

  if (isWin) {
    statusText = 'GANADORA';
    statusColor = 'text-green-600 dark:text-green-400';
    iconBgColor = 'bg-green-100 dark:bg-green-900/30';
    profitColor = 'text-green-600 dark:text-green-400';
    icon = <TrendingUp className={`h-5 w-5 ${statusColor}`} />;
  } else if (isLoss) {
    statusText = 'PERDEDORA';
    statusColor = 'text-red-600 dark:text-red-400';
    iconBgColor = 'bg-red-100 dark:bg-red-900/30';
    profitColor = 'text-red-600 dark:text-red-400';
    icon = <TrendingUp className={`h-5 w-5 ${statusColor} rotate-180`} />;
  } else {
    statusText = 'EMPATE/DOJI';
    statusColor = 'text-gray-600 dark:text-gray-400';
    iconBgColor = 'bg-gray-100 dark:bg-gray-700/30';
    profitColor = 'text-gray-600 dark:text-gray-400';
    icon = <Minus className={`h-5 w-5 ${statusColor}`} />;
  }

  const huntedCreature = trade.creatureId ? creatures.find(c => c.id === trade.creatureId) : null;
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <div 
        className="flex items-center space-x-4 flex-1 min-w-0"
        onClick={() => onSelect(trade)}
      >
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          {icon}
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
          
          <div onClick={(e) => e.stopPropagation()}>
            <PairEditor trade={trade} onUpdate={onUpdate} />
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
            <span>{format(new Date(trade.date), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
            {huntedCreature && (
                <>
                <span>•</span>
                <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                    <Target className="h-3 w-3" />
                    {huntedCreature.name}
                </span>
                </>
            )}
            {trade.pips != null && <><span>•</span><span>{trade.pips > 0 ? '+' : ''}{trade.pips} pips</span></>}
            {trade.lotSize != null && <><span>•</span><span>Lote: {trade.lotSize}</span></>}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <div className="text-right cursor-pointer" onClick={() => onSelect(trade)} >
          <span className={`text-lg font-bold ${profitColor}`}>{isWin ? '+' : ''}{formatCurrency(trade.profit)}</span>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors h-8 w-8" onClick={(e) => {e.stopPropagation(); onDelete(trade.id)}} title="Eliminar operación">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TradeItem;
