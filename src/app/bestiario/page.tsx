
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookHeart, Plus, Minus, X, Upload, Pencil, Save, Award, Star, RotateCcw, Trophy, Skull, DollarSign } from 'lucide-react';
import { type Creature, type PlayerStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { initialCreatures } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompoundInterestTable from '@/components/bestiary/compound-interest-table';


const CreatureNameEditor = ({ creature, onSave }: { creature: Creature, onSave: (id: string, newName: string) => void }) => {
    const [name, setName] = useState(creature.name);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onSave(creature.id, name);
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input value={name} onChange={e => setName(e.target.value)} className="h-8" />
                <Button onClick={handleSave} size="icon" className="h-8 w-8"><Save className="h-4 w-4"/></Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 group">
            <span className="font-semibold text-lg">{creature.name}</span>
            <Button onClick={() => setIsEditing(true)} size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
    )
}

const BestiaryPage = () => {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [compoundInterestBalance, setCompoundInterestBalance] = useState(100);

  const { toast } = useToast();
  
   const loadData = () => {
    const storedCreatures = localStorage.getItem('bestiaryCreatures');
    if (storedCreatures) {
      setCreatures(JSON.parse(storedCreatures));
    } else {
      setCreatures(initialCreatures);
    }

    const storedBalance = localStorage.getItem('ci_initialBalance');
    if (storedBalance) {
        setCompoundInterestBalance(parseFloat(storedBalance));
    }
  }

  useEffect(() => {
    loadData();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'bestiaryCreatures' || e.key === 'ci_initialBalance') {
            loadData();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (creatures.length > 0) {
        localStorage.setItem('bestiaryCreatures', JSON.stringify(creatures));
    }
  }, [creatures]);

  useEffect(() => {
    localStorage.setItem('ci_initialBalance', compoundInterestBalance.toString());
  }, [compoundInterestBalance]);

  
  const handleNameSave = (id: string, newName: string) => {
    setCreatures(creatures.map(c => c.id === id ? { ...c, name: newName } : c));
    toast({ title: 'Nombre Actualizado', description: 'El nombre de la criatura ha sido guardado.'});
  }

  const handleOpenSheet = (creature: Creature) => {
      setSelectedCreature(creature);
      setEditDescription(creature.description);
      setEditImageUrl(creature.imageUrl);
      setIsSheetOpen(true);
  }
  
  const handleCloseSheet = () => {
      setIsSheetOpen(false);
      setSelectedCreature(null);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
      if (!selectedCreature) return;

      setCreatures(creatures.map(c => c.id === selectedCreature.id ? { ...c, description: editDescription, imageUrl: editImageUrl } : c));
      toast({ title: 'Criatura Actualizada', description: 'Los detalles han sido guardados.'});
      handleCloseSheet();
  }

  const getXpForCreature = (creatureId: string) => {
      return (parseInt(creatureId, 10) / 17) * 50 + 10;
  }

  const handleResetBestiary = () => {
    setCreatures(initialCreatures);
    localStorage.setItem('bestiaryCreatures', JSON.stringify(initialCreatures));
    // We dispatch a storage event so other open tabs/pages using this data can update themselves.
    window.dispatchEvent(new StorageEvent('storage', { key: 'bestiaryCreatures' }));
    toast({
      title: "Bestiario Reiniciado",
      description: "La lista de bestias ha sido restaurada a su estado original.",
    });
  }
  
  const defeatedCreatures = creatures.filter(c => (c.encounters || []).some(e => e.status === 'win'));
  const defeatedByCreatures = creatures.filter(c => (c.encounters || []).some(e => e.status === 'loss'));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <BookHeart className="h-8 w-8 mr-3 text-purple-500" />
              Bestiario de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Registra y analiza los "monstruos" que afectan tu operativa.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar Bestiario
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro de reiniciar el Bestiario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción restaurará la lista de bestias a su estado original. Se perderán todos los nombres personalizados, descripciones, imágenes y contadores de encuentros. Esta acción no afecta tu XP ni tu nivel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetBestiary} className={cn(Button, "bg-destructive hover:bg-destructive/90")}>Sí, reiniciar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="flex items-center">
                <DollarSign className="h-6 w-6 mr-3 text-green-500" />
                Tabla de Interés Compuesto
            </CardTitle>
            <CardDescription>
                Proyecta tu crecimiento de capital paso a paso, asociando cada nivel con una bestia.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <CompoundInterestTable creatures={creatures} initialBalance={compoundInterestBalance} onBalanceChange={setCompoundInterestBalance} />
        </CardContent>
      </Card>


      <Card>
          <CardHeader>
              <CardTitle>Listado de Bestias</CardTitle>
              <CardDescription>Un resumen de todos los monstruos que has enfrentado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="defeated" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="defeated">Bestias Derrotadas</TabsTrigger>
                <TabsTrigger value="defeatedBy">Derrotas</TabsTrigger>
              </TabsList>
              <TabsContent value="defeated" className="mt-4">
                <div className="space-y-4">
                  {defeatedCreatures.length > 0 ? defeatedCreatures.map(creature => (
                      <CreatureListItem key={`defeated-${creature.id}`} creature={creature} handleOpenSheet={handleOpenSheet} handleNameSave={handleNameSave} getXpForCreature={getXpForCreature} />
                  )) : <p className="text-center text-muted-foreground py-4">Aún no has derrotado a ninguna bestia.</p>}
                </div>
              </TabsContent>
              <TabsContent value="defeatedBy" className="mt-4">
                <div className="space-y-4">
                  {defeatedByCreatures.length > 0 ? defeatedByCreatures.map(creature => (
                      <CreatureListItem key={`defeatedBy-${creature.id}`} creature={creature} handleOpenSheet={handleOpenSheet} handleNameSave={handleNameSave} getXpForCreature={getXpForCreature} />
                  )) : <p className="text-center text-muted-foreground py-4">Ninguna bestia ha sido asociada a una derrota.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={handleCloseSheet}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
              {selectedCreature && (
                  <>
                  <SheetHeader>
                      <SheetTitle className="flex items-center gap-3">
                          {selectedCreature.name}
                      </SheetTitle>
                      <SheetDescription>Edita los detalles de esta criatura y revisa su historial.</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">Descripción</label>
                          <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={5} className="mt-1" placeholder="Añade una descripción detallada..." />
                      </div>
                      <div>
                          <label className="text-sm font-medium">Imagen</label>
                          {editImageUrl ? (
                              <div className="relative mt-2">
                                  <Image src={editImageUrl} alt={`Imagen de ${selectedCreature.name}`} width={400} height={200} className="rounded-lg object-cover w-full" />
                                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setEditImageUrl(null)}><X className="h-4 w-4"/></Button>
                              </div>
                          ) : (
                              <Button variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Subir Imagen
                              </Button>
                          )}
                      </div>
                      <div>
                          <h3 className="text-sm font-medium mb-2">Historial de Encuentros ({selectedCreature.encounters.length})</h3>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                              {selectedCreature.encounters.length > 0 ? (
                                  selectedCreature.encounters.map(encounter => (
                                      <div key={encounter.id} className="text-xs text-muted-foreground p-2 bg-gray-50 dark:bg-neutral-800/50 rounded-md flex justify-between items-center">
                                          <span>{format(new Date(encounter.date), "dd MMM yyyy, HH:mm", { locale: es })}</span>
                                          <span className={cn('font-semibold', encounter.status === 'win' ? 'text-green-500' : 'text-red-500')}>
                                            {encounter.status === 'win' ? 'VICTORIA' : 'DERROTA'}
                                          </span>
                                      </div>
                                  )).reverse()
                              ) : (
                                  <p className="text-xs text-muted-foreground text-center py-4">No hay encuentros registrados.</p>
                              )}
                          </div>
                      </div>
                  </div>
                  <SheetFooter>
                      <Button variant="outline" onClick={handleCloseSheet}>Cancelar</Button>
                      <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                  </SheetFooter>
                  </>
              )}
          </SheetContent>
      </Sheet>

      <input 
      type="file" 
      ref={fileInputRef} 
      onChange={handleImageUpload} 
      className="hidden" 
      accept="image/*"
    />
    </div>
  );
};

const CreatureListItem = ({ creature, handleOpenSheet, handleNameSave, getXpForCreature }: { creature: Creature, handleOpenSheet: (creature: Creature) => void, handleNameSave: (id: string, newName: string) => void, getXpForCreature: (id: string) => number }) => {
    const wins = (creature.encounters || []).filter(e => e.status === 'win').length;
    const losses = (creature.encounters || []).filter(e => e.status === 'loss').length;
    return (
        <div 
            key={creature.id} 
            className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            onClick={() => handleOpenSheet(creature)}
        >
            <div className="flex-1">
                <CreatureNameEditor creature={creature} onSave={handleNameSave} />
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1 text-sm text-green-500 mt-1">
                        <Trophy className="h-4 w-4" />
                        <span>Victorias: {wins}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                        <Skull className="h-4 w-4" />
                        <span>Derrotas: {losses}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500 mt-1">
                        <Star className="h-4 w-4" />
                        <span>{getXpForCreature(creature.id).toFixed(0)} XP</span>
                    </div>
                </div>
            </div>
            <div className="font-bold text-xl w-10 text-center text-muted-foreground">
                {creature.encounters.length}
            </div>
        </div>
    );
};


export default BestiaryPage;

    

    

    

