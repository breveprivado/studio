"use client";

import React, { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trade } from '@/lib/types';


interface PairAssertivenessProps {
  trades: Trade[];
}

const PairAssertiveness: React.FC<PairAssertivenessProps> = ({ trades }) => {
  const assertivenessByPair = useMemo(() => {
    const pairStats: { [key: string]: { wins: number; total: number } } = {};
    trades.forEach(trade => {
      if (trade.status !== 'win' && trade.status !== 'loss') return;
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
  );
};

export default PairAssertiveness;
