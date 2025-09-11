"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, Star, XCircle, Calendar as CalendarIconLucide } from 'lucide-react';
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

const RatingsDashboard = ({ entries }: { entries: JournalEntry[] }) => {
  const now = new Date();
  const startOfThisWeek = startOfWeek(now, { locale: es });
  const endOfThisWeek = endOfWeek(now, { locale: es });
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);

  const { weeklyStars, monthlyStars } = useMemo(() => {
    let weeklyStars = 0;
    let monthlyStars = 0;

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (isWithinInterval(entryDate, { start: startOfThisWeek, end: endOfThisWeek })) {
        weeklyStars += entry.rating;
      }
      if (isWithinInterval(entryDate, { start: startOfThisMonth, end: endOfThisMonth })) {
        monthlyStars += entry.rating;
      }
    });

    return { weeklyStars, monthlyStars };
  }, [entries, startOfThisWeek, endOfThisWeek, startOfThisMonth, endOfThisMonth]);

  return (
    <Card className="bg-white dark:bg-neutral-900">
      <CardHeader>
        <CardTitle>Dashboard de Calificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
          <span className="font-medium">Total de Estrellas (Semana)</span>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-lg">{weeklyStars}</span>
          </div>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
          <span className="font-medium">Total de Estrellas (Mes)</span>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-lg">{monthlyStars}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


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

  const entryForSelectedDate = useMemo(() => {
    return entries.find(entry => isSameDay(new Date(entry.date), selectedDate));
  }, [entries, selectedDate]);

  useEffect(() => {
    if (entryForSelectedDate) {
      setCurrentEntry(entryForSelectedDate.content);
      setCurrentRating(entryForSelectedDate.rating);
      setCurrentRatingComment(entryForSelectedDate.ratingComment);
    } else {
      setCurrentEntry('');
      setCurrentRating(0);
      setCurrentRatingComment('');
    }
    setEditingEntryId(null);
  }, [selectedDate, entryForSelectedDate]);


  const handleSaveEntry = () => {
    if (currentEntry.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vacía',
        description: 'No puedes guardar una entrada vacía.',
      });
      return;
    }
    
    if (entryForSelectedDate && editingEntryId !== entryForSelectedDate.id) {
       toast({
        variant: 'destructive',
        title: 'Entrada Duplicada',
        description: 'Ya existe una entrada para este día. Puedes editarla.',
      });
      return;
    }

    if (editingEntryId) {
       handleUpdateEntry();
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
    // Reset fields after deleting
    setCurrentEntry('');
    setCurrentRating(0);
    setCurrentRatingComment('');
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
    const updatedEntry = entries.find(e => e.id === editingEntryId);
    if(updatedEntry && isSameDay(new Date(updatedEntry.date), selectedDate)) {
        setCurrentEntry(editingContent);
        setCurrentRating(editingRating);
        setCurrentRatingComment(editingRatingComment);
    }


    handleCancelEdit();
    toast({
      title: 'Entrada Actualizada',
      description: 'Tu entrada ha sido actualizada correctamente.',
    });
  };
  
  const ratedDays = useMemo(() => entries.filter(e => e.rating > 0).map(e => new Date(e.date)), [entries]);

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
            <div className="md:col-span-1 space-y-8">
                 <Card className="bg-white dark:bg-neutral-900">
                    <CardHeader>
                        <CardTitle className="flex items-center"><CalendarIconLucide className="h-5 w-5 mr-2" />Calendario</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                         <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="p-0"
                            locale={es}
                            modifiers={{ rated: ratedDays }}
                            modifiersStyles={{ rated: {
                                // @ts-ignore
                                '--day-border-color': 'hsl(var(--primary))',
                                'borderWidth': '2px',
                                'borderColor': 'var(--day-border-color)',
                                'borderRadius': '50%',
                             } }}
                        />
                    </CardContent>
                </Card>
                <RatingsDashboard entries={entries} />
            </div>
            <div className="md:col-span-2 space-y-6">
                <Card className="bg-white dark:bg-neutral-900">
                  <CardHeader>
                      <CardTitle>Entrada para {format(selectedDate, "PPP", { locale: es })}</CardTitle>
                      {!entryForSelectedDate ? (
                          <CardDescription>Añade una nueva entrada para este día.</CardDescription>
                      ) : (
                          <CardDescription>Aquí puedes ver o editar tu entrada.</CardDescription>
                      )}
                  </CardHeader>
                  <CardContent>
                      <div className="grid gap-4">
                          {editingEntryId && entryForSelectedDate && editingEntryId === entryForSelectedDate.id ? (
                            // Editing view
                            <>
                              <Textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
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
                              <div className="flex gap-2">
                                <Button onClick={handleUpdateEntry}>Guardar Cambios</Button>
                                <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                              </div>
                            </>
                          ) : entryForSelectedDate ? (
                            // Display view
                            <div>
                               <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{entryForSelectedDate.content}</p>
                                {entryForSelectedDate.rating > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold">Calificación:</p>
                                      <div className="flex">
                                        {[1,2,3,4,5].map(star => (
                                          <Star key={star} className={cn("h-5 w-5", entryForSelectedDate.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600')} />
                                        ))}
                                      </div>
                                    </div>
                                    {entryForSelectedDate.ratingComment && (
                                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">"{entryForSelectedDate.ratingComment}"</p>
                                    )}
                                  </div>
                                )}
                               <div className="flex gap-2 mt-4">
                                <Button onClick={() => handleEditEntry(entryForSelectedDate)}>
                                  <Edit className="h-4 w-4 mr-2" /> Editar
                                </Button>
                                <Button variant="destructive" onClick={() => handleDeleteEntry(entryForSelectedDate.id)}>
                                  <XCircle className="h-4 w-4 mr-2" /> Eliminar
                                </Button>
                              </div>
                            </div>
                          ) : (
                             // New entry view
                            <>
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
                            </>
                          )}
                      </div>
                  </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
