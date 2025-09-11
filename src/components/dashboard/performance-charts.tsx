"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as BarChartIcon, CartesianGrid, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, BarChart } from 'recharts';
import { Trade } from '@/lib/types';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


interface PerformanceChartsProps {
  trades: Trade[];
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ trades }) => {

  const performanceData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const dailyData: { [key: string]: { date: string; ganancias: number; perdidas: number } } = {};

    trades.forEach(trade => {
      const day = format(new Date(trade.date), 'dd/MM');
      if (!dailyData[day]) {
        dailyData[day] = { date: day, ganancias: 0, perdidas: 0 };
      }
      if (trade.status === 'win') {
        dailyData[day].ganancias += trade.profit;
      } else if (trade.status === 'loss'){
        dailyData[day].perdidas += Math.abs(trade.profit);
      }
    });

    const sortedData = Object.values(dailyData).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    let cumulativeProfit = 0;
    return sortedData.map(d => {
      cumulativeProfit += d.ganancias - d.perdidas;
      return { ...d, "beneficio neto": cumulativeProfit };
    });

  }, [trades]);
  
  const winLossData = useMemo(() => {
    const wins = trades.filter(t => t.status === 'win').length;
    const losses = trades.filter(t => t.status === 'loss').length;
    const dojis = trades.filter(t => t.status === 'doji').length;

    if (wins === 0 && losses === 0 && dojis === 0) {
      return [];
    }

    return [{
      name: 'Resultados',
      Ganadas: wins,
      Perdidas: losses,
      Empates: dojis,
    }];
  }, [trades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-md text-sm text-foreground">
          <p className="font-bold">{`Fecha: ${label}`}</p>
          <p className="text-green-500">{`Ganancias: ${payload.find(p => p.dataKey === 'ganancias')?.value?.toFixed(2) || 0} US$`}</p>
          <p className="text-red-500">{`Pérdidas: ${payload.find(p => p.dataKey === 'perdidas')?.value?.toFixed(2) || 0} US$`}</p>
          <p className="text-blue-500">{`Beneficio Neto: ${payload.find(p => p.dataKey === 'beneficio neto')?.value?.toFixed(2) || 0} US$`}</p>
        </div>
      );
    }
    return null;
  };
  
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-md text-sm text-foreground">
          {payload.map((pld: any) => (
             <p key={pld.dataKey} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análisis de Rendimiento</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-8">
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Rendimiento de Trading Diario</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `${value} US$`} />
                      <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}} content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                      <Bar dataKey="ganancias" fill="hsl(var(--chart-2))" name="Ganancias" stackId="a" />
                      <Bar dataKey="perdidas" fill="hsl(var(--chart-1))" name="Pérdidas" stackId="a" />
                      <Line type="monotone" dataKey="beneficio neto" stroke="hsl(var(--primary))" strokeWidth={3} name="Beneficio Neto" dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>No hay datos de rendimiento para mostrar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center"><BarChartIcon className="h-5 w-5 mr-2" />Ganadas Vs Perdidas</CardTitle>
              </CardHeader>
              <CardContent>
                  {winLossData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                       <BarChart data={winLossData} layout="vertical" barSize={40}>
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                         <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                         <YAxis type="category" dataKey="name" hide />
                         <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'hsl(var(--muted))'}} />
                         <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                         <Bar dataKey="Ganadas" fill="hsl(var(--chart-2))" />
                         <Bar dataKey="Perdidas" fill="hsl(var(--chart-1))" />
                         <Bar dataKey="Empates" fill="hsl(var(--chart-3))" />
                       </BarChart>
                    </ResponsiveContainer>
                  ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400"><p>No hay datos de operaciones para mostrar</p></div>
                  )}
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PerformanceCharts;
