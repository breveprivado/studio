"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HeartCrack, RotateCcw } from 'lucide-react';
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

interface HealthBarProps {
  lives: number;
  onReset: () => void;
}

const HealthBar: React.FC<HealthBarProps> = ({ lives, onReset }) => {
  const totalHearts = 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Vidas del Día</span>
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
      <CardContent className="flex justify-center items-center gap-4 py-6">
        {Array.from({ length: totalHearts }).map((_, index) => {
          if (index < lives) {
            return <Heart key={index} className="h-10 w-10 text-red-500 fill-red-500 animate-pulse" style={{ animationDuration: '2s' }} />;
          }
          return <HeartCrack key={index} className="h-10 w-10 text-muted-foreground/50" />;
        })}
      </CardContent>
    </Card>
  );
};

export default HealthBar;
