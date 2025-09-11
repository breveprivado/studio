"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, Star, XCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  rating: number;
  ratingComment: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const [currentRating, setCurrentRating] = useState(0);
  const [currentRatingComment, setCurrentRatingComment] = useState('');
  const [editingRating, setEditingRating] = useState(0);
  const [editingRatingComment, setEditingRatingComment] = useState('');

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
      date: selectedDate.toISOString(),
      content: currentEntry,
      rating: currentRating,
      ratingComment: currentRatingComment,
    };

    setEntries(prevEntries => [newEntry, ...prevEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCurrentEntry('');
    setCurrentRating(0);
    setCurrentRatingComment('');
    
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

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditingContent(entry.content);
    setEditingRating(entry.rating || 0);
    setEditingRatingComment(entry.ratingComment || '');
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingContent('');
    setEditingRating(0);
    setEditingRatingComment('');
  };

  const handleUpdateEntry = () => {
    if (editingContent.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vacía',
        description: 'No puedes guardar una entrada vacía.',
      });
      return;
    }

    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === editingEntryId
          ? { 
              ...entry, 
              content: editingContent,
              rating: editingRating,
              ratingComment: editingRatingComment 
            }
          : entry
      )
    );

    handleCancelEdit();
    toast({
      title: 'Entrada Actualizada',
      description: 'Tu entrada ha sido actualizada correctamente.',
    });
  };

  const entriesForSelectedDate = entries
    .filter(entry => isSameDay(new Date(entry.date), selectedDate))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
           <Link href="/">
             <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
             </Button>
            </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card className="bg-white dark:bg-neutral-900">
                    <CardHeader>
                        <CardTitle>Calendario</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="p-0"
                            locale={es}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
                <Card className="bg-white dark:bg-neutral-900">
                <CardHeader>
                    <CardTitle>Hola,</CardTitle>
                    <CardDescription>¿Qué me vas a contar el día de hoy?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                    <Textarea
                        placeholder="Escribe aquí tu entrada del día..."
                        value={currentEntry}
                        onChange={(e) => setCurrentEntry(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Calificación del día</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={cn(
                                "h-6 w-6 cursor-pointer",
                                currentRating >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                              )}
                              onClick={() => setCurrentRating(rating)}
                            />
                          ))}
                        </div>
                      </div>
                      <Input
                        placeholder="Comentario sobre tu calificación..."
                        value={currentRatingComment}
                        onChange={(e) => setCurrentRatingComment(e.target.value)}
                      />
                    <Button onClick={handleSaveEntry} className="w-full md:w-auto self-end">Guardar Entrada</Button>
                    </div>
                </CardContent>
                </Card>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Entradas de {format(selectedDate, "PPP", { locale: es })}
                    </h2>
                     {entriesForSelectedDate.length > 0 ? (
                        entriesForSelectedDate.map(entry => (
                        <Card key={entry.id} className="bg-white dark:bg-neutral-900 mb-4">
                            <CardHeader className='flex-row items-start justify-between'>
                            <div>
                                <CardTitle className="text-lg">
                                {format(new Date(entry.date), "eeee, dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                                </CardTitle>
                            </div>
                            <div className='flex gap-2'>
                                {editingEntryId !== entry.id ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-primary"
                                    onClick={() => handleEditEntry(entry)}
                                >
                                    <Edit className='h-4 w-4' />
                                </Button>
                                ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-primary"
                                    onClick={handleUpdateEntry}
                                >
                                    <Save className='h-4 w-4' />
                                </Button>
                                )}
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-500"
                                onClick={() => editingEntryId === entry.id ? handleCancelEdit() : handleDeleteEntry(entry.id)}
                                >
                                <XCircle className='h-4 w-4' />
                                </Button>
                            </div>
                            </CardHeader>
                            <CardContent>
                            {editingEntryId === entry.id ? (
                                <div className="space-y-4">
                                <Textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    rows={5}
                                    className="resize-none"
                                />
                                 <div className="space-y-2">
                                    <label className="text-sm font-medium">Calificación</label>
                                    <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <Star
                                        key={rating}
                                        className={cn(
                                            "h-6 w-6 cursor-pointer",
                                            editingRating >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                                        )}
                                        onClick={() => setEditingRating(rating)}
                                        />
                                    ))}
                                    </div>
                                </div>
                                <Input
                                    placeholder="Comentario sobre tu calificación..."
                                    value={editingRatingComment}
                                    onChange={(e) => setEditingRatingComment(e.target.value)}
                                />
                                </div>
                            ) : (
                              <div>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                                {entry.rating > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold">Calificación:</p>
                                      <div className="flex">
                                        {[1,2,3,4,5].map(star => (
                                          <Star key={star} className={cn("h-5 w-5", entry.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600')} />
                                        ))}
                                      </div>
                                    </div>
                                    {entry.ratingComment && (
                                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">"{entry.ratingComment}"</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            </CardContent>
                        </Card>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No tienes entradas para esta fecha.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
