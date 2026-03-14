
"use client";

import React from 'react';
import { Landmark } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const OlimposPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Landmark className="h-8 w-8 mr-3 text-slate-500" />
              Olimpos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">La morada de los dioses del trading.</p>
          </div>
        </div>
      </header>
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Próximamente</CardTitle>
                <CardDescription>Esta sección está en construcción. Vuelve pronto para descubrir qué te espera en el Olimpo.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí encontrarás desafíos y recompensas dignas de los dioses.</p>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default OlimposPage;
