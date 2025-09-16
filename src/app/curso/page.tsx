"use client";

import React from 'react';
import { BookCopy } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CursoPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <BookCopy className="h-8 w-8 mr-3 text-blue-600" />
              Curso de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu camino hacia la maestría en el trading.</p>
          </div>
        </div>
      </header>
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Contenido del Curso</CardTitle>
                <CardDescription>Las lecciones y módulos del curso aparecerán aquí.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Próximamente: El contenido del curso estará disponible aquí.</p>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default CursoPage;
