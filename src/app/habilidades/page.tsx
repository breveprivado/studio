"use client";

import React from 'react';
import { BrainCircuit, Dumbbell, Zap, BookOpen, Heart } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const skillRunes = [
  {
    name: 'Fuerza',
    description: 'Aumenta la efectividad de tus operaciones y la ganancia de XP.',
    icon: Dumbbell,
    level: 1,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    name: 'Destreza',
    description: 'Reduce la penalización de XP por pérdidas y mejora la asertividad.',
    icon: Zap,
    level: 1,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    name: 'Inteligencia',
    description: 'Desbloquea análisis de IA más profundos y consejos avanzados.',
    icon: BookOpen,
    level: 1,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    name: 'Constitución',
    description: 'Otorga vidas (corazones) adicionales por día para resistir pérdidas.',
    icon: Heart,
    level: 1,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  }
];

const HabilidadesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <BrainCircuit className="h-8 w-8 mr-3 text-teal-500" />
              Centro de Habilidades
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Desbloquea y mejora tus habilidades como trader.</p>
          </div>
        </div>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillRunes.map((skill) => {
          const Icon = skill.icon;
          return (
            <Card key={skill.name} className="flex flex-col text-center hover:shadow-lg transition-shadow">
                <CardHeader className="items-center">
                    <div className={`w-16 h-16 rounded-full ${skill.bgColor} flex items-center justify-center border-4 ${skill.borderColor}`}>
                        <Icon className={`h-8 w-8 ${skill.color}`} />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                    <CardTitle>{skill.name}</CardTitle>
                    <CardDescription>{skill.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Badge variant="secondary">Nivel {skill.level}</Badge>
                    <Button disabled className="w-full">
                        Mejorar
                    </Button>
                </CardFooter>
            </Card>
          )
        })}
      </main>

    </div>
  );
};

export default HabilidadesPage;
