"use client";

import React from 'react';
import { PartyPopper } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PartyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <PartyPopper className="h-8 w-8 mr-3 text-rose-500" />
              Party
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Reúne a tu equipo y prepárense para la aventura.</p>
          </div>
        </div>
      </header>
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Próximamente</CardTitle>
                <CardDescription>Esta sección está en construcción. Vuelve pronto para descubrir las funcionalidades de grupo.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí podrás organizar tu equipo, asignar roles y mucho más.</p>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default PartyPage;