"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, BarChart3, TrendingUp, Calendar, FileDown, Instagram, Youtube, Facebook, Moon, Sun, BookOpen, Target, Award, Layers3, ClipboardCheck, Percent, Banknote, Landmark, BookHeart, Shield, Gamepad2, Star, RotateCcw, Users, Trophy, Store, LayoutGrid, ArrowRightLeft, Wallet, Settings, HelpCircle, LogOut, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Trade, type Withdrawal, type Activity, type BalanceAddition, type PlayerStats, type Creature, TimeRange, type JournalEntry } from '@/lib/types';
import { initialTrades, initialCreatures } from '@/lib/data';
import PerformanceCharts from '@/components/dashboard/performance-charts';
import NewTradeDialog from '@/components/dashboard/new-trade-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import TradeDetailDialog from '@/components/dashboard/trade-detail-dialog';
import { Switch } from '@/components/ui/switch';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import WithdrawalDialog from '@/components/dashboard/withdrawal-dialog';
import AddBalanceDialog from '@/components/dashboard/add-balance-dialog';
import { useLeveling } from '@/hooks/use-leveling';
import RecentTrades from '@/components/dashboard/recent-trades';
import { Sidebar, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarFooter, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import StrategyPerformance from '@/components/dashboard/strategy-performance';
import PairAssertiveness from '@/components/dashboard/pair-assertiveness';

const StatCard = ({ title, value, description, valueColor }: { title: string; value: string; description?: string; valueColor?: string }) => (
    <Card className="bg-card">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className={cn("text-2xl font-bold", valueColor)}>{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balanceAdditions, setBalanceAdditions] = useState<BalanceAddition[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({ startDate: new Date().toISOString(), class: undefined, xp: 0 });
  const [creatures, setCreatures] = useState<Creature[]>([]);

  const [timeRange, setTimeRange] = useState<TimeRange>('anual');
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  
  const loadAllData = () => {
    const storedTrades = localStorage.getItem('trades');
    setTrades(storedTrades ? JSON.parse(storedTrades) : []);
    
    const storedWithdrawals = localStorage.getItem('withdrawals');
    setWithdrawals(storedWithdrawals ? JSON.parse(storedWithdrawals) : []);
    
    const storedBalanceAdditions = localStorage.getItem('balanceAdditions');
    setBalanceAdditions(storedBalanceAdditions ? JSON.parse(storedBalanceAdditions) : []);
    
    const storedPlayerStats = localStorage.getItem('playerStats');
    setPlayerStats(storedPlayerStats ? JSON.parse(storedPlayerStats) : { startDate: new Date().toISOString(), class: undefined, xp: 0 });
    
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    if (storedCreatures) {
      setCreatures(JSON.parse(storedCreatures));
    } else {
      setCreatures(initialCreatures);
      localStorage.setItem('bestiaryCreatures', JSON.stringify(initialCreatures));
    }

    const isDataInitialized = localStorage.getItem('data_initialized');
    if (!isDataInitialized) {
        setTrades(initialTrades);
        localStorage.setItem('trades', JSON.stringify(initialTrades));
        setCreatures(initialCreatures);
        localStorage.setItem('bestiaryCreatures', JSON.stringify(initialCreatures));
        localStorage.setItem('data_initialized', 'true');
    }
  };


  useEffect(() => {
    loadAllData();

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    }

     const handleStorageChange = (e: StorageEvent) => {
        const keysToWatch = ['trades', 'withdrawals', 'balanceAdditions', 'playerStats', 'bestiaryCreatures'];
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade = { ...trade, id: crypto.randomUUID() };
    const newTrades = [newTrade, ...trades];
    setTrades(newTrades);
    localStorage.setItem('trades', JSON.stringify(newTrades));

    if (trade.creatureId && trade.status === 'win') {
        setCreatures(prevCreatures => {
            const newCreatures = prevCreatures.map(c => {
                if (c.id === trade.creatureId) {
                    const newEncounter = { id: crypto.randomUUID(), date: new Date().toISOString() };
                    return {...c, encounters: [...c.encounters, newEncounter]};
                }
                return c;
            });
            localStorage.setItem('bestiaryCreatures', JSON.stringify(newCreatures));
            return newCreatures;
        });
        toast({
            title: "¡Bestia Cazada!",
            description: `Has registrado un nuevo encuentro. Revisa tu bestiario y logros.`
        })
    }
  };


  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      switch (timeRange) {
        case 'daily':
          return tradeDate.toDateString() === now.toDateString();
        case 'monthly':
          return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
        case 'anual':
          return tradeDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [trades, timeRange]);

  const activities = useMemo((): Activity[] => {
    const combined = [
        ...trades.map(t => ({...t, type: 'trade'} as const)),
        ...withdrawals.map(w => ({...w, type: 'withdrawal'} as const)),
        ...balanceAdditions.map(b => ({...b, type: 'balance'} as const)),
    ];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, withdrawals, balanceAdditions]);

  const { gains, losses, netProfit, winRate, totalTrades, totalWithdrawals, totalBalanceAdditions } = useMemo(() => {
    const tradesToAnalyze = filteredTrades.filter(t => t.status === 'win' || t.status === 'loss');
    const gains = tradesToAnalyze.filter(t => t.status === 'win').reduce((acc, t) => acc + t.profit, 0);
    const losses = tradesToAnalyze.filter(t => t.status === 'loss').reduce((acc, t) => acc + t.profit, 0);
    const totalWithdrawals = withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const totalBalanceAdditions = balanceAdditions.reduce((acc, b) => acc + b.amount, 0);
    const netProfit = totalBalanceAdditions + gains + losses - totalWithdrawals;
    const winningTrades = tradesToAnalyze.filter(t => t.status === 'win').length;
    const totalTradable = tradesToAnalyze.length;
    const winRate = totalTradable > 0 ? (winningTrades / totalTradable) * 100 : 0;
    return { gains, losses, netProfit, winRate, totalTrades: filteredTrades.length, totalWithdrawals, totalBalanceAdditions };
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

  const navItems = [
      { href: "/", label: "Dashboard", icon: LayoutGrid },
      { href: "/bestiario", label: "Bestiario", icon: BookHeart },
      { href: "/misiones", label: "Misiones", icon: Gamepad2 },
      { href: "/obligatorio", label: "Obligatorio", icon: ClipboardCheck },
      { href: "/journal", label: "Bitácora", icon: BookOpen },
      { href: "/gremio", label: "Gremio", icon: BookOpen, color: 'bg-purple-600 dark:bg-purple-600' },
      { href: "/tienda", label: "Tienda", icon: Trophy, color: 'bg-amber-500' },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Shield className="h-6 w-6 text-primary" /></Button>
            <span className="text-lg font-semibold text-foreground">Olimpo Wallet</span>
          </div>
          <SidebarTrigger className="absolute top-3.5 right-2" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                        <SidebarMenuButton 
                         isActive={item.label === 'Dashboard'}
                         className={cn(item.color && !isDarkMode ? `${item.color} text-white` : '', item.color && isDarkMode ? `${item.color} text-white` : '')}
                        >
                            <item.icon/>
                            {item.label}
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='items-center'>
            <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5" />
                <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    />
                <Moon className="h-5 w-5" />
            </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Una vista detallada de tu situación financiera</p>
                </div>
                 <div className="flex items-center gap-2 flex-wrap">
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
                     <Button onClick={() => setIsNewTradeOpen(true)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="mr-2 h-4 w-4"/>
                        Nueva Operación
                     </Button>
                      <Button onClick={() => setIsAddBalanceOpen(true)} size="sm" variant="outline">
                        Añadir Saldo
                     </Button>
                      <Button onClick={() => setIsWithdrawalOpen(true)} size="sm" variant="outline">
                        Registrar Retiro
                     </Button>
                </div>
            </header>

            <main className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Beneficio Neto" value={formatCurrency(netProfit)} description={`${totalTrades} operaciones`} valueColor={netProfit >= 0 ? "text-green-500" : "text-red-500"}/>
                    <StatCard title="Ganancias" value={formatCurrency(gains)} description={`${filteredTrades.filter(t => t.status === 'win').length} operaciones ganadas`} valueColor="text-green-500" />
                    <StatCard title="Pérdidas" value={formatCurrency(Math.abs(losses))} description={`${filteredTrades.filter(t => t.status === 'loss').length} operaciones perdidas`} valueColor="text-red-500" />
                </div>
                
                <PerformanceCharts trades={trades} balanceAdditions={balanceAdditions} withdrawals={withdrawals} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StrategyPerformance trades={trades} />
                  <PairAssertiveness trades={trades} />
                </div>

                <RecentTrades activities={activities} creatures={creatures} onDeleteTrade={handleDeleteTrade} onDeleteWithdrawal={handleDeleteWithdrawal} onDeleteBalance={handleDeleteBalance} onSelectTrade={handleSelectTrade} formatCurrency={formatCurrency} />

            </main>
        </div>
      </SidebarInset>
      
      <NewTradeDialog isOpen={isNewTradeOpen} onOpenChange={setIsNewTradeOpen} onAddTrade={handleAddTrade} creatures={creatures} />
      <WithdrawalDialog isOpen={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen} onAddWithdrawal={handleAddWithdrawal} />
      <AddBalanceDialog isOpen={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen} onAddBalance={handleAddBalance} />
      <TradeDetailDialog trade={selectedTrade} isOpen={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)} formatCurrency={formatCurrency} />
    </SidebarProvider>
  );
}
