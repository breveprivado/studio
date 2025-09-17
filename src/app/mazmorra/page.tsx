"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { isSameDay } from 'date-fns';

const MazmorraPage = () => {
  const [completedDays, setCompletedDays] = useState<Date[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedDays = localStorage.getItem('mazmorraGymDays');
    if (storedDays) {
      // Dates are stored as strings, so we need to convert them back to Date objects
      setCompletedDays(JSON.parse(storedDays).map((date: string) => new Date(date)));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('mazmorraGymDays', JSON.stringify(completedDays));
    }
  }, [completedDays, isClient]);

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;

    const isCompleted = completedDays.some(completedDay => isSameDay(completedDay, day));
    let updatedDays;

    if (isCompleted) {
      updatedDays = completedDays.filter(completedDay => !isSameDay(completedDay, day));
      toast({
        title: "Día Desmarcado",
        description: "Has eliminado un día de tu racha de gimnasio.",
      });
    } else {
      updatedDays = [...completedDays, day];
       toast({
        title: "¡Día Completado!",
        description: "Has añadido un día a tu desafío. ¡Sigue así!",
      });
    }
    
    // Sort the array to keep it consistent
    setCompletedDays(updatedDays.sort((a, b) => a.getTime() - b.getTime()));
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Dumbbell className="h-8 w-8 mr-3 text-zinc-800 dark:text-zinc-300" />
              Mazmorra del Hábito
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Forja tu disciplina día a día. Marca los días de gimnasio completados.</p>
          </div>
        </div>
      </header>
      
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Desafío de Gimnasio</CardTitle>
                <CardDescription>Haz clic en un día para marcarlo como completado y construir tu racha.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="multiple"
                    selected={completedDays}
                    onSelect={handleDayClick}
                    className="p-0"
                    modifiersClassNames={{
                      selected: 'bg-green-500 text-white hover:bg-green-600 focus:bg-green-600',
                    }}
                />
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default MazmorraPage;
