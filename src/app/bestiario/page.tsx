"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookHeart, Plus, Minus, X, Upload, Pencil, Save, Award, Star, RotateCcw } from 'lucide-react';
import { type Creature, type PlayerStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CompoundInterestTable from '@/components/bestiary/compound-interest-table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign } from 'lucide-react';
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
  const [compoundInterestBalance, setCompoundInterestBalance] = useState(100);
  
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <BookHeart className="h-8 w-8 mr-3 text-purple-500" />
              Bestiario de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Registra y analiza los "monstruos" que afectan tu operativa.</p>
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
            <Link href="/bestiario/logros">
                <Button variant="outline" className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Award className="h-4 w-4 mr-2" />
                    Ver Panel de Logros
                </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </header>

         <Accordion type="single" collapsible className="w-full mb-8">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex items-center">
                        <DollarSign className="h-6 w-6 text-primary mr-3" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tabla de Interés Compuesto</h2>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <CompoundInterestTable creatures={creatures} initialBalance={compoundInterestBalance} onBalanceChange={setCompoundInterestBalance} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Card>
            <CardHeader>
                <CardTitle>Listado de Bestias</CardTitle>
                <CardDescription>Un resumen de todos los monstruos que has enfrentado y su recompensa.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {creatures.sort((a, b) => parseInt(a.id) - parseInt(b.id)).map(creature => (
                        <div 
                            key={creature.id} 
                            className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                            onClick={() => handleOpenSheet(creature)}
                        >
                            <div className="flex-1">
                               <CreatureNameEditor creature={creature} onSave={handleNameSave} />
                               <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground mt-1">Encuentros: {creature.encounters.length}</p>
                                <div className="flex items-center gap-1 text-sm text-amber-500 mt-1">
                                    <Star className="h-4 w-4" />
                                    <span>{getXpForCreature(creature.id).toFixed(0)} XP</span>
                                </div>
                               </div>
                            </div>
                            <div className="font-bold text-xl w-10 text-center">
                                {creature.encounters.length}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

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
                                        <div key={encounter.id} className="text-xs text-muted-foreground p-2 bg-gray-50 dark:bg-neutral-800/50 rounded-md">
                                            {format(new Date(encounter.date), "dd MMM yyyy, HH:mm", { locale: es })}
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

export default BestiaryPage;
