"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LosingStreakTrackerProps {
    currentStreak: number;
    maxStreak: number;
}

const STREAK_GOAL = 10;

const LosingStreakTracker: React.FC<LosingStreakTrackerProps> = ({ currentStreak, maxStreak }) => {
    const progressPercentage = (currentStreak / STREAK_GOAL) * 100;

    const getIconColor = () => {
        if (currentStreak >= 5) return "text-red-500 animate-pulse";
        if (currentStreak >= 3) return "text-red-500/80";
        if (currentStreak > 0) return "text-red-500/60";
        return "text-muted-foreground/50";
    }

    return (
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Racha de Derrotas (Actual)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 mb-2">
                    <ShieldOff className={cn("h-8 w-8 transition-colors", getIconColor())} />
                    <span className="text-2xl font-bold">{currentStreak}</span>
                </div>
                <div className="space-y-1">
                    <Progress value={progressPercentage} className="[&>div]:bg-destructive" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{currentStreak} / {STREAK_GOAL} Derrotas</span>
                        <span>Racha Máxima del Día: {maxStreak}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LosingStreakTracker;
