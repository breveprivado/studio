
"use client";

import React, { useState, useEffect } from 'react';
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
import { PlayerStats } from '@/lib/types';
import Image from 'next/image';


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

const PersonajeIconMap: { [key: string]: React.ElementType } = {
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
}

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ lives, onReset, onAddLife, onRemoveLife, playerClass }) => {
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

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                {tradingSpells.map((spell, index) => {
                    const Icon = TradingIconMap[spell.id] || defaultTradingIcons[index % defaultTradingIcons.length] || ShieldQuestion;
                    return (
                        <Dialog key={spell.id}>
                            <DialogTrigger asChild>
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-primary/20 hover:bg-primary/20 cursor-pointer">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                            </DialogTrigger>
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
                 <div className="flex items-center justify-center gap-2 flex-wrap">
                {personajeSpells.map((spell, index) => {
                    const Icon = PersonajeIconMap[spell.id] || defaultPersonajeIcons[index % defaultPersonajeIcons.length] || ShieldQuestion;
                    return (
                        <Dialog key={spell.id}>
                             <DialogTrigger asChild>
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/20 hover:bg-purple-500/20 cursor-pointer">
                                    <Icon className="h-6 w-6 text-purple-500" />
                                </div>
                            </DialogTrigger>
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
