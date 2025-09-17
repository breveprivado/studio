
import React, { useState } from 'react';
import { Trade, Creature } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trash2, Minus, Target, Pencil, Save, Trophy, Skull } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '../ui/input';
import DateEditor from './date-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface ProfitEditorProps {
    trade: Trade;
    onUpdate: (id: string, updatedData: Partial<Trade>) => void;
    formatCurrency: (value: number) => string;
    profitColor: string;
}

const ProfitEditor: React.FC<ProfitEditorProps> = ({ trade, onUpdate, formatCurrency, profitColor }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profit, setProfit] = useState(Math.abs(trade.profit));

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newProfit = trade.status === 'loss' ? -Math.abs(profit) : Math.abs(profit);
        onUpdate(trade.id, { profit: newProfit });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
             <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                    type="number"
                    step="0.01"
                    value={profit}
                    onChange={(e) => setProfit(parseFloat(e.target.value))}
                    className="h-8 text-sm w-24"
                />
                <Button onClick={handleSave} size="icon" className="h-8 w-8">
                    <Save className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="text-right cursor-pointer" onClick={(e) => {e.stopPropagation(); setIsEditing(true);}}>
          <span className={`text-lg font-bold ${profitColor}`}>{trade.status === 'win' ? '+' : ''}{formatCurrency(trade.profit)}</span>
        </div>
    );
}

interface CreatureEditorProps {
    trade: Trade;
    creatures: Creature[];
    onUpdate: (id: string, updatedData: Partial<Trade>) => void;
}

const CreatureEditor: React.FC<CreatureEditorProps> = ({ trade, creatures, onUpdate }) => {
    const huntedCreature = trade.creatureId ? creatures.find(c => c.id === trade.creatureId) : null;

    const handleSelect = (creatureId: string) => {
        onUpdate(trade.id, { creatureId: creatureId === 'none' ? undefined : creatureId });
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Select onValueChange={handleSelect} defaultValue={trade.creatureId || 'none'}>
                <SelectTrigger className="h-auto w-auto text-xs p-1 border-0 bg-transparent text-purple-600 dark:text-purple-400 focus:ring-0 focus:ring-offset-0">
                     <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <SelectValue>
                           {huntedCreature ? huntedCreature.name : 'Asignar Bestia'}
                        </SelectValue>
                     </span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {creatures.sort((a,b) => parseInt(a.id) - parseInt(b.id)).map(creature => (
                        <SelectItem key={creature.id} value={creature.id}>
                            {creature.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
  
  const handleDateUpdate = (newDate: Date) => {
    const originalDate = new Date(trade.date);
    // Preserve seconds and milliseconds from original date
    newDate.setSeconds(originalDate.getSeconds(), originalDate.getMilliseconds());
    onUpdate(trade.id, { date: newDate.toISOString() });
  };
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <div 
        className="flex items-center space-x-4 flex-1 min-w-0 cursor-pointer"
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
            <DateEditor date={trade.date} onUpdate={handleDateUpdate} />
             {trade.isPrideTrade && (
                <>
                <span>•</span>
                <Trophy className="h-4 w-4 text-amber-500" />
                </>
            )}
            {trade.isWorstTrade && (
                <>
                <span>•</span>
                <Skull className="h-4 w-4 text-destructive" />
                </>
            )}
            <CreatureEditor trade={trade} creatures={creatures} onUpdate={onUpdate} />
            {trade.expirationTime && <><span>•</span><span>Exp: {trade.expirationTime}</span></>}
            {trade.pips != null && <><span>•</span><span>{trade.pips > 0 ? '+' : ''}{trade.pips} pips</span></>}
            {trade.lotSize != null && <><span>•</span><span>Lote: {trade.lotSize}</span></>}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <ProfitEditor trade={trade} onUpdate={onUpdate} formatCurrency={formatCurrency} profitColor={profitColor} />
        <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors h-8 w-8" onClick={(e) => {e.stopPropagation(); onDelete(trade.id)}} title="Eliminar operación">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TradeItem;

    