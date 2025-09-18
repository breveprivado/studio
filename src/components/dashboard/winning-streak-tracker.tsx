"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinningStreakTrackerProps {
    currentStreak: number;
}

const STREAK_GOAL = 10;

const WinningStreakTracker: React.FC<WinningStreakTrackerProps> = ({ currentStreak }) => {
    const progressPercentage = (currentStreak / STREAK_GOAL) * 100;

    const getFlameColor = () => {
        if (currentStreak >= 10) return "text-red-500 fill-red-500 animate-pulse"; // Fiery red for max streak
        if (currentStreak >= 7) return "text-orange-500 fill-orange-500";
        if (currentStreak >= 3) return "text-amber-500 fill-amber-500";
        return "text-muted-foreground/50"; // Default grey
    }

    return (
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Racha de Victorias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 mb-2">
                    <Flame className={cn("h-8 w-8 transition-colors", getFlameColor())} />
                    <span className="text-2xl font-bold">{currentStreak}</span>
                </div>
                <div className="space-y-1">
                    <Progress value={progressPercentage} />
                    <div className="text-center text-xs text-muted-foreground">
                        <p>{currentStreak} / {STREAK_GOAL} Victorias Consecutivas</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WinningStreakTracker;
