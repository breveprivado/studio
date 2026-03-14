
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import { isSameDay } from 'date-fns';

interface DailyTradeLimiterProps {
    trades: Trade[];
}

const DailyTradeLimiter: React.FC<DailyTradeLimiterProps> = ({ trades }) => {
    const [limit, setLimit] = useState<number>(10);

    useEffect(() => {
        const storedLimit = localStorage.getItem('dailyTradeLimit');
        if (storedLimit) {
            setLimit(JSON.parse(storedLimit));
        }
    }, []);

    const handleLimitChange = (newLimit: number[]) => {
        setLimit(newLimit[0]);
        localStorage.setItem('dailyTradeLimit', JSON.stringify(newLimit[0]));
    };

    const todaysTradesCount = trades.filter(trade => isSameDay(new Date(trade.date), new Date())).length;

    const getIconColor = () => {
        if (todaysTradesCount >= limit) return "text-red-500 animate-pulse";
        if (todaysTradesCount >= limit * 0.75) return "text-amber-500";
        return "text-muted-foreground/50";
    };

    return (
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Límite de Operaciones Diarias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 mb-2">
                    <Target className={cn("h-8 w-8 transition-colors", getIconColor())} />
                    <span className="text-2xl font-bold">{todaysTradesCount} / {limit}</span>
                </div>
                <div className="space-y-1">
                    <Slider
                        defaultValue={[limit]}
                        max={50}
                        step={1}
                        onValueChange={handleLimitChange}
                    />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{todaysTradesCount} Operaciones Hoy</span>
                        <span>Límite: {limit}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyTradeLimiter;
