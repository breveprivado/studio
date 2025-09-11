"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Plus, BarChart3, TrendingUp, Calendar, Bot, FileDown, Instagram, Youtube, Facebook, Moon, Sun, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Trade, type TimeRange } from '@/lib/types';
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
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16.6 5.82s.51.5 0 0A4.24 4.24 0 0 1 12.09 10v6.1a4.21 4.21 0 1 1-4.21-4.21c.1 0 .21.05.32.05s.21-.05.32-.05V7.82a10.61 10.61 0 1 0 10.61 10.61C18.16 12.51 16.6 5.82 16.6 5.82Z"/>
  </svg>
);

const PairAssertiveness = ({ trades }: { trades: Trade[] }) => {
  const assertivenessByPair = useMemo(() => {
    const pairStats: { [key: string]: { wins: number; total: number } } = {};
    trades.forEach(trade => {
      if (!pairStats[trade.pair]) {
        pairStats[trade.pair] = { wins: 0, total: 0 };
      }
      pairStats[trade.pair].total++;
      if (trade.status === 'win') {
        pairStats[trade.pair].wins++;
      }
    });

    return Object.entries(pairStats).map(([pair, stats]) => ({
      pair,
      winRate: (stats.wins / stats.total) * 100,
      total: stats.total,
    })).sort((a,b) => b.winRate - a.winRate);
  }, [trades]);

  if (assertivenessByPair.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center">
            <Target className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Asertividad por Divisa</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {assertivenessByPair.map(item => (
                  <div key={item.pair}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.pair} ({item.total} trades)</span>
                      <span className="text-sm font-semibold text-primary">{item.winRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.winRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('anual');
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
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

  const { gains, losses, netProfit, winRate, totalTrades } = useMemo(() => {
    const tradesToAnalyze = filteredTrades;
    const gains = tradesToAnalyze.filter(t => t.status === 'win').reduce((acc, t) => acc + t.profit, 0);
    const losses = tradesToAnalyze.filter(t => t.status === 'loss').reduce((acc, t) => acc + t.profit, 0);
    const netProfit = gains + losses;
    const winningTrades = tradesToAnalyze.filter(t => t.status === 'win').length;
    const totalTrades = tradesToAnalyze.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    return { gains, losses, netProfit, winRate, totalTrades };
  }, [filteredTrades]);

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

  const handleDeleteTrade = (id: string) => {
    setTrades(prevTrades => prevTrades.filter(t => t.id !== id));
  };

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
        'Descripción': trade.pair,
        'Resultado': trade.status === 'win' ? 'Ganada' : 'Perdida',
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
          <header className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Image src="/logo.png" alt="Olimpo Trade Academy Logo" width={40} height={40} className="mr-3 rounded-full" />
                Olimpo Trade Academy
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Registra y analiza tus operaciones de trading con métricas detalladas</p>
            </div>
            <div className="flex items-center gap-4">
               <Link href="/journal">
                 <Button variant="outline" className="transition-all transform hover:scale-105 shadow-lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Bitácora
                 </Button>
               </Link>
               <div className="flex items-center space-x-2">
                 <Sun className="h-5 w-5" />
                 <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                 <Moon className="h-5 w-5" />
               </div>
               <Button onClick={exportToXlsx} variant="outline" className="transition-all transform hover:scale-105 shadow-lg">
                <FileDown className="h-5 w-5 mr-2"/>
                Exportar XLSX
              </Button>
              <Button onClick={handleAiAnalysis} disabled={isAiLoading} variant="outline" className="transition-all transform hover:scale-105 shadow-lg">
                <Bot className="h-5 w-5 mr-2"/>
                {isAiLoading ? "Analizando..." : "Análisis IA"}
              </Button>
              <Button onClick={() => setIsNewTradeOpen(true)} className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg px-6 py-3">
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
            <StatCard title="Beneficio Neto" value={formatCurrency(netProfit)} icon={<BarChart3 className="h-6 w-6 text-primary" />} iconBgClass="bg-blue-100 dark:bg-blue-900/20" valueColorClass={netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
            <StatCard title="Tasa de Éxito" value={`${winRate.toFixed(1)}%`} description={`${totalTrades} operaciones`} icon={<BarChart3 className="h-6 w-6 text-accent-foreground" />} iconBgClass="bg-yellow-100 dark:bg-yellow-900/20" valueColorClass={winRate > 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
          </div>

          <div className="space-y-8">
            <StrategyPerformance trades={filteredTrades} />
            <PairAssertiveness trades={filteredTrades} />
            <PerformanceCharts trades={filteredTrades} />
            <RecentTrades trades={trades} onDeleteTrade={handleDeleteTrade} onSelectTrade={handleSelectTrade} formatCurrency={formatCurrency} />
          </div>
        </div>
      </div>
       <footer className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-4">
            Síguenos en todas las redes como @olimpotradeacademy
            <a href="https://instagram.com/olimpotradeacademy" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://youtube.com/@olimpotradeacademy" target="_blank" rel="noopener noreferrer"><Youtube className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://facebook.com/olimpotradeacademy" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://tiktok.com/@olimpotradeacademy" target="_blank" rel="noopener noreferrer"><TikTokIcon className="h-5 w-5 hover:text-primary" /></a>
          </p>
        </div>
      </footer>
      <NewTradeDialog isOpen={isNewTradeOpen} onOpenChange={setIsNewTradeOpen} onAddTrade={handleAddTrade} />
      <TradeDetailDialog trade={selectedTrade} isOpen={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)} formatCurrency={formatCurrency} />
    </>
  );
}
