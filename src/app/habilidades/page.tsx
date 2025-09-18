"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { BrainCircuit, Dumbbell, Zap, Heart, Flame, ShieldOff, TrendingUp, Target, Gem } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Trade } from '@/lib/types';
import { cn } from '@/lib/utils';

// --- Helper Functions for Metric Calculation ---

// Calculates the longest winning streak from a list of trades
const calculateLongestWinningStreak = (trades: Trade[]): number => {
  let maxStreak = 0;
  let currentStreak = 0;
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (const trade of sortedTrades) {
    if (trade.status === 'win') {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
};

// Finds the highest number of losses in a single day
const calculateMaxLossesInADay = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;

  const lossesByDay: { [key: string]: number } = {};
  trades.forEach(trade => {
    if (trade.status === 'loss') {
      const day = new Date(trade.date).toISOString().split('T')[0];
      lossesByDay[day] = (lossesByDay[day] || 0) + 1;
    }
  });

  return Math.max(0, ...Object.values(lossesByDay));
};

// Finds the highest profit made in a single day
const calculateMaxProfitInADay = (trades: Trade[]): number => {
    if (trades.length === 0) return 0;
    
    const profitByDay: { [key: string]: number } = {};
    trades.forEach(trade => {
        const day = new Date(trade.date).toISOString().split('T')[0];
        profitByDay[day] = (profitByDay[day] || 0) + trade.profit;
    });

    return Math.max(0, ...Object.values(profitByDay));
};

// Calculates the average profit on winning days
const calculateAverageWinningDayProfit = (trades: Trade[]): number => {
    const profitByDay: { [key: string]: number } = {};
    trades.forEach(trade => {
        const day = new Date(trade.date).toISOString().split('T')[0];
        profitByDay[day] = (profitByDay[day] || 0) + trade.profit;
    });

    const winningDaysProfits = Object.values(profitByDay).filter(dailyProfit => dailyProfit > 0);
    
    if (winningDaysProfits.length === 0) return 0;
    
    const totalProfit = winningDaysProfits.reduce((acc, profit) => acc + profit, 0);
    return totalProfit / winningDaysProfits.length;
};


// --- Skill Definitions ---

const getSkillLevel = (metric: string, value: number): number => {
    switch(metric) {
        case 'streak': // Higher is better
            if (value >= 15) return 5;
            if (value >= 10) return 4;
            if (value >= 7) return 3;
            if (value >= 5) return 2;
            if (value >= 3) return 1;
            return 0;
        case 'lossManagement': // Lower is better
            if (value <= 3) return 5;
            if (value <= 5) return 4;
            if (value <= 7) return 3;
            if (value <= 10) return 2;
            if (value <= 15) return 1;
            return 0;
        case 'peakProfit': // Higher is better
            if (value >= 1000) return 5;
            if (value >= 500) return 4;
            if (value >= 250) return 3;
            if (value >= 100) return 2;
            if (value >= 50) return 1;
            return 0;
        case 'consistency': // Higher is better
            if (value >= 500) return 5;
            if (value >= 250) return 4;
            if (value >= 100) return 3;
            if (value >= 50) return 2;
            if (value >= 20) return 1;
            return 0;
        default:
            return 0;
    }
}

const getRank = (averageLevel: number): { rank: string, color: string } => {
    if (averageLevel >= 4.5) return { rank: 'SS', color: 'text-purple-500' };
    if (averageLevel >= 3.5) return { rank: 'S', color: 'text-cyan-400' };
    if (averageLevel >= 2.5) return { rank: 'A', color: 'text-green-500' };
    if (averageLevel >= 1.5) return { rank: 'B', color: 'text-blue-500' };
    if (averageLevel > 0) return { rank: 'C', color: 'text-yellow-500' };
    if (averageLevel === 0 && averageLevel > -1 ) return { rank: 'D', color: 'text-orange-500' };
    return { rank: 'E', color: 'text-red-500' };
};


const HabilidadesPage = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  
  useEffect(() => {
    const storedTrades = localStorage.getItem('trades');
    if (storedTrades) {
      setTrades(JSON.parse(storedTrades));
    }
  }, []);
  
  const skillMetrics = useMemo(() => {
    const streak = calculateLongestWinningStreak(trades);
    const lossManagement = calculateMaxLossesInADay(trades);
    const peakProfit = calculateMaxProfitInADay(trades);
    const consistency = calculateAverageWinningDayProfit(trades);

    return [
      {
        name: 'Racha de Victorias',
        description: 'Mide la consistencia encontrando tu racha de victorias más larga.',
        icon: Flame,
        value: streak,
        level: getSkillLevel('streak', streak),
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        formatter: (val: number) => `${val} victorias`,
      },
      {
        name: 'Gestión de Pérdidas',
        description: 'Evalúa la disciplina midiendo el máximo de pérdidas en un solo día.',
        icon: ShieldOff,
        value: lossManagement,
        level: getSkillLevel('lossManagement', lossManagement),
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        formatter: (val: number) => `${val} pérdidas`,
      },
      {
        name: 'Pico de Ganancias',
        description: 'Muestra tu mejor día de trading, registrando la máxima ganancia diaria.',
        icon: TrendingUp,
        value: peakProfit,
        level: getSkillLevel('peakProfit', peakProfit),
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        formatter: (val: number) => `$${val.toFixed(2)}`,
      },
      {
        name: 'Consistencia de Ganancias',
        description: 'Calcula tu ganancia promedio en los días con beneficio.',
        icon: Target,
        value: consistency,
        level: getSkillLevel('consistency', consistency),
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        formatter: (val: number) => `$${val.toFixed(2)} / día`,
      }
    ];
  }, [trades]);

  const { rank, color } = useMemo(() => {
    if (skillMetrics.length === 0) return getRank(-1);
    const totalLevels = skillMetrics.reduce((acc, skill) => acc + skill.level, 0);
    const averageLevel = totalLevels / skillMetrics.length;
    return getRank(averageLevel);
  }, [skillMetrics]);


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <BrainCircuit className="h-8 w-8 mr-3 text-teal-500" />
              Centro de Habilidades
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu rendimiento como trader reflejado en habilidades clave.</p>
          </div>
        </div>
      </header>
      
        <Card className="mb-8 text-center">
            <CardHeader>
                <CardTitle className="text-xl font-medium text-muted-foreground">Rango de Habilidad General</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center gap-4">
                    <Gem className={cn("h-12 w-12 transition-colors", color)} />
                    <span className={cn("text-7xl font-bold", color)}>{rank}</span>
                </div>
            </CardContent>
        </Card>
      
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillMetrics.map((skill) => {
          const Icon = skill.icon;
          return (
            <Card key={skill.name} className="flex flex-col text-center hover:shadow-lg transition-shadow">
                <CardHeader className="items-center">
                    <div className={`w-16 h-16 rounded-full ${skill.bgColor} flex items-center justify-center border-4 ${skill.borderColor}`}>
                        <Icon className={`h-8 w-8 ${skill.color}`} />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                    <CardTitle>{skill.name}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <div className="text-2xl font-bold">{skill.formatter(skill.value)}</div>
                    <Badge variant="secondary">Nivel {skill.level}</Badge>
                </CardFooter>
            </Card>
          )
        })}
      </main>

    </div>
  );
};

export default HabilidadesPage;
