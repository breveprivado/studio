
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Trade } from '@/lib/types';
import { getHours } from 'date-fns';

interface HourlyPerformanceProps {
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

const HourlyPerformance: React.FC<HourlyPerformanceProps> = ({ trades }) => {

  const hourlyData = useMemo(() => {
    const statsByHour: { [key: number]: { Ganadas: number; Perdidas: number } } = {};

    for (let i = 0; i < 24; i++) {
        statsByHour[i] = { Ganadas: 0, Perdidas: 0 };
    }

    trades.forEach(trade => {
        if (trade.status === 'win' || trade.status === 'loss') {
            const hour = getHours(new Date(trade.date));
            if (trade.status === 'win') {
                statsByHour[hour].Ganadas += 1;
            } else {
                statsByHour[hour].Perdidas += 1;
            }
        }
    });

    return Object.entries(statsByHour).map(([hour, stats]) => ({
      name: `${parseInt(hour).toString().padStart(2, '0')}:00`,
      ...stats,
    }));

  }, [trades]);

  const hasData = hourlyData.some(d => d.Ganadas > 0 || d.Perdidas > 0);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Rendimiento por Hora</CardTitle>
            <CardDescription>Operaciones ganadas y perdidas para cada hora del día.</CardDescription>
        </CardHeader>
        <CardContent>
        {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        interval={2}
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
                        maxBarSize={20}
                    />
                    <Bar 
                        dataKey="Perdidas" 
                        fill="hsl(var(--destructive))" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay operaciones registradas para mostrar el rendimiento por hora.
            </div>
        )}
        </CardContent>
    </Card>
  );
};

export default HourlyPerformance;
