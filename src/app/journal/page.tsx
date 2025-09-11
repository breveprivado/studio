"use client";

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, Star, XCircle, Calendar as CalendarIconLucide, Upload, Shield, HelpCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalEntry, PlayerStats } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const levelMilestones: { [key: number]: number } = {
    1: 1, 2: 7, 3: 21, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150,
    9: 180, 10: 210, 11: 240, 12: 270, 13: 300, 14: 330, 15: 365,
};
const XP_PER_SURVIVAL_MISSION = 500;
const XP_PER_SURVIVAL_DAY = 100;

const RatingRules = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
            <div className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Reglas de Calificación</h3>
            </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-3 text-sm p-2 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">5 Estrellas:</span> Día perfecto. Disciplina de hierro, arrasaste con todo.</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">4 Estrellas:</span> Buen día, pero con pequeños errores (corazones perdidos sin romper el límite).</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">3 Estrellas:</span> Límite de pérdidas alcanzado (3 corazones). Fin del día.</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">2 Estrellas:</span> No se respetó la estrategia o el Stop Loss.</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">1 Estrella:</span> Metralleta. Operativa impulsiva y sin control.</div></li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
);


const RatingsDashboard = ({ entries, viewDate }: { entries: JournalEntry[], viewDate: Date }) => {
  const startOfThisWeek = startOfWeek(viewDate, { locale: es });
  const endOfThisWeek = endOfWeek(viewDate, { locale: es });
  const startOfThisMonth = startOfMonth(viewDate);
  const endOfThisMonth = endOfMonth(viewDate);

  const { weeklyAvg, monthlyAvg, weeklyCount, monthlyCount } = useMemo(() => {
    let weeklyStars = 0;
    let weeklyCount = 0;
    let monthlyStars = 0;
    let monthlyCount = 0;

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entry.rating > 0) {
        if (isWithinInterval(entryDate, { start: startOfThisWeek, end: endOfThisWeek })) {
          weeklyStars += entry.rating;
          weeklyCount++;
        }
        if (isWithinInterval(entryDate, { start: startOfThisMonth, end: endOfThisMonth })) {
          monthlyStars += entry.rating;
          monthlyCount++;
        }
      }
    });
    
    const weeklyAvg = weeklyCount > 0 ? weeklyStars / weeklyCount : 0;
    const monthlyAvg = monthlyCount > 0 ? monthlyStars / monthlyCount : 0;

    return { weeklyAvg, monthlyAvg, weeklyCount, monthlyCount };
  }, [entries, startOfThisWeek, endOfThisWeek, startOfThisMonth, endOfThisMonth]);

  const getFeedback = (average: number) => {
    if (average >= 4.5) {
      return { message: "¡Excelente!", description: "Mantienes una disciplina de hierro. Sigue así.", color: "text-green-500" };
    }
    if (average >= 3.5) {
      return { message: "¡Buen trabajo!", description: "Tu consistencia está dando frutos. Hay pequeños detalles por pulir.", color: "text-blue-500" };
    }
    if (average >= 2.5) {
      return { message: "Vas por buen camino.", description: "Hay días buenos y malos. Enfócate en tu plan.", color: "text-yellow-500" };
    }
    return { message: "¡Atención!", description: "Este no es el camino. Revisa tu plan, apégate a tus reglas y no dejes que las emociones te dominen.", color: "text-red-500" };
  };

  const weeklyFeedback = getFeedback(weeklyAvg);
  const monthlyFeedback = getFeedback(monthlyAvg);
  
  const [selectedYear, setSelectedYear] = useState(getYear(viewDate));
  const [selectedMonth, setSelectedMonth] = useState(getMonth(viewDate));
  
  const years = useMemo(() => {
    const allYears = entries.map(e => getYear(new Date(e.date)));
    const uniqueYears = [...new Set(allYears), getYear(new Date())];
    return uniqueYears.sort((a,b) => b-a);
  }, [entries]);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const handleDateChange = (year: number, month: number) => {
      const newDate = setMonth(setYear(new Date(), year), month);
      // This part is tricky as we can't directly set the state of the parent.
      // The parent will handle the date change and pass the new `viewDate` prop.
  }

  return (
    <Card className="bg-white dark:bg-neutral-900">
      <CardHeader>
        <CardTitle>Dashboard de Calificaciones</CardTitle>
        <CardDescription>Revisa tu rendimiento pasado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="font-semibold mb-2">Rendimiento Semanal <span className="text-sm text-gray-500">({format(startOfThisWeek, 'dd MMM')} - {format(endOfThisWeek, 'dd MMM')})</span></h3>
            <div className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Promedio de Estrellas</span>
                    <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-bold text-lg">{weeklyAvg.toFixed(1)}</span>
                    </div>
                </div>
                <p className={`text-sm font-semibold ${weeklyFeedback.color}`}>{weeklyFeedback.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{weeklyFeedback.description}</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">Basado en {weeklyCount} día(s) calificados.</p>
            </div>
        </div>
        <div>
            <h3 className="font-semibold mb-2">Rendimiento Mensual <span className="text-sm text-gray-500">({format(startOfThisMonth, 'MMMM yyyy', { locale: es })})</span></h3>
            <div className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Promedio de Estrellas</span>
                    <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-bold text-lg">{monthlyAvg.toFixed(1)}</span>
                    </div>
                </div>
                 <p className={`text-sm font-semibold ${monthlyFeedback.color}`}>{monthlyFeedback.message}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{monthlyFeedback.description}</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">Basado en {monthlyCount} día(s) calificados.</p>
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
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  const entryForSelectedDate = useMemo(() => {
    return entries.find(entry => isSameDay(new Date(entry.date), selectedDate));
  }, [entries, selectedDate]);
  
  const ratedDaysCount = useMemo(() => entries.filter(e => e.rating === 3 || e.rating === 5).length, [entries]);

  useEffect(() => {
    if (entryForSelectedDate) {
      setCurrentEntry(entryForSelectedDate.content);
      setCurrentRating(entryForSelectedDate.rating);
      setCurrentRatingComment(entryForSelectedDate.ratingComment);
      setCurrentImage(entryForSelectedDate.imageUrl || null);
    } else {
      setCurrentEntry('');
      setCurrentRating(0);
      setCurrentRatingComment('');
      setCurrentImage(null);
    }
    setEditingEntryId(null);
  }, [selectedDate, entryForSelectedDate]);
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if(editingEntryId) {
            setEditingImage(result);
        } else {
            setCurrentImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
 const checkSurvivalMissions = (newEntriesList: JournalEntry[], newRating: number) => {
    // Only proceed if the rating is valid for survival
    if (newRating !== 3 && newRating !== 5) return;

    let totalXpGained = 0;
    
    // Get current player stats from storage
    const statsStr = localStorage.getItem('playerStats');
    const storedPlayerStats: PlayerStats = statsStr ? JSON.parse(statsStr) : { xp: 0, startDate: new Date().toISOString() };
    if (typeof storedPlayerStats.xp !== 'number') storedPlayerStats.xp = 0;

    // --- 1. Grant XP for the single day of survival ---
    storedPlayerStats.xp += XP_PER_SURVIVAL_DAY;
    totalXpGained += XP_PER_SURVIVAL_DAY;
    toast({
        title: `¡Día Sobrevivido!`,
        description: `Has ganado ${XP_PER_SURVIVAL_DAY} XP por tu disciplina de hoy.`
    });

    // --- 2. Check for milestone missions ---
    const currentRatedDays = newEntriesList.filter(e => e.rating === 3 || e.rating === 5).length;
    let milestoneUnlocked = false;

    Object.entries(levelMilestones).forEach(([level, milestone]) => {
        const xpEarnedForMilestone = JSON.parse(localStorage.getItem(`xpEarned_${milestone}`) || 'false');

        if (currentRatedDays >= milestone && !xpEarnedForMilestone) {
            storedPlayerStats.xp += XP_PER_SURVIVAL_MISSION;
            totalXpGained += XP_PER_SURVIVAL_MISSION;
            localStorage.setItem(`xpEarned_${milestone}`, 'true');
            toast({
                title: `¡Misión de Supervivencia Completa!`,
                description: `Has sobrevivido ${milestone} día(s) y ganado ${XP_PER_SURVIVAL_MISSION} XP!`
            });
            milestoneUnlocked = true;
        }
    });

    // --- 3. Save updated stats and notify other components ---
    if (totalXpGained > 0) {
        localStorage.setItem('playerStats', JSON.stringify(storedPlayerStats));
        // This is a simple way to trigger a storage event for other tabs/pages to listen to.
        localStorage.setItem('xp_updated', Date.now().toString());
    }
  }


  const handleSaveEntry = () => {
    if (currentEntry.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vacía',
        description: 'No puedes guardar una entrada vacía.',
      });
      return;
    }
    
    if (entryForSelectedDate) {
       toast({
        variant: 'destructive',
        title: 'Entrada Duplicada',
        description: 'Ya existe una entrada para este día. Puedes editarla.',
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: selectedDate.toISOString(),
      content: currentEntry,
      rating: currentRating,
      ratingComment: currentRatingComment,
      imageUrl: currentImage,
    };
    
    const newEntries = [newEntry, ...entries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(newEntries);
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));

    checkSurvivalMissions(newEntries, newEntry.rating);
    
    toast({
      title: 'Entrada Guardada',
      description: 'Tu entrada en la bitácora ha sido guardada.',
    });
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    toast({
      title: 'Entrada Eliminada',
      description: 'La entrada de la bitácora ha sido eliminada.',
    });
    if (entryForSelectedDate && entryForSelectedDate.id === id) {
        setCurrentEntry('');
        setCurrentRating(0);
        setCurrentRatingComment('');
        setCurrentImage(null);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditingContent(entry.content);
    setEditingRating(entry.rating || 0);
    setEditingRatingComment(entry.ratingComment || '');
    setEditingImage(entry.imageUrl || null);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingContent('');
    setEditingRating(0);
    setEditingRatingComment('');
    setEditingImage(null);
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
    
    const oldEntry = entries.find(e => e.id === editingEntryId);
    const wasPreviouslyUnratedForSurvival = oldEntry && ![3, 5].includes(oldEntry.rating);

    const newEntries = entries.map(entry =>
      entry.id === editingEntryId
        ? { 
            ...entry, 
            content: editingContent,
            rating: editingRating,
            ratingComment: editingRatingComment,
            imageUrl: editingImage,
          }
        : entry
    );
    setEntries(newEntries);
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));

    // If the entry was not previously rated for survival, check missions
    if (wasPreviouslyUnratedForSurvival) {
        checkSurvivalMissions(newEntries, editingRating);
    }


    const updatedEntry = newEntries.find(e => e.id === editingEntryId);
    if(updatedEntry && isSameDay(new Date(updatedEntry.date), selectedDate)) {
        setCurrentEntry(editingContent);
        setCurrentRating(editingRating);
        setCurrentRatingComment(editingRatingComment);
        setCurrentImage(editingImage);
    }


    handleCancelEdit();
    toast({
      title: 'Entrada Actualizada',
      description: 'Tu entrada ha sido actualizada correctamente.',
    });
  };
  
  const ratedDays = useMemo(() => entries.filter(e => e.rating === 3 || e.rating === 5).map(e => new Date(e.date)), [entries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-primary" />
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
                <div className="space-y-4">
                    <RatingRules />
                    <RatingsDashboard entries={entries} viewDate={selectedDate} />
                </div>
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
                               {editingImage && (
                                <div className="relative">
                                    <Image src={editingImage} alt="Imagen de la entrada" width={400} height={250} className="rounded-lg object-cover w-full" />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setEditingImage(null)}><XCircle className="h-4 w-4"/></Button>
                                </div>
                               )}
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
                              <div className="flex gap-2 flex-wrap">
                                <Button onClick={handleUpdateEntry}>Guardar Cambios</Button>
                                <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {editingImage ? 'Cambiar Imagen' : 'Adjuntar Imagen'}
                                </Button>
                              </div>
                            </>
                          ) : entryForSelectedDate ? (
                            // Display view
                            <div>
                               {entryForSelectedDate.imageUrl && (
                                 <Image src={entryForSelectedDate.imageUrl} alt="Imagen de la entrada" width={400} height={250} className="rounded-lg object-cover w-full mb-4" />
                               )}
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
                               {currentImage && (
                                <div className="relative">
                                    <Image src={currentImage} alt="Imagen de la entrada" width={400} height={250} className="rounded-lg object-cover w-full" />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setCurrentImage(null)}><XCircle className="h-4 w-4"/></Button>
                                </div>
                               )}
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
                              <div className="flex gap-2 flex-wrap">
                                <Button onClick={handleSaveEntry} className="md:w-auto self-end">Guardar Entrada</Button>
                                 <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {currentImage ? 'Cambiar Imagen' : 'Adjuntar Imagen'}
                                </Button>
                              </div>
                            </>
                          )}
                      </div>
                  </CardContent>
                </Card>
            </div>
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
}

    