"use client";

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bot } from 'lucide-react';

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
      
      {/* Contenido futuro de la página del bot */}
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold text-muted-foreground">Próximamente...</h2>
          <p className="text-muted-foreground mt-2">El asistente de IA se está preparando para la batalla.</p>
      </div>
    </div>
  );
};

export default BotPage;
