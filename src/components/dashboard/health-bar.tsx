
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HeartCrack, RotateCcw, Skull, Plus, Minus } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { PlayerStats } from '@/lib/types';

interface PlayerStatusCardProps {
  lives: number;
  onReset: () => void;
  onAddLife: () => void;
  onRemoveLife: () => void;
  playerClass: PlayerStats['class'];
}

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ lives, onReset, onAddLife, onRemoveLife, playerClass }) => {

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
        <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col items-center justify-center space-y-1">
                <div className="relative w-16 h-[72px] mx-auto animate-pulse-slow" style={{ animationDuration: '4s' }}>
                    <svg viewBox="0 0 100 115.47" className="w-full h-full fill-current text-primary/20 dark:text-primary/10">
                        <path d="M50 0L95.3 28.87v57.74L50 115.47l-45.3-28.86V28.87L50 0z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Skull className="h-8 w-8 text-foreground mx-auto" />
                    </div>
                </div>
                <span className="font-bold text-sm">{playerClass}</span>
            </div>

            <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-1 flex-wrap justify-center mb-2">
                    {Array.from({ length: lives }).map((_, i) => (
                        <Heart key={i} className="h-6 w-6 text-red-500 fill-red-500" />
                    ))}
                    {lives === 0 && <span className="text-sm text-muted-foreground">Sin vidas</span>}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onRemoveLife} disabled={lives <= 0} className="h-7 w-7">
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onAddLife} className="h-7 w-7">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatusCard;
