"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Plus, BarChart3, TrendingUp, Calendar, Bot, FileDown, Instagram, Youtube, Facebook } from 'lucide-react';
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

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('anual');
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedTrades = localStorage.getItem('trades');
    if (storedTrades) {
      setTrades(JSON.parse(storedTrades));
    } else {
      setTrades(initialTrades);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
  }, [trades]);

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

  const exportToCsv = () => {
    const headers = ['ID', 'Descripción', 'Estado', 'Pips', 'Lote', 'Beneficio', 'Fecha', 'Estrategia', 'Notas'];
    const rows = trades.map(trade => [
      trade.id,
      `"${trade.pair.replace(/"/g, '""')}"`,
      trade.status,
      trade.pips ?? '',
      trade.lotSize ?? '',
      trade.profit,
      new Date(trade.date).toLocaleString('es-ES'),
      trade.strategy ?? '',
      `"${trade.notes?.replace(/"/g, '""') ?? ''}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_trades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportación Completa",
      description: "Tu historial de trades ha sido exportado a CSV.",
    });
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Image src="/logo.png" alt="Olimpo Trade Academy Logo" width={40} height={40} className="mr-3" />
                Olimpo Trade Academy
              </h1>
              <p className="text-gray-600 mt-2">Registra y analiza tus operaciones de trading con métricas detalladas</p>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={exportToCsv} variant="outline" className="transition-all transform hover:scale-105 shadow-lg">
                <FileDown className="h-5 w-5 mr-2"/>
                Exportar CSV
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
             <Alert className="mb-6 bg-blue-50 border-blue-200">
               <Terminal className="h-4 w-4" />
               <AlertTitle className="text-blue-800 font-semibold">Análisis de Trading con IA</AlertTitle>
               <AlertDescription className="text-blue-700 whitespace-pre-wrap">
                 {aiAnalysisResult}
               </AlertDescription>
             </Alert>
          )}

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {(['Diario', 'Mensual', 'Anual'] as const).map(range => {
              const rangeKey = range.toLowerCase().replace('anual', 'anual') as TimeRange;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(rangeKey)}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all",
                    timeRange === rangeKey
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
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
            <StatCard title="Ganancias" value={formatCurrency(gains)} icon={<TrendingUp className="h-6 w-6 text-green-600" />} iconBgClass="bg-green-50" valueColorClass="text-green-600" />
            <StatCard title="Pérdidas" value={formatCurrency(Math.abs(losses))} icon={<TrendingUp className="h-6 w-6 text-red-600 rotate-180" />} iconBgClass="bg-red-50" valueColorClass="text-red-600" />
            <StatCard title="Beneficio Neto" value={formatCurrency(netProfit)} icon={<BarChart3 className="h-6 w-6 text-primary" />} iconBgClass="bg-blue-50" valueColorClass={netProfit >= 0 ? "text-green-600" : "text-red-600"} />
            <StatCard title="Tasa de Éxito" value={`${winRate.toFixed(1)}%`} description={`${totalTrades} operaciones`} icon={<BarChart3 className="h-6 w-6 text-accent-foreground" />} iconBgClass="bg-yellow-50" valueColorClass={winRate > 50 ? "text-green-600" : "text-red-600"} />
          </div>

          <div className="space-y-8">
            <StrategyPerformance trades={filteredTrades} />
            <PerformanceCharts trades={filteredTrades} />
            <RecentTrades trades={trades} onDeleteTrade={handleDeleteTrade} onSelectTrade={handleSelectTrade} formatCurrency={formatCurrency} />
          </div>
        </div>
      </div>
       <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-4">
            Síguenos en todas las redes como @olimpotradeacademy
            <a href="https://instagram.com/olimpotradeacademy" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://youtube.com/@olimpotradeacademy" target="_blank" rel="noopener noreferrer"><Youtube className="h-5 w-5 hover:text-primary" /></a>
            <a href="https://facebook.com/olimpotradeacademy" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5 hover:text-primary" /></a>
          </p>
        </div>
      </footer>
      <NewTradeDialog isOpen={isNewTradeOpen} onOpenChange={setIsNewTradeOpen} onAddTrade={handleAddTrade} />
      <TradeDetailDialog trade={selectedTrade} isOpen={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)} formatCurrency={formatCurrency} />
    </>
  );
}
