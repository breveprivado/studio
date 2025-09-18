

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, RotateCcw, Trophy, Skull, Calendar as CalendarIcon, Heart, Minus, ShieldOff, BarChart2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Trade, type Withdrawal, type Activity, type BalanceAddition, type PlayerStats, type Creature, TimeRange, DailyHealth, JournalEntry, Adjustment, NavItem } from '@/lib/types';
import { initialCreatures, defaultStrategies } from '@/lib/data';
import PerformanceCharts from '@/components/dashboard/performance-charts';
import NewTradeDialog from '@/components/dashboard/new-trade-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TradeDetailDialog from '@/components/dashboard/trade-detail-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import WithdrawalDialog from '@/components/dashboard/withdrawal-dialog';
import AddBalanceDialog from '@/components/dashboard/add-balance-dialog';
import AdjustmentDialog from '@/components/dashboard/adjustment-dialog';
import { useLeveling } from '@/hooks/use-leveling';
import RecentTrades from '@/components/dashboard/recent-trades';
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import StrategyPerformance from '@/components/dashboard/strategy-performance';
import PairAssertiveness from '@/components/dashboard/pair-assertiveness';
import { Progress } from '@/components/ui/progress';
import DailyPerformance from '@/components/dashboard/daily-performance';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import PlayerStatusCard from '@/components/dashboard/health-bar';
import WorstStrategyPerformance from '@/components/dashboard/worst-strategy-performance';
import WorstPairAssertiveness from '@/components/dashboard/worst-pair-assertiveness';
import PrideVsWorstTrades from '@/components/dashboard/pride-vs-worst-trades';
import PrideVsWorstAnalysis from '@/components/dashboard/pride-vs-worst-analysis';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ExpirationTimePerformance from '@/components/dashboard/expiration-time-performance';
import * as XLSX from 'xlsx';
import defaultNavItems from '@/lib/nav-items.json';
import HourlyPerformance from '@/components/dashboard/hourly-performance';
import WinningStreakTracker from '@/components/dashboard/winning-streak-tracker';


// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const XP_PENALTY_PER_LOSS = 75;
const XP_PER_HUNTING_MISSION = 500;
const XP_PER_SURVIVAL_MISSION = 500;
const XP_PER_SURVIVAL_DAY = 100;
const achievementTiers = [1, 5, 10, 25, 50, 100];
const levelMilestones: { [key: number]: number } = {
    1: 1, 2: 7, 3: 21, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150,
    9: 180, 10: 210, 11: 240, 12: 270, 13: 300, 14: 330, 15: 365,
};

const getXpForCreature = (creatureId: string) => {
    return (parseInt(creatureId, 10) / 17) * 50 + 10;
};


