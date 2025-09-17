
"use client";

import React from 'react';
import { Bomb } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const MazmorraPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Bomb className="h-8 w-8 mr-3 text-zinc-800" />
              Mazmorra
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Atrévete a entrar y enfrenta tus mayores miedos.</p>
          </div>
        </div>
      </header>
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Próximamente</CardTitle>
                <CardDescription>Esta sección está en construcción. Prepara tus armas, porque la mazmorra abrirá sus puertas pronto.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Enfréntate a desafíos peligrosos y obtén recompensas únicas.</p>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default MazmorraPage;
