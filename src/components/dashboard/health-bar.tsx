
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HeartCrack, RotateCcw, Skull, Plus, Minus, Target, Anchor, ShieldOff, BrainCircuit, BookCheck, Scale, ShieldQuestion } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PlayerStats } from '@/lib/types';

interface MandatoryRule {
  id: string;
  text: string;
  description: string;
  imageUrl?: string | null;
}

const IconMap: { [key: string]: React.ElementType } = {
  't1': Target,
  't2': ShieldOff,
  't3': Scale,
  't4': BrainCircuit,
  't5': BookCheck,
  't6': BrainCircuit,
};
const defaultIcons = [Target, ShieldOff, Anchor, BrainCircuit, BookCheck, Scale];


interface PlayerStatusCardProps {
  lives: number;
  onReset: () => void;
  onAddLife: () => void;
  onRemoveLife: () => void;
  playerClass: PlayerStats['class'];
}

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ lives, onReset, onAddLife, onRemoveLife, playerClass }) => {
  const [spells, setSpells] = useState<MandatoryRule[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('mandatoryItems_trading');
    if (storedItems) {
      try {
        setSpells(JSON.parse(storedItems));
      } catch (e) {
        console.error("Failed to parse spells from localStorage", e);
      }
    }
  }, []);


  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>Estado del Personaje</span>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Restaurar Vidas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción restaurará tus 3 vidas para el día de hoy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className={cn(Button, "bg-primary hover:bg-primary/90")}>Sí, restaurar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-12 h-12 flex-shrink-0">
                    <svg viewBox="0 0 100 115.47" className="w-full h-full fill-current text-primary/20 dark:text-primary/10">
                        <path d="M50 0L95.3 28.87v57.74L50 115.47l-45.3-28.86V28.87L50 0z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Skull className="h-6 w-6 text-foreground" />
                    </div>
                </div>
                <div className="font-bold text-sm truncate">{playerClass}</div>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {spells.map((spell, index) => {
                const Icon = IconMap[spell.id] || defaultIcons[index % defaultIcons.length] || ShieldQuestion;
                return (
                  <TooltipProvider key={spell.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary/20 hover:bg-primary/20 cursor-pointer">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{spell.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <div className="overflow-x-auto flex-1 md:flex-none">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: lives }).map((_, i) => (
                            <Heart key={i} className="h-5 w-5 text-red-500 fill-red-500 flex-shrink-0" />
                        ))}
                        {lives === 0 && <span className="text-xs text-muted-foreground">Sin vidas</span>}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" onClick={onAddLife} className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onRemoveLife} disabled={lives <= 0} className="h-6 w-6">
                        <Minus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatusCard;
