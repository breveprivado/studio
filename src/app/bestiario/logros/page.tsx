"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Award, BookHeart, ShieldCheck, Star } from 'lucide-react';
import { type Creature } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const achievementTiers = [1, 5, 10, 25, 50, 100];
const XP_PER_ACHIEVEMENT = 250;

const AchievementsPage = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [isClient, setIsClient] = useState(false);

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

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Award className="h-8 w-8 mr-3 text-amber-500" />
              Salón de los Héroes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu progreso cazando las bestias del mercado.</p>
          </div>
          <Link href="/bestiario">
            <Button variant="outline">
              <BookHeart className="h-4 w-4 mr-2" />
              Volver al Bestiario
            </Button>
          </Link>
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
                    <CardTitle>{creature.name}</CardTitle>
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
    </div>
  );
};

export default AchievementsPage;
