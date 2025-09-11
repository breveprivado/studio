"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '@/lib/types';
import { Layers3 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"


interface StrategyPerformanceProps {
  trades: Trade[];
}

const StrategyPerformance: React.FC<StrategyPerformanceProps> = ({ trades }) => {

  const strategyData = useMemo(() => {
    const strategies: { [key: string]: { wins: number; total: number } } = {};

    trades.forEach(trade => {
      if (trade.strategy) {
        if (!strategies[trade.strategy]) {
          strategies[trade.strategy] = { wins: 0, total: 0 };
        }
        strategies[trade.strategy].total++;
        if (trade.status === 'win') {
          strategies[trade.strategy].wins++;
        }
      }
    });

    return Object.entries(strategies).map(([name, data]) => ({
      name,
      winRate: (data.wins / data.total) * 100,
      total: data.total
    })).sort((a, b) => b.winRate - a.winRate);

  }, [trades]);

  if (strategyData.length === 0) {
    return null;
  }

  return (
     <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
           <div className="flex items-center">
             <Layers3 className="h-6 w-6 text-primary mr-3" />
             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Rendimiento por Estrategia</h2>
           </div>
        </AccordionTrigger>
        <AccordionContent>
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <CardContent className="pt-6">
                 <div className="space-y-4">
                    {strategyData.map(strategy => (
                        <div key={strategy.name}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{strategy.name} ({strategy.total} trades)</span>
                            <span className="text-sm font-semibold text-primary">{strategy.winRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={strategy.winRate} className="h-2" />
                        </div>
                    ))}
                 </div>
                </CardContent>
            </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default StrategyPerformance;
