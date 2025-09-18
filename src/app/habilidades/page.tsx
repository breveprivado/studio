"use client";

import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Próximamente</CardTitle>
                <CardDescription>Esta sección está en construcción. Vuelve pronto para descubrir tu árbol de habilidades.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí podrás gastar tus puntos de experiencia para obtener mejoras pasivas y activas.</p>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default HabilidadesPage;
