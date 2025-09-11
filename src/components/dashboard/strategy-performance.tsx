"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '@/lib/types';
import { Layers3 } from 'lucide-react';

interface StrategyPerformanceProps {
  trades: Trade[];
}

const StrategyPerformance: React.FC<StrategyPerformanceProps> = ({ trades }) => {

  const strategyData = useMemo(() => {
    const strategies = ['1G', '2G', '3G', '4G', '5G', '1C', '2C', '3C', '4C'];
    const data: { name: string; victorias: number; derrotas: number }[] = [];

    strategies.forEach(strategy => {
      const strategyTrades = trades.filter(t => t.strategy === strategy);
      if (strategyTrades.length > 0) {
        data.push({
          name: strategy,
          victorias: strategyTrades.filter(t => t.status === 'win').length,
          derrotas: strategyTrades.filter(t => t.status === 'loss').length,
        });
      }
    });

    return data;
  }, [trades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white border rounded-md shadow-md text-sm">
          <p className="font-bold">{`Estrategia: ${label}`}</p>
          <p style={{ color: '#22c55e' }}>{`Victorias: ${payload.find(p => p.dataKey === 'victorias')?.value || 0}`}</p>
          <p style={{ color: '#ef4444' }}>{`Derrotas: ${payload.find(p => p.dataKey === 'derrotas')?.value || 0}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center mb-4">
          <Layers3 className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Rendimiento por Estrategia</h2>
        </div>
      </CardHeader>
      <CardContent>
        {strategyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="victorias" fill="#22c55e" name="Victorias" stackId="a" />
              <Bar dataKey="derrotas" fill="#ef4444" name="Derrotas" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No hay datos de estrategias para mostrar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyPerformance;
