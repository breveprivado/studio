
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Cell } from 'recharts';
import { Trade } from '@/lib/types';
import { Trophy, Skull } from 'lucide-react';

interface PrideVsWorstTradesProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold text-base">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`Recuento: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
};

const PrideVsWorstTrades: React.FC<PrideVsWorstTradesProps> = ({ trades }) => {

  const data = useMemo(() => {
    const prideCount = trades.filter(trade => trade.isPrideTrade).length;
    const worstCount = trades.filter(trade => trade.isWorstTrade).length;
    
    return [
        { name: 'Orgullosas', count: prideCount, fill: 'hsl(var(--primary))', icon: <Trophy className="h-4 w-4 inline-block mr-2" /> },
        { name: 'Peores', count: worstCount, fill: 'hsl(var(--destructive))', icon: <Skull className="h-4 w-4 inline-block mr-2" /> },
    ];
  }, [trades]);
  
  const hasData = data.some(d => d.count > 0);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Operaciones Destacadas</CardTitle>
            <CardDescription>Comparativa de tus mejores y peores operaciones.</CardDescription>
        </CardHeader>
        <CardContent>
        {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis 
                        type="number" 
                        allowDecimals={false}
                        fontSize={12}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                        type="category"
                        dataKey="name"
                        fontSize={12} 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', radius: 4 }} />
                    <Bar 
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay operaciones orgullosas o peores marcadas.
            </div>
        )}
        </CardContent>
    </Card>
  );
};

export default PrideVsWorstTrades;
