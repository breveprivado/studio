"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Award, BookHeart, ShieldOff, ShieldCheck } from 'lucide-react';
import { type Creature } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const achievementData = [
  { id: '1', name: 'Vencedor de la Duda', description: 'Has confrontado a la Sombra de la incertidumbre, el primer paso para dominar tu mente.' },
  { id: '2', name: 'Maestro de la Paciencia', description: 'Derrotaste al Slime de la impaciencia, demostrando que sabes esperar el momento perfecto.' },
  { id: '3', name: 'Estratega Disciplinado', description: 'Los Goblins de la codicia y el caos ya no dictan tus movimientos. Tu plan es tu escudo.' },
  { id: '4', name: 'Guardián del Capital', description: 'Los Orcos del sobreapalancamiento han caído. Proteges tu reino con una gestión de riesgo de hierro.' },
  { id: '5', name: 'Heraldo del Análisis', description: 'Has superado el impulso, demostrando que la preparación es la clave de la victoria.' },
  { id: '6', name: 'Errante Resiliente', description: 'Aceptaste la pérdida como una lección, no como una derrota. Tu fortaleza mental es legendaria.' },
  { id: '7', name: 'Conquistador Emocional', description: 'El miedo y la euforia ya no son tus amos. Operas desde la calma y la lógica.' },
  { id: '8', name: 'Arquitecto de la Rutina', description: 'Has forjado hábitos de acero, la base sobre la que se construyen los grandes imperios.' },
  { id: '9', name: 'Centinela del Foco', description: 'Las distracciones son meras ilusiones para ti. Tu concentración es inquebrantable.' },
  { id: '10', name: 'Campeón de la Humildad', description: 'Reconoces que el mercado es el maestro y tú un eterno aprendiz. Tu ego está bajo control.' },
  { id: '11', name: 'Sabio de la Bitácora', description: 'Cada operación es una página en tu libro de sabiduría. Aprendes y evolucionas sin cesar.' },
  { id: '12', name: 'Titán del Backtesting', description: 'Confías en tus datos, no en la esperanza. Tu estrategia ha sido probada en el fuego.' },
  { id: '13', name: 'Paladín del Proceso', description: 'Te enamoraste del proceso, no del resultado. La excelencia es tu camino.' },
  { id: '14', name: 'Vigilante Nocturno', description: 'Descansas cuando debes, sabiendo que un guerrero fatigado es un guerrero vulnerable.' },
  { id: '15', name: 'Explorador de Mercados', description: 'Tu curiosidad es tu mapa. Siempre buscas nuevas tierras y oportunidades que conquistar.' },
  { id: '16', name: 'Oráculo de la Tendencia', description: 'Ves más allá del ruido, identificando el flujo real del mercado. La corriente es tu aliada.' },
  { id: '17', name: 'Leyenda del Olimpo', description: 'Has dominado a todas las bestias. Tu nombre será cantado por generaciones de traders.' },
];

const AchievementsPage = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    if (storedCreatures) {
      setCreatures(JSON.parse(storedCreatures));
    }
  }, []);

  const achievementsProgress = useMemo(() => {
    if (!isClient) return { unlocked: 0, total: 17, percentage: 0 };
    
    const unlockedCount = creatures.filter(c => c.encounters.length > 0).length;
    return {
      unlocked: unlockedCount,
      total: creatures.length,
      percentage: creatures.length > 0 ? (unlockedCount / creatures.length) * 100 : 0
    };
  }, [creatures, isClient]);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Award className="h-8 w-8 mr-3 text-amber-500" />
              Salón de los Héroes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Crónicas de tus victorias contra las bestias del mercado.</p>
          </div>
          <Link href="/bestiario">
            <Button variant="outline">
              <BookHeart className="h-4 w-4 mr-2" />
              Volver al Bestiario
            </Button>
          </Link>
        </header>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Progreso de Logros</CardTitle>
                <CardDescription>Has desbloqueado {achievementsProgress.unlocked} de {achievementsProgress.total} logros.</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={achievementsProgress.percentage} className="w-full" />
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievementData.map(achievement => {
            const creature = creatures.find(c => c.id === achievement.id);
            const isUnlocked = creature ? creature.encounters.length > 0 : false;
            
            return (
              <Card 
                key={achievement.id}
                className={cn(
                  "transition-all duration-300",
                  isUnlocked ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400" : "bg-gray-100 dark:bg-neutral-900"
                )}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  {isUnlocked ? 
                    <ShieldCheck className="h-8 w-8 text-amber-500 flex-shrink-0" /> : 
                    <ShieldOff className="h-8 w-8 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                  }
                  <div>
                    <CardTitle className={cn(isUnlocked ? "text-amber-700 dark:text-amber-400" : "text-gray-500")}>
                      {achievement.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Bestia: {creature?.name || `Criatura #${achievement.id}`}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isUnlocked ? achievement.description : "Derrota a esta bestia para desbloquear el logro."}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AchievementsPage;
