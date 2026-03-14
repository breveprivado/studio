
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Trade } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendPerformanceProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold text-base">{label}</p>
           {payload.map((p: any) => (
             <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
                {p.name}: {p.value}
             </p>
           ))}
        </div>
      );
    }
    return null;
};

const TrendPerformance: React.FC<TrendPerformanceProps> = ({ trades }) => {

  const data = useMemo(() => {
    const trendTrades = trades.filter(trade => trade.trendDirection === 'with-trend');
    const counterTrendTrades = trades.filter(trade => trade.trendDirection === 'counter-trend');
    
    const trendWins = trendTrades.filter(t => t.status === 'win').length;
    const trendLosses = trendTrades.filter(t => t.status === 'loss').length;
    
    const counterTrendWins = counterTrendTrades.filter(t => t.status === 'win').length;
    const counterTrendLosses = counterTrendTrades.filter(t => t.status === 'loss').length;
    
    return [
        { name: 'Tendencia', Ganadas: trendWins, Perdidas: trendLosses },
        { name: 'Contratendencia', Ganadas: counterTrendWins, Perdidas: counterTrendLosses },
    ];
  }, [trades]);
  
  const hasData = data.some(d => d.Ganadas > 0 || d.Perdidas > 0);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Rendimiento por Dirección de Tendencia</CardTitle>
            <CardDescription>Comparativa de operaciones a favor y en contra de la tendencia.</CardDescription>
        </CardHeader>
        <CardContent>
        {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                        allowDecimals={false}
                        fontSize={12} 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 4 }} />
                    <Legend />
                    <Bar 
                        dataKey="Ganadas" 
                        fill="hsl(var(--chart-2))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                        <Bar 
                        dataKey="Perdidas" 
                        fill="hsl(var(--destructive))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay operaciones marcadas por dirección de tendencia.
            </div>
        )}
        </CardContent>
    </Card>
  );
};

export default TrendPerformance;

    