
"use client";

import React from 'react';
import { Sparkles, Droplets, Mountain, Wind, Flame } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const purificationTypes = [
    {
        name: "Agua",
        description: "Purifica las emociones negativas y la impulsividad.",
        icon: Droplets,
        color: "text-blue-500",
    },
    {
        name: "Tierra",
        description: "Fortalece la disciplina y la paciencia.",
        icon: Mountain,
        color: "text-amber-700",
    },
    {
        name: "Aire",
        description: "Aclara la mente y mejora el análisis.",
        icon: Wind,
        color: "text-sky-500",
    },
    {
        name: "Fuego",
        description: "Transforma las pérdidas en lecciones y coraje.",
        icon: Flame,
        color: "text-red-500",
    }
]

const PurificarPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Sparkles className="h-8 w-8 mr-3 text-pink-500" />
              Centro de Purificación
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Elimina las maldiciones y recupera tu potencial.</p>
          </div>
        </div>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {purificationTypes.map((item) => (
            <Card key={item.name}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                        {item.name}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">
                        Purificar con {item.name}
                    </Button>
                </CardContent>
            </Card>
        ))}
      </main>

    </div>
  );
};

export default PurificarPage;
