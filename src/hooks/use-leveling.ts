
import { useMemo } from 'react';

const xpForLevel = (level: number): number => {
    // Curva de XP exponencial: se necesita más XP para subir de nivel a medida que avanzas.
    // Fórmula: 100 * (nivel ^ 1.5)
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level - 1, 1.5));
}

const getRank = (level: number): string => {
    if (level >= 150) return 'SS';
    if (level >= 100) return 'S';
    if (level >= 75) return 'A';
    if (level >= 50) return 'B';
    if (level >= 25) return 'C';
    if (level >= 10) return 'D';
    return 'E';
};

export const useLeveling = (currentXp: number) => {
    const levelData = useMemo(() => {
        let level = 1;
        
        if (currentXp < 0) currentXp = 0;

        while (currentXp >= xpForLevel(level + 1) && level < 200) {
            level++;
        }
        
        if (level >= 200) {
            return {
                level: 200,
                rank: getRank(200),
                xpForNextLevel: currentXp,
                progressPercentage: 100,
            };
        }

        const xpForCurrentLevel = xpForLevel(level);
        const xpForNext = xpForLevel(level + 1);
        
        const xpInCurrentLevel = currentXp - xpForCurrentLevel;
        const xpNeededForNextLevel = xpForNext - xpForCurrentLevel;

        const progressPercentage = xpNeededForNextLevel > 0 ? (xpInCurrentLevel / xpNeededForNextLevel) * 100 : 100;

        return {
            level: level,
            rank: getRank(level),
            xpForNextLevel: xpForNext,
            progressPercentage: progressPercentage,
        };
    }, [currentXp]);

    return levelData;
};
