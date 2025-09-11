"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Plus, BarChart3, TrendingUp, Calendar, Bot, FileDown, Instagram, Youtube, Facebook, Moon, Sun, BookOpen, Target, Award, Layers3, ClipboardCheck, Percent, Banknote, Landmark, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Trade, type Withdrawal, type Activity, type BalanceAddition } from '@/lib/types';
import { initialTrades } from '@/lib/data';
import StatCard from '@/components/dashboard/stat-card';
import RecentTrades from '@/components/dashboard/recent-trades';
import PerformanceCharts from '@/components/dashboard/performance-charts';
import NewTradeDialog from '@/components/dashboard/new-trade-dialog';
import { cn } from '@/lib/utils';
import { analyzeTrades } from '@/ai/flows/ai-powered-trade-analysis';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import StrategyPerformance from '@/components/dashboard/strategy-performance';
import TradeDetailDialog from '@/components/dashboard/trade-detail-dialog';
import TimezoneClock from '@/components/dashboard/timezone-clock';
import { Switch } from '@/components/ui/switch';
import * as XLSX from 'xlsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import CurrencyConverter from '@/components/dashboard/currency-converter';
import WithdrawalDialog from '@/components/dashboard/withdrawal-dialog';
import WithdrawalsDashboard from '@/components/dashboard/withdrawals-dashboard';
import PairAssertiveness from '@/components/dashboard/pair-assertiveness';
import AddBalanceDialog from '@/components/dashboard/add-balance-dialog';


const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 7.4V12a4 4 0 0 1-4 4H8" />
    <path d="M12 16V4a4 4 0 0 1 4 4v0" />
    <path d="M4 12a4 4 0 0 0 4 4h0" />
    <circle cx="8.5" cy="8.5" r="0.5" fill="currentColor" />
    <circle cx="16.5" cy="4.5" r="0.5" fill="currentColor" />
  </svg>
);


