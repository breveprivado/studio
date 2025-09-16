
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Trade, Emotion } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Smile, Meh, Frown, Star } from 'lucide-react';
import Image from 'next/image';

interface TradeDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Trade | null;
  formatCurrency: (value: number) => string;
}

const EmotionIcon = ({ emotion }: { emotion?: Emotion }) => {
    switch (emotion) {
        case 'happy':
            return <Smile className="h-5 w-5 text-green-500" />;
        case 'neutral':
            return <Meh className="h-5 w-5 text-yellow-500" />;
        case 'sad':
            return <Frown className="h-5 w-5 text-red-500" />;
        default:
            return null;
    }
}


const TradeDetailDialog: React.FC<TradeDetailDialogProps> = ({ isOpen, onOpenChange, trade, formatCurrency }) => {
  if (!trade) return null;

  const isWin = trade.status === 'win';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate">{trade.pair}</DialogTitle>
          <DialogDescription>
            {format(new Date(trade.date), "eeee, dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {trade.imageUrl && (
            <div className="relative aspect-video w-full">
              <Image src={trade.imageUrl} alt={`Imagen de ${trade.pair}`} layout="fill" className="rounded-lg object-cover" />
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Resultado</span>
            <Badge variant={isWin ? "default" : "destructive"} className={cn(isWin ? 'bg-green-600' : 'bg-red-600', 'text-white')}>
              {isWin ? 'Ganancia' : 'Pérdida'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Beneficio/Pérdida</span>
            <span className={cn("font-semibold", isWin ? 'text-green-600' : 'text-red-600')}>
              {isWin ? '+' : ''}{formatCurrency(trade.profit)}
            </span>
          </div>
          {trade.pips != null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pips</span>
              <span>{trade.pips}</span>
            </div>
          )}
          {trade.lotSize != null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lote</span>
              <span>{trade.lotSize}</span>
            </div>
          )}
          {trade.strategy && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estrategia</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: trade.strategyColor || 'gray' }}>
                {trade.strategy}
              </span>
            </div>
          )}
          {trade.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notas de la Operación</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md border dark:border-gray-700">
                {trade.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailDialog;
