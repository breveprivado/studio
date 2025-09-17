"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Trade } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface WorstPairAssertivenessProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold text-base">{label}</p>
          <p className="text-sm text-destructive">{`Pérdida Total: $${Math.abs(data.totalLoss).toFixed(2)}`}</p>
          <p className="text-sm text-muted-foreground">{`Operaciones perdedoras: ${data.lossCount}`}</p>
        </div>
      );
    }
    return null;
};

const WorstPairAssertiveness: React.FC<WorstPairAssertivenessProps> = ({ trades }) => {
  const assertivenessByPair = useMemo(() => {
    const pairStats: { [key: string]: { totalLoss: number; lossCount: number } } = {};
    trades.forEach(trade => {
      if (trade.status === 'loss') {
        if (!pairStats[trade.pair]) {
          pairStats[trade.pair] = { totalLoss: 0, lossCount: 0 };
        }
        pairStats[trade.pair].totalLoss += trade.profit;
        pairStats[trade.pair].lossCount++;
      }
    });

    return Object.entries(pairStats).map(([pair, stats]) => ({
      name: pair,
      totalLoss: stats.totalLoss,
      lossCount: stats.lossCount,
    })).sort((a,b) => a.totalLoss - b.totalLoss); // Sorts by most negative profit
  }, [trades]);

  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-6">
            <div className="flex flex-col items-start text-left">
              <CardTitle>Divisas con Mayor Pérdida</CardTitle>
              <CardDescription>Los pares de divisas que te generan mayores pérdidas.</CardDescription>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {assertivenessByPair.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={assertivenessByPair} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                      <XAxis 
                          dataKey="name" 
                          fontSize={12}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                          fontSize={12} 
                          tickFormatter={(value) => `$${Math.abs(value)}`}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 4 }} />
                      <Bar 
                          dataKey="totalLoss" 
                          fill="hsl(var(--destructive))" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                          name="Pérdida Total"
                      />
                  </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    No se han registrado operaciones perdedoras.
                </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default WorstPairAssertiveness;
