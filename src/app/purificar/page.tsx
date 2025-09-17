
"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Funcionalidad Próximamente</CardTitle>
                <CardDescription>El Centro de Purificación está en construcción. ¡Vuelve pronto para descubrir cómo puedes purificar tus estadísticas y objetos!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p>Aquí podrás usar objetos especiales para limpiar tu historial.</p>
                </div>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default PurificarPage;