const PlayerLevelCard = ({ xp, onReset, level }: { xp: number; onReset: () => void; level: number }) => {
    const { xpForNextLevel, progressPercentage } = useLeveling(xp);

    return (
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <span>Nivel del Jugador</span>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>¿Reiniciar Nivel y XP?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción restablecerá tu experiencia (XP) a 0 y tu nivel a 1. No afectará a tus misiones, bestiario o bitácora.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onReset} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Sí, reiniciar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 mb-2">
                    <Trophy className="h-8 w-8 text-amber-400" />
                    <span className="text-2xl font-bold">Nivel {level}</span>
                </div>
                <div className="space-y-1">
                    <Progress value={progressPercentage} />
                    <div className="text-center text-xs text-muted-foreground">
                        <p>{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balanceAdditions, setBalanceAdditions] = useState<BalanceAddition[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ startDate: new Date().toISOString(), class: undefined, xp: 0 });
  const [dailyHealth, setDailyHealth] = useState<DailyHealth>({ lives: 3, date: new Date().toISOString() });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const [timeRange, setTimeRange] = useState<TimeRange>('anual');
  const [viewDate, setViewDate] = useState<Date | undefined>();

  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showBarCharts, setShowBarCharts] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { level } = useLeveling(playerStats.xp);
  const prevLevel = usePrevious(level);
  
  useEffect(() => {
    setViewDate(new Date());
  }, []);

  useEffect(() => {
    if (prevLevel === undefined) return;
    
    if (level > prevLevel) {
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/10/18/audio_1416d860d5.mp3');
        audio.play().catch(error => {
            console.error("Audio playback failed:", error);
        });
    }
  }, [level, prevLevel]);

  
  const loadAllData = () => {
    const storedTrades = localStorage.getItem('trades');
    const currentTrades = storedTrades ? JSON.parse(storedTrades) : [];
    setTrades(currentTrades);
    
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    const currentCreatures = storedCreatures ? JSON.parse(storedCreatures) : initialCreatures;
    setCreatures(currentCreatures);
    if (!storedCreatures) {
      localStorage.setItem('bestiaryCreatures', JSON.stringify(initialCreatures));
    }
    
    const storedWithdrawals = localStorage.getItem('withdrawals');
    setWithdrawals(storedWithdrawals ? JSON.parse(storedWithdrawals) : []);
    
    const storedBalanceAdditions = localStorage.getItem('balanceAdditions');
    setBalanceAdditions(storedBalanceAdditions ? JSON.parse(storedBalanceAdditions) : []);

    const storedAdjustments = localStorage.getItem('adjustments');
    setAdjustments(storedAdjustments ? JSON.parse(storedAdjustments) : []);
    
    const storedPlayerStats = localStorage.getItem('playerStats');
    let stats = storedPlayerStats ? JSON.parse(storedPlayerStats) : { startDate: new Date().toISOString(), class: undefined, xp: 0 };
    if (!stats.class) {
        stats.class = 'Nigromante';
    }
    setPlayerStats(stats);
    
    const storedHealth = localStorage.getItem('dailyHealth');
    if (storedHealth) {
        const healthData: DailyHealth = JSON.parse(storedHealth);
        if (isSameDay(new Date(healthData.date), new Date())) {
            setDailyHealth(healthData);
        } else {
            handleResetLives();
        }
    }
    
    const storedJournal = localStorage.getItem('journalEntries');
    setJournalEntries(storedJournal ? JSON.parse(storedJournal) : []);

    syncCreatureEncountersFromTrades(currentTrades, currentCreatures);
  };
  
  useEffect(() => {
    loadAllData();

     const handleStorageChange = (e: StorageEvent) => {
        const keysToWatch = ['trades', 'withdrawals', 'balanceAdditions', 'adjustments', 'playerStats', 'bestiaryCreatures', 'journalEntries', 'xp_updated', 'dailyHealth', 'navItems'];
        if (e.key && keysToWatch.includes(e.key)) {
            loadAllData();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  useEffect(() => {
    let totalXp = 0;

    // 1. XP from trades
    trades.forEach(trade => {
        if (trade.status === 'win' && trade.creatureId) {
            totalXp += getXpForCreature(trade.creatureId);
        } else if (trade.status === 'loss') {
            totalXp -= XP_PENALTY_PER_LOSS;
        }
    });

    // 2. XP from Hunting Missions
    creatures.forEach(creature => {
        const encounterCount = (creature.encounters || []).length;
        achievementTiers.forEach(tier => {
            if (encounterCount >= tier) {
                totalXp += XP_PER_HUNTING_MISSION;
            }
        });
    });

    // 3. XP from Survival Missions & Daily Survival
    const ratedDays = journalEntries.filter(e => e.rating === 3 || e.rating === 5);
    const ratedDaysCount = ratedDays.length;
    totalXp += ratedDaysCount * XP_PER_SURVIVAL_DAY;
    
    Object.values(levelMilestones).forEach(milestone => {
        if (ratedDaysCount >= milestone) {
            totalXp += XP_PER_SURVIVAL_MISSION;
        }
    });
    
    const newXp = Math.max(0, totalXp);

    if (newXp !== playerStats.xp) {
        setPlayerStats(prevStats => {
            const newPlayerStats = { ...prevStats, xp: newXp };
            localStorage.setItem('playerStats', JSON.stringify(newPlayerStats));
            return newPlayerStats;
        });
    }
}, [trades, creatures, journalEntries, playerStats.xp]);
  
  const syncCreatureEncountersFromTrades = (allTrades: Trade[], currentCreatures: Creature[]) => {
    const freshCreatures = initialCreatures.map(c => {
        // Find user customizations if they exist
        const userCreature = currentCreatures.find(uc => uc.id === c.id);
        return { 
            ...c, 
            name: userCreature?.name || c.name,
            description: userCreature?.description || c.description,
            imageUrl: userCreature?.imageUrl || c.imageUrl,
            encounters: [] 
        };
    });

    const encountersByCreature: { [key: string]: any[] } = {};

    // Sort trades oldest to newest to process encounters in chronological order
    const sortedTrades = [...allTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTrades.forEach(trade => {
        if (trade.creatureId) {
            if (!encountersByCreature[trade.creatureId]) {
                encountersByCreature[trade.creatureId] = [];
            }
            const newEncounter: { id: string, date: string, status: 'win' | 'loss' } = {
                id: trade.id, // Use trade id as the unique encounter id
                date: trade.date,
                status: trade.status,
            };
            encountersByCreature[trade.creatureId].push(newEncounter);
        }
    });

    const syncedCreatures = freshCreatures.map(creature => {
        if (encountersByCreature[creature.id]) {
            return { ...creature, encounters: encountersByCreature[creature.id] };
        }
        return creature;
    });
    
    setCreatures(syncedCreatures);
    localStorage.setItem('bestiaryCreatures', JSON.stringify(syncedCreatures));
    window.dispatchEvent(new StorageEvent('storage', { key: 'bestiaryCreatures' }));
};

  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    
    let finalTrade: Trade = { ...trade, id: crypto.randomUUID() };
    
    const updatedTrades = [finalTrade, ...trades];
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));

    // Handle creature encounters and hunting mission XP
    if (trade.creatureId) {
        syncCreatureEncountersFromTrades(updatedTrades, creatures);
    }
    
    if (trade.status === 'loss') {
        if (dailyHealth.lives > 0) {
            handleRemoveLife();
            toast({
                title: "¡Vida Perdida!",
                description: "Has perdido un corazón. ¡Ten cuidado!",
                variant: "destructive"
            })
        }
    }
  };

  const handleUpdateTrade = (tradeId: string, updatedData: Partial<Trade>) => {
    const updatedTrades = trades.map(trade => 
      trade.id === tradeId ? { ...trade, ...updatedData } : trade
    );
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));

    if ('creatureId' in updatedData || 'status' in updatedData) {
        syncCreatureEncountersFromTrades(updatedTrades, creatures);
    }

    toast({
      title: "Operación Actualizada",
      description: "Los detalles de la operación han sido modificados."
    });
  };

  const handleUpdateWithdrawal = (withdrawalId: string, updatedData: Partial<Withdrawal>) => {
    const updatedWithdrawals = withdrawals.map(w => 
      w.id === withdrawalId ? { ...w, ...updatedData } : w
    );
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem('withdrawals', JSON.stringify(updatedWithdrawals));
    toast({
      title: "Retiro Actualizado",
      description: "La fecha del retiro ha sido modificada."
    });
  };

  const handleUpdateBalance = (balanceId: string, updatedData: Partial<BalanceAddition>) => {
    const updatedBalances = balanceAdditions.map(b => 
      b.id === balanceId ? { ...b, ...updatedData } : b
    );
    setBalanceAdditions(updatedBalances);
    localStorage.setItem('balanceAdditions', JSON.stringify(updatedBalances));
    toast({
      title: "Depósito Actualizado",
      description: "La fecha del depósito ha sido modificada."
    });
  };

  const handleUpdateAdjustment = (adjustmentId: string, updatedData: Partial<Adjustment>) => {
    const updatedAdjustments = adjustments.map(a => 
      a.id === adjustmentId ? { ...a, ...updatedData } : a
    );
    setAdjustments(updatedAdjustments);
    localStorage.setItem('adjustments', JSON.stringify(updatedAdjustments));
    toast({
      title: "Ajuste Actualizado",
      description: "La fecha del ajuste ha sido modificada."
    });
  };

 const handleFullReset = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('trades');
    localStorage.removeItem('withdrawals');
    localStorage.removeItem('balanceAdditions');
    localStorage.removeItem('adjustments');
    localStorage.removeItem('bestiaryCreatures');
    localStorage.removeItem('journalEntries');
    localStorage.removeItem('habitTasks');
    localStorage.removeItem('tournamentPosts');
    localStorage.removeItem('playerStats');
    localStorage.removeItem('dailyHealth');
    localStorage.removeItem('strategyOptions');
    localStorage.removeItem('navItems');
    localStorage.removeItem('mandatoryItems_trading');
    localStorage.removeItem('mandatoryItems_personaje');
    
    // Clear mission-specific XP flags
    Object.values(levelMilestones).forEach(milestone => {
        localStorage.removeItem(`xpEarned_${milestone}`);
    });
    
    toast({
      title: "Reinicio Total Completado",
      description: "Todos tus datos han sido eliminados. La aplicación se recargará.",
    });

    // Reload the page to start from a clean state
    setTimeout(() => window.location.reload(), 1500);
  };

  const filteredTrades = useMemo(() => {
    if (!viewDate) return [];
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      switch (timeRange) {
        case 'daily':
          return isSameDay(tradeDate, viewDate);
        case 'monthly':
          return tradeDate.getMonth() === viewDate.getMonth() && tradeDate.getFullYear() === viewDate.getFullYear();
        case 'anual':
          return tradeDate.getFullYear() === viewDate.getFullYear();
        default:
          return true;
      }
    });
  }, [trades, timeRange, viewDate]);
  
  const netProfit = useMemo(() => {
    const allActivities: Activity[] = [
        ...trades.map(t => ({...t, type: 'trade'} as const)),
        ...withdrawals.map(w => ({...w, type: 'withdrawal'} as const)),
        ...balanceAdditions.map(b => ({...b, type: 'balance'} as const)),
        ...adjustments.map(a => ({...a, type: 'adjustment'} as const)),
    ];
    
    return allActivities.reduce((acc, activity) => {
        if (activity.type === 'trade') return acc + (activity.profit || 0);
        if (activity.type === 'balance') return acc + (activity.amount || 0);
        if (activity.type === 'withdrawal') return acc - (activity.amount || 0);
        if (activity.type === 'adjustment') return acc + (activity.amount || 0);
        return acc;
    }, 0);
  }, [trades, withdrawals, balanceAdditions, adjustments]);

  const { gains, losses, filteredNetProfit, totalLossesCount, totalXpLost } = useMemo(() => {
    const tradesToAnalyze = filteredTrades.filter(t => t.status === 'win' || t.status === 'loss');
    const gains = tradesToAnalyze.filter(t => t.status === 'win').reduce((acc, t) => acc + t.profit, 0);
    const losses = tradesToAnalyze.filter(t => t.status === 'loss').reduce((acc, t) => acc + t.profit, 0);

    const relevantWithdrawals = withdrawals.filter(w => isSameDay(new Date(w.date), viewDate!));
    const relevantBalanceAdditions = balanceAdditions.filter(b => isSameDay(new Date(b.date), viewDate!));
    const relevantAdjustments = adjustments.filter(a => isSameDay(new Date(a.date), viewDate!));

    // This logic needs to be adapted based on the time range for filteredNetProfit
    // For simplicity, let's calculate net profit on all data for now.
    const allTimeGains = trades.filter(t => t.status === 'win').reduce((acc, t) => acc + t.profit, 0);
    const allTimeLosses = trades.filter(t => t.status === 'loss').reduce((acc, t) => acc + t.profit, 0);
    const totalWithdrawals = withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const totalBalanceAdditions = balanceAdditions.reduce((acc, b) => acc + b.amount, 0);
    const totalAdjustments = adjustments.reduce((acc, a) => acc + a.amount, 0);
    const filteredNetProfit = totalBalanceAdditions + allTimeGains + allTimeLosses - totalWithdrawals + totalAdjustments;
    
    const allLosses = trades.filter(t => t.status === 'loss');
    const totalLossesCount = allLosses.length;
    const totalXpLost = totalLossesCount * XP_PENALTY_PER_LOSS;

    return { gains, losses, filteredNetProfit, totalLossesCount, totalXpLost };
  }, [filteredTrades, trades, withdrawals, balanceAdditions, adjustments, viewDate, timeRange]);

  const activities = useMemo((): Activity[] => {
    const combined: Activity[] = [
        ...trades.map(t => ({...t, type: 'trade' as const})),
        ...withdrawals.map(w => ({...w, type: 'withdrawal' as const})),
        ...balanceAdditions.map(b => ({...b, type: 'balance' as const})),
        ...adjustments.map(a => ({...a, type: 'adjustment' as const})),
    ];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, withdrawals, balanceAdditions, adjustments]);
  

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return formatted;
  };
  
  const handleAddWithdrawal = (withdrawal: Omit<Withdrawal, 'id' | 'date'>) => {
    const newWithdrawal = { ...withdrawal, id: crypto.randomUUID(), date: new Date().toISOString() };
    const newWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(newWithdrawals);
    localStorage.setItem('withdrawals', JSON.stringify(newWithdrawals));
    toast({
        title: "Retiro Registrado",
        description: "Tu retiro ha sido guardado exitosamente."
    })
  }

  const handleAddBalance = (balance: Omit<BalanceAddition, 'id' | 'date'>) => {
    const newBalance = { ...balance, id: crypto.randomUUID(), date: new Date().toISOString() };
    const newBalanceAdditions = [newBalance, ...balanceAdditions];
    setBalanceAdditions(newBalanceAdditions);
    localStorage.setItem('balanceAdditions', JSON.stringify(newBalanceAdditions));
    toast({
        title: "Saldo Añadido",
        description: "Tu nuevo saldo ha sido registrado exitosamente."
    })
  }

   const handleAddAdjustment = (newTotalBalance: number) => {
    const adjustmentAmount = newTotalBalance - netProfit;

    const newAdjustment: Omit<Adjustment, 'id'> = {
      amount: adjustmentAmount,
      date: new Date().toISOString(),
      notes: `Corrección a ${formatCurrency(newTotalBalance)}`,
    };
    
    const newAdjustments = [{...newAdjustment, id: crypto.randomUUID() }, ...adjustments];
    setAdjustments(newAdjustments);
    localStorage.setItem('adjustments', JSON.stringify(newAdjustments));
    
    toast({
        title: "Ajuste Registrado",
        description: `El saldo ha sido ajustado a ${formatCurrency(newTotalBalance)}.`
    });
  }

  const handleDeleteTrade = (id: string) => {
      const newTrades = trades.filter(t => t.id !== id);
      setTrades(newTrades);
      localStorage.setItem('trades', JSON.stringify(newTrades));
      
      syncCreatureEncountersFromTrades(newTrades, creatures);

      toast({
          title: "Operación Eliminada",
          description: "La operación ha sido eliminada del historial.",
          variant: "destructive"
      });
  };

  const handleDeleteWithdrawal = (id: string) => {
    const newWithdrawals = withdrawals.filter(w => w.id !== id);
    setWithdrawals(newWithdrawals);
    localStorage.setItem('withdrawals', JSON.stringify(newWithdrawals));
  }

  const handleDeleteBalance = (id: string) => {
    const newBalanceAdditions = balanceAdditions.filter(b => b.id !== id);
    setBalanceAdditions(newBalanceAdditions);
    localStorage.setItem('balanceAdditions', JSON.stringify(newBalanceAdditions));
  }

  const handleDeleteAdjustment = (id: string) => {
    const newAdjustments = adjustments.filter(a => a.id !== id);
    setAdjustments(newAdjustments);
    localStorage.setItem('adjustments', JSON.stringify(newAdjustments));
  }

  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrade(trade);
  }

  const handleResetLevel = () => {
      setPlayerStats(prev => {
          const newPlayerStats = { ...prev, xp: 0 };
          localStorage.setItem('playerStats', JSON.stringify(newPlayerStats));
          return newPlayerStats;
      });
      toast({
          title: "Nivel Reiniciado",
          description: "Tu experiencia (XP) ha sido restablecida a 0."
      });
  };

  const handleResetLives = () => {
    const newHealth = { lives: 3, date: new Date().toISOString() };
    setDailyHealth(newHealth);
    localStorage.setItem('dailyHealth', JSON.stringify(newHealth));
    toast({
      title: "Vidas Restauradas",
      description: "Tus corazones han sido restaurados para el día."
    })
  }

  const handleAddLife = () => {
    setDailyHealth(prev => {
        const newLives = prev.lives + 1;
        const newHealth = { ...prev, lives: newLives };
        localStorage.setItem('dailyHealth', JSON.stringify(newHealth));
        return newHealth;
    });
  }

  const handleRemoveLife = () => {
    setDailyHealth(prev => {
        const newLives = Math.max(prev.lives - 1, 0);
        const newHealth = { ...prev, lives: newLives };
        localStorage.setItem('dailyHealth', JSON.stringify(newHealth));
        return newHealth;
    });
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setViewDate(date);
      setTimeRange('daily');
    }
  }

  const handleExportData = () => {
    const wb = XLSX.utils.book_new();

    const dataToExport = {
      trades,
      withdrawals,
      balanceAdditions,
      adjustments,
      creatures,
      journalEntries: JSON.parse(localStorage.getItem('journalEntries') || '[]'),
      habitTasks: JSON.parse(localStorage.getItem('habitTasks') || '[]'),
      tournamentPosts: JSON.parse(localStorage.getItem('tournamentPosts') || '[]'),
      playerStats: [playerStats], // wrap in array for worksheet
      dailyHealth: [dailyHealth],
      mandatoryItems_trading: JSON.parse(localStorage.getItem('mandatoryItems_trading') || '[]'),
      mandatoryItems_personaje: JSON.parse(localStorage.getItem('mandatoryItems_personaje') || '[]'),
      strategyOptions: JSON.parse(localStorage.getItem('strategyOptions') || JSON.stringify(defaultStrategies)),
      navItems: JSON.parse(localStorage.getItem('navItems') || JSON.stringify(defaultNavItems)),
    };

    for (const [key, value] of Object.entries(dataToExport)) {
        if (Array.isArray(value) && value.length > 0) {
            // For strategyOptions which is just an array of strings, we need to format it for excel
            if (key === 'strategyOptions') {
                const formattedStrategies = value.map(strat => ({ value: strat }));
                const ws = XLSX.utils.json_to_sheet(formattedStrategies);
                XLSX.utils.book_append_sheet(wb, ws, key);
            } else {
                const ws = XLSX.utils.json_to_sheet(value);
                XLSX.utils.book_append_sheet(wb, ws, key);
            }
        } else if (!Array.isArray(value)) {
             const ws = XLSX.utils.json_to_sheet([value]);
             XLSX.utils.book_append_sheet(wb, ws, key);
        }
    }

    XLSX.writeFile(wb, "olimpo_wallet_backup.xlsx");
    toast({
        title: "Datos Exportados",
        description: "Tu copia de seguridad ha sido descargada como olimpo_wallet_backup.xlsx"
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se seleccionó ningún archivo.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const wb = XLSX.read(data, { type: 'binary' });

            const sheetActions: { [key: string]: (data: any[]) => void } = {
                trades: (d) => localStorage.setItem('trades', JSON.stringify(d)),
                withdrawals: (d) => localStorage.setItem('withdrawals', JSON.stringify(d)),
                balanceAdditions: (d) => localStorage.setItem('balanceAdditions', JSON.stringify(d)),
                adjustments: (d) => localStorage.setItem('adjustments', JSON.stringify(d)),
                creatures: (d) => localStorage.setItem('bestiaryCreatures', JSON.stringify(d)),
                journalEntries: (d) => localStorage.setItem('journalEntries', JSON.stringify(d)),
                habitTasks: (d) => localStorage.setItem('habitTasks', JSON.stringify(d)),
                tournamentPosts: (d) => localStorage.setItem('tournamentPosts', JSON.stringify(d)),
                playerStats: (d) => localStorage.setItem('playerStats', JSON.stringify(d[0])),
                dailyHealth: (d) => localStorage.setItem('dailyHealth', JSON.stringify(d[0])),
                mandatoryItems_trading: (d) => localStorage.setItem('mandatoryItems_trading', JSON.stringify(d)),
                mandatoryItems_personaje: (d) => localStorage.setItem('mandatoryItems_personaje', JSON.stringify(d)),
                navItems: (d) => localStorage.setItem('navItems', JSON.stringify(d)),
            };

            wb.SheetNames.forEach(sheetName => {
                const ws = wb.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(ws);
                
                const action = sheetActions[sheetName];
                if (action) {
                    action(jsonData);
                } else if (sheetName === 'strategyOptions' && wb.SheetNames.includes('strategyOptions')) {
                    const strategies = jsonData.map((item: any) => item.value);
                    localStorage.setItem('strategyOptions', JSON.stringify(strategies));
                }
            });

            toast({
                title: "Importación Completa",
                description: "Tus datos han sido restaurados. La página se recargará."
            });

            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error("Error al importar los datos:", error);
            toast({ variant: 'destructive', title: 'Error de Importación', description: 'El archivo no es válido o está corrupto.' });
        }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    if(fileInputRef.current) fileInputRef.current.value = '';
  };
  
  if (!viewDate) {
    return null; // or a loading skeleton
  }

  const winningStreak = useMemo(() => {
    let streak = 0;
    // Trades are already sorted newest to oldest in the 'activities' memo
    const sortedTrades = [...trades].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for(const trade of sortedTrades) {
        if(trade.status === 'win') {
            streak++;
        } else {
            break; // Streak is broken
        }
    }
    return streak;
  }, [trades]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden"/>
                  <div>
                      <h1 className="text-3xl font-bold">Dashboard</h1>
                      <p className="text-muted-foreground">
                        {timeRange === 'daily' && viewDate ? `Mostrando resultados para ${format(viewDate, "PPP", { locale: es })}` : 'Una vista detallada de tu situación financiera'}
                      </p>
                  </div>
              </div>
                <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2 sm:flex-wrap">
                  <div className='flex gap-2'>
                      {(['Diario', 'Mensual', 'Anual'] as const).map(range => {
                          const rangeKey = range.toLowerCase() as TimeRange;
                          return (
                              <Button
                              key={range}
                              onClick={() => setTimeRange(rangeKey)}
                              variant={timeRange === rangeKey ? "default" : "outline"}
                              size="sm"
                              >
                              {range}
                              </Button>
                          )
                      })}
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="sm"
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !viewDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {viewDate ? format(viewDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={viewDate}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                       <Button onClick={() => setShowBarCharts(!showBarCharts)} size="sm" variant="outline">
                          <BarChart2 className="mr-2 h-4 w-4" />
                          {showBarCharts ? 'Ocultar' : 'Mostrar'} Gráficos
                      </Button>
                  </div>
                  <div className='flex gap-2'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="sm" variant="destructive">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reinicio Total
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Realizar Reinicio Total?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción es irreversible y eliminará permanentemente TODOS tus datos de la aplicación (operaciones, bestiario, bitácora, nivel, XP, etc.). Es como empezar de cero.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFullReset} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Sí, reiniciar todo</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Importar
                      </Button>
                      <Button onClick={handleExportData} size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
                      </Button>
                      <Button onClick={() => setIsAdjustmentOpen(true)} size="sm" variant="outline">
                          Ajustar Saldo
                      </Button>
                      <Button onClick={() => setIsAddBalanceOpen(true)} size="sm" variant="outline">
                          Añadir Saldo
                      </Button>
                      <Button onClick={() => setIsWithdrawalOpen(true)} size="sm" variant="outline">
                          Registrar Retiro
                      </Button>
                      <Button onClick={() => setIsNewTradeOpen(true)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Plus className="mr-2 h-4 w-4"/>
                          Nueva Operación
                      </Button>
                  </div>
              </div>
          </header>

          <main className="space-y-6">
              <PlayerStatusCard 
                playerClass={playerStats.class} 
                lives={dailyHealth.lives} 
                onReset={handleResetLives}
                onAddLife={handleAddLife}
                onRemoveLife={handleRemoveLife}
                trades={filteredTrades}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
                  <Card className="lg:col-span-1">
                      <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Beneficio Neto</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <div className={cn("text-xl font-bold", netProfit >= 0 ? "text-green-500" : "text-red-500")}>{formatCurrency(netProfit)}</div>
                          <p className="text-xs text-muted-foreground">{trades.length} operaciones totales</p>
                      </CardContent>
                  </Card>
                  <Card className="lg:col-span-1">
                      <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Ganancias</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <div className="text-xl font-bold text-green-500">{formatCurrency(gains)}</div>
                          <p className="text-xs text-muted-foreground">{filteredTrades.filter(t => t.status === 'win').length} operaciones ganadas</p>
                      </CardContent>
                  </Card>
                    <Card className="lg:col-span-1">
                      <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Pérdidas</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <div className="text-xl font-bold text-red-500">{formatCurrency(Math.abs(losses))}</div>
                          <p className="text-xs text-muted-foreground">{filteredTrades.filter(t => t.status === 'loss').length} operaciones perdidas</p>
                      </CardContent>
                  </Card>
                  <div className="lg:col-span-1">
                      <PlayerLevelCard xp={playerStats.xp} onReset={handleResetLevel} level={level} />
                  </div>
                  <div className="lg:col-span-1">
                      <WinningStreakTracker currentStreak={winningStreak} />
                  </div>
              </div>

              <Card>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="p-6">
                          <div className="flex items-center">
                              <ShieldOff className="h-6 w-6 text-destructive mr-3" />
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análisis de Pérdidas Totales</h2>
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                          <div className="space-y-2 rounded-lg bg-muted p-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total de Operaciones Perdidas:</span>
                              <span className="font-bold text-lg">{totalLossesCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total de XP Perdida:</span>
                              <span className="font-bold text-lg text-red-500">-{totalXpLost.toLocaleString()} XP</span>
                            </div>
                          </div>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
              </Card>
              
              <PerformanceCharts trades={trades} balanceAdditions={balanceAdditions} withdrawals={withdrawals} adjustments={adjustments} />
              
              {showBarCharts && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StrategyPerformance trades={filteredTrades} />
                    <PairAssertiveness trades={filteredTrades} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WorstStrategyPerformance trades={filteredTrades} />
                    <WorstPairAssertiveness trades={filteredTrades} />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DailyPerformance trades={filteredTrades} />
                    <HourlyPerformance trades={filteredTrades} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PrideVsWorstTrades trades={filteredTrades} />
                    <PrideVsWorstAnalysis trades={filteredTrades} />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ExpirationTimePerformance trades={filteredTrades} />
                  </div>
                </div>
              )}

              <RecentTrades activities={activities} creatures={creatures} onDeleteTrade={handleDeleteTrade} onUpdateTrade={handleUpdateTrade} onDeleteWithdrawal={handleDeleteWithdrawal} onUpdateWithdrawal={handleUpdateWithdrawal} onDeleteBalance={handleDeleteBalance} onUpdateBalance={handleUpdateBalance} onDeleteAdjustment={handleDeleteAdjustment} onUpdateAdjustment={handleUpdateAdjustment} onSelectTrade={handleSelectTrade} formatCurrency={formatCurrency} />

          </main>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportData} 
        className="hidden" 
        accept=".xlsx"
      />
      
      <NewTradeDialog isOpen={isNewTradeOpen} onOpenChange={setIsNewTradeOpen} onAddTrade={handleAddTrade} creatures={creatures} />
      <WithdrawalDialog isOpen={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen} onAddWithdrawal={handleAddWithdrawal} creatures={creatures} />
      <AddBalanceDialog isOpen={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen} onAddBalance={handleAddBalance} />
      <AdjustmentDialog isOpen={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen} onAddAdjustment={handleAddAdjustment} netProfit={netProfit} />
      <TradeDetailDialog trade={selectedTrade} isOpen={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)} formatCurrency={formatCurrency} />
    </>
  );
}
