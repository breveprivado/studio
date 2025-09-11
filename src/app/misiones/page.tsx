"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Star, Trophy, ShieldHalf } from 'lucide-react';
import { type Creature, type JournalEntry } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const achievementTiers = [1, 5, 10, 25, 50, 100];
const XP_PER_HUNTING_MISSION = 250;
const XP_PER_SURVIVAL_MISSION = 500;
const totalBeastMissionStars = 17 * achievementTiers.length;
const totalSurvivalMissionStars = 15;

const levelMilestones: { [key: number]: number } = {
    1: 1, 2: 7, 3: 21, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150,
    9: 180, 10: 210, 11: 240, 12: 270, 13: 300, 14: 330, 15: 365,
};


const MissionsPage = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [journalDays, setJournalDays] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    if (storedCreatures) {
      setCreatures(JSON.parse(storedCreatures));
    }
    const storedJournal = localStorage.getItem('journalEntries');
    if (storedJournal) {
        const entries: JournalEntry[] = JSON.parse(storedJournal);
        const ratedDaysCount = entries.filter((e) => e.rating > 0).length;
        setJournalDays(ratedDaysCount);
    }
  }, []);

  const beastMissionProgress = useMemo(() => {
    if (!isClient) return 0;
    let unlockedCount = 0;
    creatures.forEach(creature => {
      const encounters = creature.encounters.length;
      achievementTiers.forEach(tier => {
        if (encounters >= tier) {
          unlockedCount++;
        }
      });
    });
    return unlockedCount;
  }, [creatures, isClient]);

  const survivalMissionProgress = useMemo(() => {
    if (!isClient) return 0;
    let unlockedCount = 0;
    Object.values(levelMilestones).forEach(milestone => {
      if (journalDays >= milestone) {
        unlockedCount++;
      }
    });
    return unlockedCount;
  }, [journalDays, isClient]);
  
  const totalStars = beastMissionProgress + survivalMissionProgress;
  const totalXp = (beastMissionProgress * XP_PER_HUNTING_MISSION) + (survivalMissionProgress * XP_PER_SURVIVAL_MISSION);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Gamepad2 className="h-8 w-8 mr-3 text-purple-500" />
              Centro de Misiones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu camino para convertirte en un Trader de Leyenda.</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </header>

        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardHeader>
                <CardTitle>Progreso Total de Misiones</CardTitle>
                <CardDescription className="text-purple-200">Has conseguido un total de {totalStars} Estrellas y {totalXp.toLocaleString()} XP a través de misiones.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Star className="h-10 w-10 text-amber-400" />
                <div className="text-5xl font-bold">{totalStars}</div>
                 <div className="text-lg text-purple-200">/ {totalBeastMissionStars + totalSurvivalMissionStars} Estrellas Totales</div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Trophy className="h-6 w-6 mr-2 text-amber-500" />Misiones de Supervivencia</CardTitle>
                    <CardDescription>Sobrevive en el mercado registrando tus días en la bitácora.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="max-h-[600px] overflow-y-auto">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                <TableHead>Hito (Nivel)</TableHead>
                                <TableHead>Requisito</TableHead>
                                <TableHead className="text-right">Recompensa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(levelMilestones).map(([level, days]) => {
                                    const isCompleted = journalDays >= days;
                                    return (
                                        <TableRow key={level} className={cn(isCompleted && "bg-green-50 dark:bg-green-900/20")}>
                                            <TableCell className="font-medium">Hito {level}</TableCell>
                                            <TableCell>Sobrevive {days} día{days > 1 ? 's' : ''}</TableCell>
                                            <TableCell className="text-right">
                                                {isCompleted ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400 font-semibold">
                                                            <Star className="h-4 w-4" /> 1
                                                        </span>
                                                         <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">+{XP_PER_SURVIVAL_MISSION} XP</span>
                                                    </div>
                                                ) : (
                                                     <span className="text-muted-foreground">{journalDays}/{days}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><ShieldHalf className="h-6 w-6 mr-2 text-rose-500"/>Misiones de Caza</CardTitle>
                    <CardDescription>Enfrenta y registra las bestias que afectan tu operativa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[600px] overflow-y-auto space-y-4">
                        {creatures.map(creature => (
                            <div key={creature.id}>
                                <h4 className="font-semibold text-md mb-2">{creature.name}</h4>
                                <div className="space-y-3">
                                {achievementTiers.map(tier => {
                                    const isCompleted = creature.encounters.length >= tier;
                                    const progress = Math.min(100, (creature.encounters.length / tier) * 100);
                                    return (
                                        <div key={tier} className={cn("p-3 rounded-lg border", isCompleted && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800")}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">Caza {tier} {creature.name}{tier > 1 ? 's':''}</p>
                                                    <p className="text-xs text-muted-foreground">{creature.encounters.length} / {tier} encuentros</p>
                                                </div>
                                                {isCompleted && (
                                                     <div className="flex flex-col items-end">
                                                        <span className="flex items-center justify-end gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                                            <Star className="h-4 w-4" /> 1
                                                        </span>
                                                        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">+{XP_PER_HUNTING_MISSION} XP</span>
                                                     </div>
                                                )}
                                            </div>
                                            {!isCompleted && <Progress value={progress} className="h-2 mt-2"/>}
                                        </div>
                                    )
                                })}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;