const DisciplineDashboard = ({ trades }: { trades: Trade[] }) => {
  const { averageRating, totalRated } = useMemo(() => {
    const ratedTrades = trades.filter(t => t.discipline != null && t.discipline > 0);
    if (ratedTrades.length === 0) {
      return { averageRating: 0, totalRated: 0 };
    }
    const totalRating = ratedTrades.reduce((acc, t) => acc + (t.discipline || 0), 0);
    return {
      averageRating: totalRating / ratedTrades.length,
      totalRated: ratedTrades.length,
    };
  }, [trades]);

  const getDisciplineMessage = (rating: number) => {
    if (rating >= 4.5) return "¡Excelente! Mantén esa disciplina de hierro.";
    if (rating >= 4) return "Muy bien. Sigues el plan de forma consistente.";
    if (rating >= 3) return "Buen trabajo, pero hay espacio para mejorar la consistencia.";
    if (rating >= 2) return "Atención. Revisa tus reglas y apégate a ellas.";
    return "Necesitas un plan de acción. La disciplina es clave.";
  };

  if (totalRated === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center">
            <Award className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard de Disciplina</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
               <p className="text-sm text-muted-foreground mb-2">Tu calificación promedio de disciplina</p>
               <div className="text-4xl font-bold text-primary mb-2">{averageRating.toFixed(1)} / 5</div>
               <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{getDisciplineMessage(averageRating)}</p>
               <p className="text-xs text-muted-foreground mt-4">Basado en {totalRated} operaciones calificadas.</p>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balanceAdditions, setBalanceAdditions] = useState<BalanceAddition[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('anual');
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedTrades = localStorage.getItem('trades');
    if (storedTrades) {
      setTrades(JSON.parse(storedTrades));
    } else {
      setTrades(initialTrades);
    }
    const storedWithdrawals = localStorage.getItem('withdrawals');
    if (storedWithdrawals) {
      setWithdrawals(JSON.parse(storedWithdrawals));
    }
     const storedBalanceAdditions = localStorage.getItem('balanceAdditions');
    if (storedBalanceAdditions) {
      setBalanceAdditions(JSON.parse(storedBalanceAdditions));
    }
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
  }, [trades]);
  
  useEffect(() => {
    localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);
  
  useEffect(() => {
    localStorage.setItem('balanceAdditions', JSON.stringify(balanceAdditions));
  }, [balanceAdditions]);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
    const formatted = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return `${formatted}\u00A0US$`;
  };

  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade = { ...trade, id: crypto.randomUUID() };
    setTrades(prevTrades => [newTrade, ...prevTrades]);
  };
  
  const handleAddWithdrawal = (withdrawal: Omit<Withdrawal, 'id' | 'date'>) => {
    const newWithdrawal = { ...withdrawal, id: crypto.randomUUID(), date: new Date().toISOString() };
    setWithdrawals(prev => [newWithdrawal, ...prev]);
    toast({
        title: "Retiro Registrado",
        description: "Tu retiro ha sido guardado exitosamente."
    })
  }

  const handleAddBalance = (balance: Omit<BalanceAddition, 'id' | 'date'>) => {
    const newBalance = { ...balance, id: crypto.randomUUID(), date: new Date().toISOString() };
    setBalanceAdditions(prev => [newBalance, ...prev]);
    toast({
        title: "Saldo Añadido",
        description: "Tu nuevo saldo ha sido registrado exitosamente."
    })
  }

  const handleDeleteTrade = (id: string) => {
    setTrades(prevTrades => prevTrades.filter(t => t.id !== id));
  };

  const handleDeleteWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.filter(w => w.id !== id));
  }

  const handleDeleteBalance = (id: string) => {
    setBalanceAdditions(prev => prev.filter(b => b.id !== id));
  }

  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrade(trade);
  }
  
  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const result = await analyzeTrades({ tradeData: JSON.stringify(trades) });
      setAiAnalysisResult(result.analysis);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Error de Análisis IA",
        description: "No se pudo obtener el análisis. Inténtalo de nuevo.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const exportToXlsx = () => {
    const dataToExport = trades.map(trade => ({
        'ID': trade.id,
        'Divisa': trade.pair,
        'Resultado': trade.status,
        'Pips': trade.pips ?? '',
        'Lote': trade.lotSize ?? '',
        'Beneficio (US$)': trade.profit,
        'Fecha': new Date(trade.date).toLocaleString('es-ES'),
        'Estrategia': trade.strategy ?? '',
        'Notas': trade.notes ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial de Trades");

    XLSX.writeFile(workbook, "historial_trades.xlsx");

    toast({
      title: "Exportación Completa",
      description: "Tu historial de trades ha sido exportado a un archivo XLSX.",
    });
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Image src="/logo.png" alt="Olimpo Wallet Logo" width={40} height={40} className="mr-3 rounded-full" />
                Olimpo Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Registra y analiza tus operaciones de trading con métricas detalladas</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap">
                <div className='flex gap-2'>
                    <Link href="/bestiario">
                        <Button variant="outline" className="transition-all transform hover:scale-105 shadow-lg bg-purple-500 hover:bg-purple-600 text-white">
                        <BookHeart className="h-5 w-5 mr-2" />
                        Bestiario
                        </Button>
                    </Link>
                    <Link href="/obligatorio">
                        <Button variant="outline" className="transition-all transform hover:scale-105 shadow-lg bg-orange-500 hover:bg-orange-600 text-white">
                        <ClipboardCheck className="h-5 w-5 mr-2" />
                        Obligatorio
                        </Button>
                    </Link>
                    <Link href="/journal">
                        <Button variant="outline" className="transition-all transform hover:scale-105 shadow-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Bitácora
                        </Button>
                    </Link>
                </div>
               <div className="flex items-center space-x-2">
                 <Sun className="h-5 w-5" />
                 <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                 <Moon className="h-5 w-5" />
               </div>
               <div className='flex gap-2'>
                    <Button onClick={exportToXlsx} variant="outline" className="transition-all transform hover:scale-105 shadow-lg">
                        <FileDown className="h-5 w-5 mr-2"/>
                        Exportar XLSX
                    </Button>
                    <Button onClick={handleAiAnalysis} disabled={isAiLoading} variant="outline" className="transition-all transform hover:scale-105 shadow-lg">
                        <Bot className="h-5 w-5 mr-2"/>
                        {isAiLoading ? "Analizando..." : "Análisis IA"}
                    </Button>
               </div>
              <Button onClick={() => setIsAddBalanceOpen(true)} className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg px-6 py-3 w-full sm:w-auto">
                <Landmark className="h-5 w-5 mr-2" />
                Añadir Saldo
              </Button>
              <Button onClick={() => setIsWithdrawalOpen(true)} className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg px-6 py-3 w-full sm:w-auto">
                <Banknote className="h-5 w-5 mr-2" />
                Registrar Retiro
              </Button>
              <Button onClick={() => setIsNewTradeOpen(true)} className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg px-6 py-3 w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Nueva Operación
              </Button>
            </div>
          </header>
          
          {aiAnalysisResult && (
             <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
               <Terminal className="h-4 w-4" />
               <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">Análisis de Trading con IA</AlertTitle>
               <AlertDescription className="text-blue-700 dark:text-blue-400 whitespace-pre-wrap">
                 {aiAnalysisResult}
               </AlertDescription>
             </Alert>
          )}

          <div className="flex bg-gray-100 dark:bg-neutral-900 rounded-lg p-1 mb-6">
            {(['Diario', 'Mensual', 'Anual'] as const).map(range => {
              const rangeKey = range.toLowerCase().replace('anual', 'anual') as TimeRange;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(rangeKey)}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all",
                    timeRange === rangeKey
                      ? "bg-white dark:bg-black shadow-sm text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-800/50"
                  )}
                >
                  {range === 'Diario' && <Calendar className="h-4 w-4 mr-2" />}
                  {range === 'Mensual' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {range === 'Anual' && <TrendingUp className="h-4 w-4 mr-2" />}
                  {range}
                </button>
              )
            })}
          </div>
          
          <TimezoneClock />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            <StatCard title="Ganancias" value={formatCurrency(gains)} icon={<TrendingUp className="h-6 w-6 text-green-600" />} iconBgClass="bg-green-100 dark:bg-green-900/20" valueColorClass="text-green-600 dark:text-green-400" />
            <StatCard title="Pérdidas" value={formatCurrency(Math.abs(losses))} icon={<TrendingUp className="h-6 w-6 text-red-600 rotate-180" />} iconBgClass="bg-red-100 dark:bg-red-900/20" valueColorClass="text-red-600 dark:text-red-400" />
            <StatCard title="Beneficio Neto" value={formatCurrency(netProfit)} description={`Depósitos: ${formatCurrency(totalBalanceAdditions)} | Retiros: ${formatCurrency(totalWithdrawals)}`} icon={<BarChart3 className="h-6 w-6 text-primary" />} iconBgClass="bg-blue-100 dark:bg-blue-900/20" valueColorClass={netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
            <StatCard title="Tasa de Éxito" value={`${winRate.toFixed(1)}%`} description={`${totalTrades} operaciones`} icon={<Percent className="h-6 w-6 text-yellow-500" />} iconBgClass="bg-yellow-100 dark:bg-yellow-900/20" valueColorClass="text-yellow-600 dark:text-yellow-400" />
          </div>

          <div className="space-y-8">
            <CurrencyConverter />
            <WithdrawalsDashboard withdrawals={withdrawals} formatCurrency={formatCurrency} />
            <DisciplineDashboard trades={filteredTrades} />
            <StrategyPerformance trades={filteredTrades} />
            <PairAssertiveness trades={filteredTrades} />
            <PerformanceCharts trades={filteredTrades} />
            <RecentTrades activities={activities} onDeleteTrade={handleDeleteTrade} onDeleteWithdrawal={handleDeleteWithdrawal} onDeleteBalance={handleDeleteBalance} onSelectTrade={handleSelectTrade} formatCurrency={formatCurrency} />
          </div>
        </div>
      </div>
       <footer className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-4">
            Síguenos en todas las redes como @olimpo.trading
            <a href="https://instagram.com/olimpo.trading" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://youtube.com/@olimpo.trading" target="_blank" rel="noopener noreferrer"><Youtube className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://facebook.com/olimpo.trading" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://tiktok.com/@olimpo.trading" target="_blank" rel="noopener noreferrer"><TikTokIcon className="h-5 w-5 hover:text-primary" /></a>
          </p>
        </div>
      </footer>
      <NewTradeDialog isOpen={isNewTradeOpen} onOpenChange={setIsNewTradeOpen} onAddTrade={handleAddTrade} />
      <WithdrawalDialog isOpen={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen} onAddWithdrawal={handleAddWithdrawal} />
      <AddBalanceDialog isOpen={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen} onAddBalance={handleAddBalance} />
      <TradeDetailDialog trade={selectedTrade} isOpen={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)} formatCurrency={formatCurrency} />
    </>
  );
}
