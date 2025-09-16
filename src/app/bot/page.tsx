"use client";

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bot, BarChart, Percent, BrainCircuit, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const botActions = [
    {
        title: "Porcentaje de Asertividad sin Gale",
        description: "Calcula tu tasa de acierto real excluyendo operaciones de martingala.",
        icon: Percent,
        action: () => console.log("Calculando asertividad sin gale..."),
    },
    {
        title: "Análisis de Racha de Pérdidas",
        description: "La IA analiza tus peores rachas para encontrar patrones y errores comunes.",
        icon: BarChart,
        action: () => console.log("Analizando racha de pérdidas..."),
    },
    {
        title: "Proyección de Rentabilidad",
        description: "Proyecta tu crecimiento potencial basado en tu rendimiento actual.",
        icon: TrendingUp,
        action: () => console.log("Proyectando rentabilidad..."),
    },
    {
        title: "Consejo de la Semana",
        description: "Obtén un consejo práctico de la IA para tu próxima semana de trading.",
        icon: BrainCircuit,
        action: () => console.log("Generando consejo..."),
    },
]

const BotPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Bot className="h-8 w-8 mr-3 text-gray-500" />
              Asistente de IA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu compañero IA para analizar y mejorar tu trading.</p>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {botActions.map((item) => (
            <Card key={item.title}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <item.icon className="h-6 w-6 text-primary" />
                        {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={item.action} className="w-full" disabled>
                        <Lock className="mr-2 h-4 w-4" />
                        Ejecutar Análisis
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default BotPage;
