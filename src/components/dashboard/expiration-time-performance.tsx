
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Trade } from '@/lib/types';

interface ExpirationTimePerformanceProps {
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

const expirationOrder = [
    "5seg", "10seg", "15seg", "30seg", "45seg", "1minuto",
    "2minuto", "3minuto", "4minuto", "5minuto"
];

const ExpirationTimePerformance: React.FC<ExpirationTimePerformanceProps> = ({ trades }) => {

  const data = useMemo(() => {
    const stats: { [key: string]: { Ganadas: number; Perdidas: number } } = {};

    trades.forEach(trade => {
        if (trade.expirationTime && (trade.status === 'win' || trade.status === 'loss')) {
            if (!stats[trade.expirationTime]) {
                stats[trade.expirationTime] = { Ganadas: 0, Perdidas: 0 };
            }

            if (trade.status === 'win') {
                stats[trade.expirationTime].Ganadas += 1;
            } else {
                stats[trade.expirationTime].Perdidas += 1;
            }
        }
    });

    return expirationOrder
        .filter(time => stats[time]) // Only include times that have data
        .map(time => ({
            name: time,
            ...stats[time]
        }));

  }, [trades]);

  const hasData = data.some(d => d.Ganadas > 0 || d.Perdidas > 0);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Rendimiento por Expiración</CardTitle>
            <CardDescription>Operaciones ganadas y perdidas por tiempo de expiración.</CardDescription>
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
                        maxBarSize={40}
                    />
                    <Bar 
                        dataKey="Perdidas" 
                        fill="hsl(var(--destructive))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay operaciones con tiempo de expiración registrado.
            </div>
        )}
        </CardContent>
    </Card>
  );
};

export default ExpirationTimePerformance;
