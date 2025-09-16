
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, RotateCcw, Trophy, Skull, Calendar as CalendarIcon, Heart, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Trade, type Withdrawal, type Activity, type BalanceAddition, type PlayerStats, type Creature, TimeRange, DailyHealth } from '@/lib/types';
import { initialCreatures } from '@/lib/data';
import PerformanceCharts from '@/components/dashboard/performance-charts';
import NewTradeDialog from '@/components/dashboard/new-trade-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TradeDetailDialog from '@/components/dashboard/trade-detail-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import WithdrawalDialog from '@/components/dashboard/withdrawal-dialog';
import AddBalanceDialog from '@/components/dashboard/add-balance-dialog';
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


// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


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
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ startDate: new Date().toISOString(), class: undefined, xp: 0 });
  const [dailyHealth, setDailyHealth] = useState<DailyHealth>({ lives: 3, date: new Date().toISOString() });

  const [timeRange, setTimeRange] = useState<TimeRange>('anual');
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const { toast } = useToast();

  const { level } = useLeveling(playerStats.xp);
  const prevLevel = usePrevious(level);

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
    setTrades(storedTrades ? JSON.parse(storedTrades) : []);
    
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    setCreatures(storedCreatures ? JSON.parse(storedCreatures) : []);
    
    const storedWithdrawals = localStorage.getItem('withdrawals');
    setWithdrawals(storedWithdrawals ? JSON.parse(storedWithdrawals) : []);
    
    const storedBalanceAdditions = localStorage.getItem('balanceAdditions');
    setBalanceAdditions(storedBalanceAdditions ? JSON.parse(storedBalanceAdditions) : []);
    
    const storedPlayerStats = localStorage.getItem('playerStats');
    let stats = storedPlayerStats ? JSON.parse(storedPlayerStats) : { startDate: new Date().toISOString(), class: undefined, xp: 0 };
    if (!stats.class) {
        stats.class = 'Nigromante';
        localStorage.setItem('playerStats', JSON.stringify(stats));
    }
    setPlayerStats(stats);

    if (storedCreatures) {
      setCreatures(JSON.parse(storedCreatures));
    } else {
      setCreatures(initialCreatures);
      localStorage.setItem('bestiaryCreatures', JSON.stringify(initialCreatures));
    }
    
    const storedHealth = localStorage.getItem('dailyHealth');
    if (storedHealth) {
        const healthData: DailyHealth = JSON.parse(storedHealth);
        if (isSameDay(new Date(healthData.date), new Date())) {
            setDailyHealth(healthData);
        } else {
            handleResetLives();
        }
    }

    const isDataInitialized = localStorage.getItem('data_initialized');
    if (!isDataInitialized) {
        // On first load, ensure trades start empty instead of with demo data.
        setTrades([]);
        localStorage.setItem('trades', JSON.stringify([]));
        setCreatures(initialCreatures);
        localStorage.setItem('bestiaryCreatures', JSON.stringify(initialCreatures));
        localStorage.setItem('data_initialized', 'true');
    }
  };


  useEffect(() => {
    loadAllData();

     const handleStorageChange = (e: StorageEvent) => {
        const keysToWatch = ['trades', 'withdrawals', 'balanceAdditions', 'playerStats', 'bestiaryCreatures', 'journalEntries', 'xp_updated', 'dailyHealth'];
        if (e.key && keysToWatch.includes(e.key)) {
            loadAllData();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);
  
  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade = { ...trade, id: crypto.randomUUID() };
    const updatedTrades = [newTrade, ...trades];
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));

    if (trade.status === 'loss') {
        if (dailyHealth.lives > 0) {
            handleRemoveLife();
            toast({
                title: "¡Vida Perdida!",
                description: "Has perdido un corazón. ¡Ten cuidado!",
                variant: "destructive"
            })
        }
        
        // XP Penalty for loss
        const XP_PENALTY_PER_LOSS = 75;
        setPlayerStats(prevStats => {
            const newXp = (prevStats.xp || 0) - XP_PENALTY_PER_LOSS;
            const newPlayerStats = { ...prevStats, xp: newXp };
            localStorage.setItem('playerStats', JSON.stringify(newPlayerStats));
            return newPlayerStats;
        });
        toast({
            title: "¡Penalización de XP!",
            description: `Has perdido ${XP_PENALTY_PER_LOSS} XP por esta operación.`,
            variant: "destructive"
        });
    }

    if (trade.creatureId) {
        const achievementTiers = [1, 5, 10, 25, 50, 100];
        const XP_PER_HUNTING_MISSION = 500;
        
        let creatureName = '';
        let oldEncounterCount = 0;
        let xpGained = 0;

        const getXpForCreature = (creatureId: string) => {
          return (parseInt(creatureId, 10) / 17) * 50 + 10;
        };
        
        setCreatures(currentCreatures => {
            const updatedCreatures = currentCreatures.map(c => {
                if (c.id === trade.creatureId) {
                    creatureName = c.name;
                    const newEncounter = { id: crypto.randomUUID(), date: new Date().toISOString(), status: trade.status };
                    const encounters = c.encounters || [];
                    oldEncounterCount = encounters.length;
                    return {...c, encounters: [...encounters, newEncounter]};
                }
                return c;
            });
            localStorage.setItem('bestiaryCreatures', JSON.stringify(updatedCreatures));
            return updatedCreatures;
        });

        const baseCreatureXp = getXpForCreature(trade.creatureId);
        xpGained += baseCreatureXp;
        
        toast({
            title: `¡Bestia Enfrentada!`,
            description: `Has ganado ${baseCreatureXp.toFixed(0)} XP por enfrentarte a ${creatureName}.`
        });

        const newEncounterCount = oldEncounterCount + 1;
        const unlockedTier = achievementTiers.find(tier => newEncounterCount === tier);

        if (unlockedTier) {
            xpGained += XP_PER_HUNTING_MISSION;
            toast({
                title: "¡Misión de Caza Completada!",
                description: `Has cazado ${unlockedTier} ${creatureName}(s) y ganado un bono de ${XP_PER_HUNTING_MISSION} XP!`
            });
        }
        
        if (xpGained > 0) {
            setPlayerStats(prevStats => {
                const newXp = (prevStats.xp || 0) + xpGained;
                const newPlayerStats = { ...prevStats, xp: newXp };
                localStorage.setItem('playerStats', JSON.stringify(newPlayerStats));
                return newPlayerStats;
            });
        }
    }
  };

  const handleUpdateTrade = (tradeId: string, updatedData: Partial<Trade>) => {
    const updatedTrades = trades.map(trade => 
      trade.id === tradeId ? { ...trade, ...updatedData } : trade
    );
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
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

 const handleResetAccountData = () => {
    setTrades([]);
    setWithdrawals([]);
    setBalanceAdditions([]);
    localStorage.removeItem('trades');
    localStorage.removeItem('withdrawals');
    localStorage.removeItem('balanceAdditions');
    toast({
      title: "Datos de Cuenta Restablecidos",
      description: "Todas las operaciones, retiros y depósitos han sido eliminados.",
    });
  };

  const filteredTrades = useMemo(() => {
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

  const activities = useMemo((): Activity[] => {
    const combined = [
        ...trades.map(t => ({...t, type: 'trade'} as const)),
        ...withdrawals.map(w => ({...w, type: 'withdrawal'} as const)),
        ...balanceAdditions.map(b => ({...b, type: 'balance'} as const)),
    ];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, withdrawals, balanceAdditions]);

  const { gains, losses, netProfit } = useMemo(() => {
    const tradesToAnalyze = filteredTrades.filter(t => t.status === 'win' || t.status === 'loss');
    const gains = tradesToAnalyze.filter(t => t.status === 'win').reduce((acc, t) => acc + t.profit, 0);
    const losses = tradesToAnalyze.filter(t => t.status === 'loss').reduce((acc, t) => acc + t.profit, 0);
    const totalWithdrawals = withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const totalBalanceAdditions = balanceAdditions.reduce((acc, b) => acc + b.amount, 0);
    const netProfit = totalBalanceAdditions + gains + losses - totalWithdrawals;
    return { gains, losses, netProfit };
  }, [filteredTrades, withdrawals, balanceAdditions]);

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

  const handleDeleteTrade = (id: string) => {
    const newTrades = trades.filter(t => t.id !== id);
    setTrades(newTrades);
    localStorage.setItem('trades', JSON.stringify(newTrades));
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

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                  <SidebarTrigger className="md:hidden"/>
                  <div>
                      <h1 className="text-3xl font-bold">Dashboard</h1>
                      <p className="text-muted-foreground">
                        {timeRange === 'daily' ? `Mostrando resultados para ${format(viewDate, "PPP", { locale: es })}` : 'Una vista detallada de tu situación financiera'}
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
                  </div>
                  <div className='flex gap-2'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="sm" variant="destructive">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restablecer Datos
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Restablecer Datos de Cuenta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción es irreversible y eliminará permanentemente todas las operaciones, depósitos y retiros.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetAccountData} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Sí, restablecer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                  <Card className="bg-card">
                      <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Beneficio Neto</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <div className={cn("text-xl font-bold", netProfit >= 0 ? "text-green-500" : "text-red-500")}>{formatCurrency(netProfit)}</div>
                          <p className="text-xs text-muted-foreground">{filteredTrades.length} operaciones</p>
                      </CardContent>
                  </Card>
                  <Card className="bg-card">
                      <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Ganancias</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <div className="text-xl font-bold text-green-500">{formatCurrency(gains)}</div>
                          <p className="text-xs text-muted-foreground">{filteredTrades.filter(t => t.status === 'win').length} operaciones ganadas</p>
                      </CardContent>
                  </Card>
                    <Card className="bg-card">
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
              </div>
              
              <PerformanceCharts trades={trades} balanceAdditions={balanceAdditions} withdrawals={withdrawals} />
              
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
                <PrideVsWorstTrades trades={filteredTrades} />
              </div>

              <RecentTrades activities={activities} creatures={creatures} onDeleteTrade={handleDeleteTrade} onUpdateTrade={handleUpdateTrade} onDeleteWithdrawal={handleDeleteWithdrawal} onUpdateWithdrawal={handleUpdateWithdrawal} onDeleteBalance={handleDeleteBalance} onUpdateBalance={handleUpdateBalance} onSelectTrade={handleSelectTrade} formatCurrency={formatCurrency} />

          </main>
      </div>
      
      <NewTradeDialog isOpen={isNewTradeOpen} onOpenChange={setIsNewTradeOpen} onAddTrade={handleAddTrade} creatures={creatures} />
      <WithdrawalDialog isOpen={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen} onAddWithdrawal={handleAddWithdrawal} creatures={creatures} />
      <AddBalanceDialog isOpen={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen} onAddBalance={handleAddBalance} />
      <TradeDetailDialog trade={selectedTrade} isOpen={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)} formatCurrency={formatCurrency} />
    </>
  );
}


    

    

    

    