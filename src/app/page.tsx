"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Plus, BarChart3, TrendingUp, Calendar, Bot, FileDown, Instagram, Youtube, Facebook, Moon, Sun, BookOpen, Target, Award, Layers3 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="currentColor" {...props}>
    <path d="M22.7,6.01c-0.08-0.01-0.16-0.01-0.24-0.02c-1.83-0.2-3.58-0.78-5.13-1.67c-0.12-0.07-0.25-0.15-0.38-0.23c-0.04-0.03-0.09-0.05-0.13-0.08c-0.56-0.37-1.07-0.8-1.52-1.28c-0.13-0.14-0.26-0.28-0.38-0.43C14.82,2.14,14.7,2,14.56,2c-0.1,0-0.2,0.07-0.26,0.16c-0.28,0.44-0.53,0.9-0.74,1.37c-0.02,0.05-0.05,0.1-0.07,0.15c-0.58,1.2-0.96,2.49-1.09,3.81c-0.01,0.06-0.01,0.12-0.02,0.18c-0.01,0.13-0.02,0.26-0.02,0.39v9.08c0,0.08,0,0.15,0.01,0.23c0.16,1.49,0.6,2.92,1.29,4.24c0.1,0.19,0.22,0.38,0.35,0.56c0.14,0.19,0.3,0.37,0.46,0.54c0.23,0.24,0.47,0.46,0.73,0.67c0.2,0.16,0.4,0.3,0.6,0.43c0.13,0.08,0.26,0.16,0.39,0.23c1.7,1.03,3.61,1.6,5.6,1.66c0.01,0,0.02,0,0.03,0c0.1,0,0.19-0.05,0.25-0.13c0.05-0.07,0.07-0.16,0.05-0.25c-0.07-0.43-0.15-0.85-0.24-1.28c-0.01-0.06-0.03-0.11-0.05-0.17c-0.44-1.12-0.66-2.29-0.66-3.48v-2.58c0-0.01,0-0.02,0-0.03c0.02-1.63,0.35-3.23,0.99-4.75c0.05-0.12,0.1-0.23,0.15-0.35c0.24-0.51,0.5-1,0.78-1.48c0.03-0.05,0.06-0.1,0.08-0.15c0.14-0.32,0.28-0.63,0.41-0.95c0.02-0.05,0.04-0.09,0.06-0.14c0.25-0.6,0.46-1.18,0.59-1.78c0.01-0.05,0.02-0.1,0.03-0.15c0.1-0.5,0.16-1,0.18-1.5c0-0.1-0.05-0.19-0.12-0.24c-0.05-0.03-0.1-0.05-0.15-0.05c-0.02,0-0.03,0-0.05,0l-2.73-0.01c-0.11,0-0.21,0.06-0.27,0.16c-0.1,0.17-0.21,0.34-0.32,0.51c-0.04,0.06-0.08,0.12-0.12,0.18c-0.78,1.15-1.84,2.1-3.09,2.78c-0.05,0.03-0.1,0.05-0.15,0.08c-0.5,0.28-1.02,0.52-1.56,0.71c-0.13,0.05-0.27,0.09-0.4,0.13c-1.3,0.41-2.65,0.62-4.01,0.62c-0.1,0-0.19-0.05-0.25-0.13c-0.05-0.07-0.07-0.16-0.05-0.24c0.03-0.19,0.07-0.39,0.11-0.58c0.01-0.03,0.02-0.05,0.03-0.08c0.19-0.8,0.47-1.58,0.82-2.33c0.1-0.22,0.21-0.43,0.32-0.65c0.18-0.35,0.38-0.69,0.58-1.03c0.03-0.05,0.06-0.1,0.09-0.15c0.39-0.65,0.82-1.27,1.29-1.86c0.06-0.08,0.12-0.15,0.18-0.22c0.3-0.32,0.61-0.62,0.93-0.91c0.02-0.02,0.03-0.03,0.05-0.05c0.16-0.15,0.32-0.29,0.48-0.43c0.04-0.03,0.07-0.06,0.11-0.09c0.4-0.35,0.82-0.67,1.25-0.97c0.23-0.16,0.46-0.31,0.7-0.45c0.15-0.09,0.3-0.17,0.45-0.25C18.42,7,19.26,6.57,20.13,6.2c0.08-0.03,0.15-0.07,0.23-0.1c0.5-0.19,1-0.34,1.5-0.45C22.25,5.52,22.5,5.5,22.75,5.5c0.11,0,0.2,0.06,0.26,0.16c0.04,0.08,0.05,0.16,0.01,0.24C22.9,5.95,22.8,5.98,22.7,6.01z"/>
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
        'Divisa': trade.pair,
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
            <DisciplineDashboard trades={filteredTrades} />
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
