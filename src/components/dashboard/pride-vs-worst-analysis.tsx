"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Legend } from 'recharts';
import { Trade } from '@/lib/types';
import { Trophy, Skull } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PrideVsWorstAnalysisProps {
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

const PrideVsWorstAnalysis: React.FC<PrideVsWorstAnalysisProps> = ({ trades }) => {

  const data = useMemo(() => {
    const prideTrades = trades.filter(trade => trade.isPrideTrade);
    const worstTrades = trades.filter(trade => trade.isWorstTrade);
    
    const prideWins = prideTrades.filter(t => t.status === 'win').length;
    const prideLosses = prideTrades.filter(t => t.status === 'loss').length;
    
    const worstWins = worstTrades.filter(t => t.status === 'win').length;
    const worstLosses = worstTrades.filter(t => t.status === 'loss').length;
    
    return [
        { name: 'Orgullosas', Ganadas: prideWins, Perdidas: prideLosses },
        { name: 'Peores', Ganadas: worstWins, Perdidas: worstLosses },
    ];
  }, [trades]);
  
  const hasData = data.some(d => d.Ganadas > 0 || d.Perdidas > 0);

  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-6">
            <div className="flex flex-col items-start text-left">
              <CardTitle>Análisis de Operaciones Destacadas</CardTitle>
              <CardDescription>Resultado de tus operaciones marcadas como "Orgullosas" y "Peores".</CardDescription>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
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
                    No hay operaciones marcadas como "Orgullosas" o "Peores".
                </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default PrideVsWorstAnalysis;
