"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import { Trade } from '@/lib/types';

interface StrategyPerformanceProps {
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


const StrategyPerformance: React.FC<StrategyPerformanceProps> = ({ trades }) => {

  const strategyData = useMemo(() => {
    const strategies: { [key: string]: { wins: number; total: number } } = {};

    trades.forEach(trade => {
      if (trade.strategy && (trade.status === 'win' || trade.status === 'loss')) {
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
    })).sort((a, b) => b.winRate - a.winRate);

  }, [trades]);

  if (strategyData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Rendimiento por Estrategia</CardTitle>
                <CardDescription>Tu tasa de acierto para cada estrategia de trading.</CardDescription>
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
            <CardTitle>Rendimiento por Estrategia</CardTitle>
            <CardDescription>Tu tasa de acierto para cada estrategia de trading.</CardDescription>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={strategyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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

export default StrategyPerformance;
