
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HeartCrack, RotateCcw, Skull, Plus, Minus, Target, Anchor, ShieldOff, BrainCircuit, BookCheck, Scale, ShieldQuestion, Zap, BookUp, Hourglass, HeartPulse, Mountain } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PlayerStats, Trade } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '../ui/badge';


interface MandatoryRule {
  id: string;
  text: string;
  description: string;
  imageUrl?: string | null;
}

const TradingIconMap: { [key: string]: React.ElementType } = {
  't1': Target,
  't2': ShieldOff,
  't3': Scale,
  't4': BrainCircuit,
  't5': BookCheck,
  't6': BrainCircuit,
};

const PersonajeIconMap: {  [key: string]: React.ElementType } = {
    'p1': Zap,
    'p2': BookUp,
    'p3': Hourglass,
    'p4': HeartPulse,
    'p5': Mountain,
};

const defaultTradingIcons = [Target, ShieldOff, Anchor, BrainCircuit, BookCheck, Scale];
const defaultPersonajeIcons = [Zap, BookUp, Hourglass, HeartPulse, Mountain, ShieldQuestion];


interface PlayerStatusCardProps {
  lives: number;
  onReset: () => void;
  onAddLife: () => void;
  onRemoveLife: () => void;
  playerClass: PlayerStats['class'];
  trades: Trade[];
}

const MAX_LIVES = 3;

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ lives, onReset, onAddLife, onRemoveLife, playerClass, trades }) => {
  const [tradingSpells, setTradingSpells] = useState<MandatoryRule[]>([]);
  const [personajeSpells, setPersonajeSpells] = useState<MandatoryRule[]>([]);

  useEffect(() => {
    const storedTradingItems = localStorage.getItem('mandatoryItems_trading');
    if (storedTradingItems) {
      try {
        setTradingSpells(JSON.parse(storedTradingItems));
      } catch (e) {
        console.error("Failed to parse trading spells from localStorage", e);
      }
    }
    const storedPersonajeItems = localStorage.getItem('mandatoryItems_personaje');
    if (storedPersonajeItems) {
      try {
        setPersonajeSpells(JSON.parse(storedPersonajeItems));
      } catch (e) {
        console.error("Failed to parse personaje spells from localStorage", e);
      }
    }
  }, []);

  const poisonedHearts = useMemo(() => {
    const lossesByPair: { [key: string]: number } = {};
    trades.forEach(trade => {
        if (trade.status === 'loss') {
            lossesByPair[trade.pair] = (lossesByPair[trade.pair] || 0) + 1;
        }
    });
    return Object.entries(lossesByPair)
        .map(([pair, count]) => ({ pair, count }))
        .sort((a,b) => b.count - a.count);
  }, [trades]);


  return (
    <Card className="bg-gradient-to-br from-card to-background border-2 border-border/40">
      <CardHeader className="p-4 pb-2 text-center">
        <CardTitle className="text-lg font-semibold text-foreground">
          Estado del Personaje
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">

                {/* Trading Spells */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {tradingSpells.map((spell, index) => {
                        const Icon = TradingIconMap[spell.id] || defaultTradingIcons[index % defaultTradingIcons.length] || ShieldQuestion;
                        return (
                             <Dialog key={`trading-${spell.id}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary/20 hover:bg-primary/20 hover:shadow-md hover:shadow-primary/30 hover:scale-110 transition-all cursor-pointer">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{spell.text}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{spell.text}</DialogTitle>
                                        <DialogDescription>{spell.description}</DialogDescription>
                                    </DialogHeader>
                                    {spell.imageUrl && (
                                        <div className="py-4">
                                            <Image src={spell.imageUrl} alt={`Imagen de ${spell.text}`} width={400} height={200} className="rounded-lg object-cover w-full" />
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cerrar</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )
                    })}
                </div>

                {/* Character Info & Health */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-16 h-[74px] flex-shrink-0">
                        <svg viewBox="0 0 100 115.47" className="w-full h-full fill-current text-primary/20 dark:text-primary/10 drop-shadow-lg">
                            <path d="M50 0L95.3 28.87v57.74L50 115.47l-45.3-28.86V28.87L50 0z" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Skull className="h-8 w-8 text-foreground" />
                        </div>
                    </div>
                    <div className="font-bold text-lg truncate">{playerClass}</div>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: MAX_LIVES }).map((_, i) => {
                            const isAlive = i < lives;
                            if (isAlive) {
                                return (
                                    <Tooltip key={`life-${i}`}>
                                        <TooltipTrigger>
                                            <Heart className="h-6 w-6 text-red-500 fill-red-500 flex-shrink-0 animate-pulse-slow" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Vida activa</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }
                            return (
                                <Tooltip key={`lost-life-${i}`}>
                                    <TooltipTrigger>
                                        <Heart className="h-6 w-6 text-red-500/50 flex-shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Vida perdida</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                        {lives === 0 && <span className="text-sm text-muted-foreground">Sin vidas</span>}
                    </div>

                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onAddLife} className="h-6 w-6">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
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
                        <Button variant="ghost" size="icon" onClick={onRemoveLife} disabled={lives <= 0} className="h-6 w-6">
                            <Minus className="h-4 w-4" />
                        </Button>
                    </div>

                    {poisonedHearts.length > 0 && (
                        <div className="border-t-2 border-dashed border-destructive/50 w-full my-3 pt-3 flex flex-col items-center gap-3">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <h4 className="text-sm font-semibold text-destructive cursor-help">Corazones Envenenados</h4>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Cada corazón representa una pérdida en un par de divisas.</p>
                                </TooltipContent>
                            </Tooltip>
                            <div className="w-full space-y-2">
                                {poisonedHearts.map(({ pair, count }) => (
                                    <div key={pair} className="flex flex-col items-center">
                                        <div className="text-xs font-bold text-destructive/80 mb-1">{pair}</div>
                                        <div className="flex flex-wrap justify-center gap-1">
                                        {Array.from({ length: count }).map((_, i) => (
                                            <Tooltip key={i}>
                                                <TooltipTrigger>
                                                    <HeartCrack className="h-4 w-4 text-green-500 fill-green-500/30 animate-pulse" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Pérdida en {pair}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Personaje Spells */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {personajeSpells.map((spell, index) => {
                        const Icon = PersonajeIconMap[spell.id] || defaultPersonajeIcons[index % defaultPersonajeIcons.length] || ShieldQuestion;
                        return (
                            <Dialog key={`personaje-${spell.id}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/20 hover:bg-purple-500/20 hover:shadow-md hover:shadow-purple-500/30 hover:scale-110 transition-all cursor-pointer">
                                                <Icon className="h-6 w-6 text-purple-500" />
                                            </div>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                     <TooltipContent>
                                        <p>{spell.text}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{spell.text}</DialogTitle>
                                        <DialogDescription>{spell.description}</DialogDescription>
                                    </DialogHeader>
                                    {spell.imageUrl && (
                                        <div className="py-4">
                                            <Image src={spell.imageUrl} alt={`Imagen de ${spell.text}`} width={400} height={200} className="rounded-lg object-cover w-full" />
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cerrar</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )
                    })}
                </div>

            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default PlayerStatusCard;

    