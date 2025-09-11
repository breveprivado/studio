import { useMemo } from 'react';

// Hitos de días de supervivencia para cada nivel
export const levelMilestones: { [key: number]: number } = {
    1: 1,      // 1 día
    2: 7,      // 1 semana
    3: 21,     // 21 días
    4: 30,     // 1 mes
    5: 60,     // 2 meses
    6: 90,     // 3 meses
    7: 120,    // 4 meses
    8: 150,    // 5 meses
    9: 180,    // 6 meses
    10: 210,   // 7 meses
    11: 240,   // 8 meses
    12: 270,   // 9 meses
    13: 300,   // 10 meses
    14: 330,   // 11 meses
    15: 365,   // 1 año
};

// Generar hitos hasta el nivel 200
for (let i = 16; i <= 200; i++) {
    // A partir del nivel 15, añadimos más días por cada nivel
    levelMilestones[i] = 365 + (i - 15) * 30; // Aproximadamente un mes más por nivel
}

export const useLeveling = (ratedDaysCount: number) => {
    const levelData = useMemo(() => {
        let currentLevel = 0;
        let nextMilestone = levelMilestones[1];

        const sortedLevels = Object.keys(levelMilestones).map(Number).sort((a,b)=>a-b);
        
        for (const level of sortedLevels) {
            const milestone = levelMilestones[level];
            if (ratedDaysCount >= milestone) {
                currentLevel = level;
            } else {
                nextMilestone = milestone;
                break;
            }
        }
        
        if (currentLevel === 200) {
            nextMilestone = ratedDaysCount; // Max level reached
        }


        return {
            level: currentLevel,
            nextMilestone: nextMilestone,
        };
    }, [ratedDaysCount]);

    return levelData;
};
