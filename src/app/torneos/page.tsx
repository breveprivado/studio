
"use client";

import React from 'react';
import { Swords } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TorneosPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Swords className="h-8 w-8 mr-3 text-yellow-500" />
              Torneos de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Compite, demuestra tu habilidad y gana recompensas.</p>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle>¡Próximamente!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">La arena de torneos se está preparando. ¡Vuelve pronto para demostrar que eres el mejor trader del Olimpo!</p>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default TorneosPage;

    