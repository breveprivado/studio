"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { Trade } from '@/lib/types';

interface PairAssertivenessProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold text-base">{label}</p>
          <p className="text-sm text-primary">{`Asertividad: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
};

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
      name: pair,
      winRate: (stats.wins / stats.total) * 100,
    })).sort((a,b) => b.winRate - a.winRate);
  }, [trades]);

  if (assertivenessByPair.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Asertividad por Divisa</CardTitle>
                <CardDescription>Tu tasa de acierto para cada par de divisas.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    No hay datos suficientes para mostrar.
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Asertividad por Divisa</CardTitle>
            <CardDescription>Tu tasa de acierto para cada par de divisas.</CardDescription>
        </CardHeader>
        <CardContent>
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
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 4 }} />
                    <Bar 
                        dataKey="winRate" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
};

export default PairAssertiveness;
