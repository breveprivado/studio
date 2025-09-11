import { useMemo } from 'react';

const xpForLevel = (level: number): number => {
    // Curva de XP exponencial: se necesita más XP para subir de nivel a medida que avanzas.
    // Fórmula: 100 * (nivel ^ 1.5)
    if (level === 0) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}

export const useLeveling = (currentXp: number) => {
    const levelData = useMemo(() => {
        let level = 0;
        let xpForNext = xpForLevel(1);

        while (currentXp >= xpForNext) {
            level++;
            xpForNext = xpForLevel(level + 1);
        }
        
        if (level >= 200) {
            return {
                level: 200,
                xpForNextLevel: currentXp,
                progressPercentage: 100,
            };
        }

        const xpForCurrentLevel = xpForLevel(level);
        const xpInCurrentLevel = currentXp - xpForCurrentLevel;
        const xpNeededForNextLevel = xpForNext - xpForCurrentLevel;
        const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

        return {
            level: level,
            xpForNextLevel: xpForNext,
            progressPercentage: progressPercentage,
        };
    }, [currentXp]);

    return levelData;
};
