
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gem } from 'lucide-react';
import { Trade } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PerformanceRankCardProps {
    trades: Trade[];
}

const MIN_TRADES_FOR_RANK = 10;

const getRank = (winRate: number): { rank: string, color: string } => {
    if (winRate >= 90) return { rank: 'SS', color: 'text-purple-500' };
    if (winRate >= 80) return { rank: 'S', color: 'text-cyan-400' };
    if (winRate >= 70) return { rank: 'A', color: 'text-green-500' };
    if (winRate >= 60) return { rank: 'B', color: 'text-blue-500' };
    if (winRate >= 50) return { rank: 'C', color: 'text-yellow-500' };
    if (winRate >= 40) return { rank: 'D', color: 'text-orange-500' };
    return { rank: 'E', color: 'text-red-500' };
};


const PerformanceRankCard: React.FC<PerformanceRankCardProps> = ({ trades }) => {

    const { rank, winRate, totalTrades, color } = useMemo(() => {
        const relevantTrades = trades.filter(t => t.status === 'win' || t.status === 'loss');
        const total = relevantTrades.length;
        if (total < MIN_TRADES_FOR_RANK) {
            return { rank: 'N/A', winRate: 0, totalTrades: total, color: 'text-muted-foreground' };
        }
        
        const wins = relevantTrades.filter(t => t.status === 'win').length;
        const currentWinRate = (wins / total) * 100;
        const { rank: rankLetter, color: rankColor } = getRank(currentWinRate);
        
        return { rank: rankLetter, winRate: currentWinRate, totalTrades: total, color: rankColor };
    }, [trades]);

    const isRanked = rank !== 'N/A';

    return (
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Rango de Rendimiento
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 mb-2">
                    <Gem className={cn("h-8 w-8 transition-colors", color)} />
                    <span className={cn("text-4xl font-bold", color)}>{rank}</span>
                </div>
                 <div className="space-y-1 text-xs text-muted-foreground text-center">
                    {isRanked ? (
                        <p>{winRate.toFixed(1)}% de acierto en {totalTrades} operaciones</p>
                    ) : (
                        <p>{totalTrades} / {MIN_TRADES_FOR_RANK} operaciones para un rango</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceRankCard;
