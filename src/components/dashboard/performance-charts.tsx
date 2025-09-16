"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, Line, Dot } from 'recharts';
import { Trade, BalanceAddition, Withdrawal } from '@/lib/types';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface PerformanceChartsProps {
  trades: Trade[];
  balanceAdditions: BalanceAddition[];
  withdrawals: Withdrawal[];
}

const CustomizedDot = (props: any) => {
    const { cx, cy, stroke, payload, value } = props;
  
    if (payload.recarga) {
      return (
        <svg x={cx - 8} y={cy - 8} width={16} height={16} fill="hsl(var(--accent))" viewBox="0 0 1024 1024">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 704c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z"/>
        </svg>
      );
    }
  
    return null;
  };

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ trades, balanceAdditions, withdrawals }) => {

  const performanceData = useMemo(() => {
    const allActivities = [
      ...trades.map(t => ({ date: new Date(t.date), amount: t.profit })),
      ...balanceAdditions.map(b => ({ date: new Date(b.date), amount: b.amount, type: 'balance' })),
      ...withdrawals.map(w => ({ date: new Date(w.date), amount: -w.amount })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (allActivities.length === 0) return [];
    
    const startDate = allActivities[0].date;
    const endDate = new Date();
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    let cumulativeBalance = 0;
    const dailyBalances: { [key: string]: number } = {};
    const rechargeDays = new Set<string>();

    balanceAdditions.forEach(b => {
        rechargeDays.add(format(new Date(b.date), 'yyyy-MM-dd'));
    });

    allActivities.forEach(activity => {
        const dayKey = format(activity.date, 'yyyy-MM-dd');
        // We calculate cumulative balance for each activity, not for each day
        cumulativeBalance += activity.amount;
        dailyBalances[dayKey] = cumulativeBalance; // Overwrite to get the last balance of the day
    });
    
    let lastKnownBalance = 0;
    return dateRange.map(date => {
        const dayKey = format(date, 'yyyy-MM-dd');
        
        let activitiesOnThisDay = allActivities.filter(a => isSameDay(a.date, date));
        
        if (activitiesOnThisDay.length === 0) {
            // No activity, carry over last balance
        } else {
            // Find the balance at the END of this day by re-calculating up to it
            let tempBalance = 0;
            for(const act of allActivities) {
                if(act.date <= endOfDay(date)) {
                    tempBalance += act.amount;
                } else {
                    break;
                }
            }
            lastKnownBalance = tempBalance;
        }

        const isRechargeDay = rechargeDays.has(dayKey);

        return {
            date: format(date, 'dd MMM'),
            "Balance Actual": lastKnownBalance,
            recarga: isRechargeDay ? lastKnownBalance : null,
        };
    });

  }, [trades, balanceAdditions, withdrawals]);

  const endOfDay = (date: Date) => {
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return end;
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const balanceValue = payload.find(p => p.dataKey === "Balance Actual")?.value;
      
      if (balanceValue === undefined) return null;

      return (
        <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="font-bold text-lg">{formatCurrency(balanceValue)}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="bg-card">
        <CardHeader>
            <CardTitle>Total Balance Overview</CardTitle>
             <CardDescription>
                Una vista de la evolución de tu cuenta a lo largo del tiempo.
             </CardDescription>
        </CardHeader>
        <CardContent>
            {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis 
                    dataKey="date" 
                    fontSize={12} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                    fontSize={12} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="Balance Actual" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorBalance)" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }}
                />
                 <Area
                    type="monotone"
                    dataKey="recarga"
                    stroke="none"
                    fill="none"
                    dot={<CustomizedDot />}
                    activeDot={false}
                    legendType="none"
                 />
                </AreaChart>
            </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>No hay datos suficientes para mostrar el gráfico.</p>
                </div>
            )}
        </CardContent>
    </Card>
  );
};

export default PerformanceCharts;
