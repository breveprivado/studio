"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = () => {
    if (currentEntry.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vacía',
        description: 'No puedes guardar una entrada vacía.',
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content: currentEntry,
    };

    setEntries(prevEntries => [newEntry, ...prevEntries]);
    setCurrentEntry('');
    toast({
      title: 'Entrada Guardada',
      description: 'Tu entrada en la bitácora ha sido guardada.',
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    toast({
      title: 'Entrada Eliminada',
      description: 'La entrada de la bitácora ha sido eliminada.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Image src="/logo.png" alt="Olimpo Trade Academy Logo" width={40} height={40} className="mr-3 rounded-full" />
              Bitácora de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Un espacio para tus reflexiones y análisis diarios.</p>
          </div>
        </header>

        <Card className="mb-8 bg-white dark:bg-neutral-900">
          <CardHeader>
            <CardTitle>Nueva Entrada</CardTitle>
            <CardDescription>¿Qué aprendiste hoy? ¿Cómo te sentiste? Anota tus pensamientos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Textarea
                placeholder="Escribe aquí tu entrada del día..."
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button onClick={handleSaveEntry} className="w-full md:w-auto self-end">Guardar Entrada</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Historial de Entradas</h2>
          {entries.length > 0 ? (
            entries.map(entry => (
              <Card key={entry.id} className="bg-white dark:bg-neutral-900">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(new Date(entry.date), "eeee, dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    Eliminar
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Aún no tienes entradas en tu bitácora.</p>
          )}
        </div>
      </div>
    </div>
  );
}
