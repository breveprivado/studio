"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Award, BookHeart, ShieldCheck, Star, RotateCcw } from 'lucide-react';
import { type Creature } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from '@/components/ui/sidebar';

const achievementTiers = [1, 5, 10, 25, 50, 100];
const XP_PER_ACHIEVEMENT = 250;

const AchievementsPage = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    if (storedCreatures) {
      setCreatures(JSON.parse(storedCreatures));
    }
  }, []);

  const totalPossibleAchievements = creatures.length * achievementTiers.length;
  
  const achievementsProgress = useMemo(() => {
    if (!isClient) return { unlocked: 0, total: totalPossibleAchievements, percentage: 0 };
    
    let unlockedCount = 0;
    creatures.forEach(creature => {
      const encounters = creature.encounters.length;
      achievementTiers.forEach(tier => {
        if (encounters >= tier) {
          unlockedCount++;
        }
      });
    });

    return {
      unlocked: unlockedCount,
      total: totalPossibleAchievements,
      percentage: totalPossibleAchievements > 0 ? (unlockedCount / totalPossibleAchievements) * 100 : 0
    };
  }, [creatures, isClient, totalPossibleAchievements]);

  const handleResetAchievements = () => {
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    if (storedCreatures) {
        let currentCreatures: Creature[] = JSON.parse(storedCreatures);
        const resetCreatures = currentCreatures.map(c => ({ ...c, encounters: [] }));
        
        setCreatures(resetCreatures);
        localStorage.setItem('bestiaryCreatures', JSON.stringify(resetCreatures));
        
        window.dispatchEvent(new StorageEvent('storage', { key: 'bestiaryCreatures' }));
        
        toast({
            title: "Salón de Héroes Reiniciado",
            description: "El progreso de caza de todas las bestias ha sido restablecido a cero.",
        });
    }
  };

  const handleResetSingleCreature = (creatureId: string) => {
    const updatedCreatures = creatures.map(c => 
        c.id === creatureId ? { ...c, encounters: [] } : c
    );
    setCreatures(updatedCreatures);
    localStorage.setItem('bestiaryCreatures', JSON.stringify(updatedCreatures));
    window.dispatchEvent(new StorageEvent('storage', { key: 'bestiaryCreatures' }));
    toast({
        title: "Bestia Reiniciada",
        description: `El progreso de caza para esta bestia ha sido restablecido.`,
    });
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Award className="h-8 w-8 mr-3 text-amber-500" />
              Salón de los Héroes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu progreso cazando las bestias del mercado.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar Logros
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro de reiniciar el Salón de Héroes?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción restablecerá a cero los contadores de encuentros para todas las bestias. Perderás el progreso de los logros de caza, pero no tu XP, nivel o nombres de bestias personalizados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAchievements} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Sí, reiniciar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <Card className="mb-8">
          <CardHeader>
              <CardTitle>Progreso Total de Logros</CardTitle>
              <CardDescription>Has completado {achievementsProgress.unlocked} de {achievementsProgress.total} hitos de cazador.</CardDescription>
          </CardHeader>
          <CardContent>
              <Progress value={achievementsProgress.percentage} className="w-full" />
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatures.map(creature => {
          const encounters = creature.encounters.length;
          
          return (
            <Card 
              key={creature.id}
              className="bg-white dark:bg-neutral-900"
            >
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{creature.name}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Reiniciar progreso de {creature.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Esta acción restablecerá los encuentros para esta bestia a cero.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleResetSingleCreature(creature.id)} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Sí, reiniciar</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardDescription>Has cazado a esta bestia {encounters} {encounters === 1 ? 'vez' : 'veces'}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievementTiers.map(tier => {
                  const isUnlocked = encounters >= tier;
                  const prevTier = achievementTiers[achievementTiers.indexOf(tier) - 1] || 0;
                  const progressInTier = Math.max(0, encounters - prevTier);
                  const neededForTier = tier - prevTier;
                  const tierProgress = (progressInTier / neededForTier) * 100;

                  return(
                    <div key={tier}>
                      <div className="flex items-center gap-3">
                          <ShieldCheck className={cn("h-6 w-6 flex-shrink-0", isUnlocked ? "text-amber-500" : "text-gray-400 dark:text-gray-600")} />
                          <div className="flex-1">
                              <div className="flex justify-between items-center">
                              <p className={cn("font-medium", isUnlocked ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
                                Caza {tier} {creature.name}{tier > 1 ? 's' : ''}
                              </p>
                              <div className={cn("flex items-center gap-1 text-xs font-semibold", isUnlocked ? "text-amber-500" : "text-gray-400 dark:text-gray-500")}>
                                  <Star className="h-3 w-3" />
                                  <span>+{XP_PER_ACHIEVEMENT} XP</span>
                              </div>
                              </div>
                              <Progress value={isUnlocked ? 100 : tierProgress} className="h-2 mt-1" />
                          </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default AchievementsPage;
