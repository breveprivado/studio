"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Trade } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DailyPerformanceProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold text-base">{label}</p>
           {payload.map((p: any) => (
             <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
                {p.name}: ${p.value.toFixed(2)}
             </p>
           ))}
        </div>
      );
    }
    return null;
};

const DailyPerformance: React.FC<DailyPerformanceProps> = ({ trades }) => {

  const dailyData = useMemo(() => {
    const dailyStats: { [key: string]: { gains: number; losses: number } } = {};

    trades.forEach(trade => {
        if (trade.status === 'win' || trade.status === 'loss') {
            const dayKey = format(new Date(trade.date), 'yyyy-MM-dd');
            if (!dailyStats[dayKey]) {
                dailyStats[dayKey] = { gains: 0, losses: 0 };
            }

            if (trade.status === 'win') {
                dailyStats[dayKey].gains += trade.profit;
            } else {
                dailyStats[dayKey].losses += Math.abs(trade.profit);
            }
        }
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      name: format(new Date(date), 'dd MMM', { locale: es }),
      Ganancias: stats.gains,
      Pérdidas: stats.losses,
    })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  }, [trades]);

  if (dailyData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ganancias vs. Pérdidas Diarias</CardTitle>
                <CardDescription>Comparación de tus resultados diarios.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    No hay datos suficientes para mostrar en este período.
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Ganancias vs. Pérdidas Diarias</CardTitle>
            <CardDescription>Comparación de tus resultados diarios.</CardDescription>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 4 }} />
                    <Legend />
                    <Bar 
                        dataKey="Ganancias" 
                        fill="hsl(var(--chart-2))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar 
                        dataKey="Pérdidas" 
                        fill="hsl(var(--chart-1))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
};

export default DailyPerformance;
