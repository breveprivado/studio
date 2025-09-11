"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Edit, Save, Upload, X, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface MandatoryRule {
  id: string;
  text: string;
  description: string;
  imageUrl?: string | null;
}

const defaultMandatoryItems: { [key: string]: MandatoryRule[] } = {
  trading: [
    { id: 't1', text: "Seguir el plan de trading sin desviaciones emocionales.", description: "", imageUrl: null },
    { id: 't2', text: "Respetar el Stop Loss una vez establecido. No moverlo en contra.", description: "", imageUrl: null },
    { id: 't3', text: "No sobre-apalancarse. Gestionar el riesgo en cada operación.", description: "", imageUrl: null },
    { id: 't4', text: "Analizar el mercado antes de entrar, no durante la operación.", description: "", imageUrl: null },
    { id: 't5', text: "Aceptar las pérdidas como parte del negocio y aprender de ellas.", description: "", imageUrl: null },
  ],
  personaje: [
    { id: 'p1', text: "Mantener la disciplina dentro y fuera del mercado.", description: "", imageUrl: null },
    { id: 'p2', text: "Estudiar constantemente y buscar la mejora continua.", description: "", imageUrl: null },
    { id: 'p3', text: "Tener paciencia y esperar las oportunidades correctas.", description: "", imageUrl: null },
    { id: 'p4', text: "Cuidar la salud física y mental para un rendimiento óptimo.", description: "", imageUrl: null },
    { id: 'p5', text: "Ser humilde en las ganancias y resiliente en las pérdidas.", description: "", imageUrl: null },
  ],
};


const EditableMandatoryList = ({ category }: { category: 'trading' | 'personaje' }) => {
  const [items, setItems] = useState<MandatoryRule[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MandatoryRule | null>(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedItems = localStorage.getItem(`mandatoryItems_${category}`);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems(defaultMandatoryItems[category]);
    }
  }, [category]);
  
  useEffect(() => {
    localStorage.setItem(`mandatoryItems_${category}`, JSON.stringify(items));
  }, [items, category]);

  const openEditDialog = (item: MandatoryRule) => {
    setSelectedItem(item);
    setEditText(item.text);
    setEditDescription(item.description);
    setEditImageUrl(item.imageUrl || null);
  };
  
  const openNewDialog = () => {
    setSelectedItem({ id: '', text: '', description: '', imageUrl: null }); // Temp object for new item
    setEditText('');
    setEditDescription('');
    setEditImageUrl(null);
  };

  const closeDialog = () => {
    setSelectedItem(null);
  };

  const handleSave = () => {
    if (!selectedItem) return;

    if (selectedItem.id) { // Editing existing item
      setItems(items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, text: editText, description: editDescription, imageUrl: editImageUrl }
          : item
      ));
      toast({
        title: 'Principio Actualizado',
        description: 'Los detalles de tu regla han sido guardados.',
      });
    } else { // Adding new item
      const newItem: MandatoryRule = {
        id: crypto.randomUUID(),
        text: editText,
        description: editDescription,
        imageUrl: editImageUrl
      };
      setItems([...items, newItem]);
       toast({
        title: 'Principio Añadido',
        description: 'Tu nueva regla ha sido guardada.',
      });
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (!selectedItem || !selectedItem.id) return;

    setItems(items.filter(item => item.id !== selectedItem.id));
    toast({
      title: 'Principio Eliminado',
      description: 'La regla ha sido eliminada.',
      variant: 'destructive',
    });
    closeDialog();
  };

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

  return (
    <>
      <Card className="bg-white dark:bg-neutral-900 mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{category === 'trading' ? 'Principios de Trading' : 'Desarrollo de Personaje'}</CardTitle>
              <CardDescription>{category === 'trading' ? 'esto es lo que no cumple el 99.99% de traders y por eso nunca seran rentables ni hoy ni mañana ni ayer porque esto es por su seguridad y protección' : 'Las cualidades que forjan a un trader de élite.'}</CardDescription>
            </div>
             <Button onClick={openNewDialog} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Principio
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {items.map((item) => (
              <li 
                key={item.id} 
                className="flex items-start p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                onClick={() => openEditDialog(item)}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
                <Edit className="h-4 w-4 text-gray-400 dark:text-gray-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            ))}
             {items.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aún no has añadido ningún principio. ¡Empieza ahora!</p>
             )}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem?.id ? 'Editar' : 'Nuevo'} Principio</DialogTitle>
             <DialogDescription>
                {selectedItem?.id ? 'Modifica los detalles de tu principio.' : 'Añade una nueva regla a tu lista.'}
             </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div>
                  <label className="text-sm font-medium">Principio</label>
                  <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="mt-1" placeholder="Escribe tu principio aquí..." />
              </div>
              <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="mt-1" placeholder="Añade una descripción detallada..." />
              </div>
              <div>
                <label className="text-sm font-medium">Imagen</label>
                 {editImageUrl ? (
                    <div className="relative mt-2">
                        <Image src={editImageUrl} alt="Imagen del principio" width={400} height={200} className="rounded-lg object-cover w-full" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setEditImageUrl(null)}><X className="h-4 w-4"/></Button>
                    </div>
                ) : (
                     <Button variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Imagen
                    </Button>
                )}
              </div>
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            {selectedItem?.id ? (
                <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                    <Trash2 className="h-4 w-4 mr-2"/>
                    Eliminar
                </Button>
            ) : <div />}
            <div className="flex gap-2">
              <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />
    </>
  );
};


export default function MandatoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Image src="/logo.png" alt="Olimpo Wallet Logo" width={40} height={40} className="mr-3 rounded-full" />
              Reglas Obligatorias
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tus principios inquebrantables para el éxito.</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </header>

        <main>
          <Tabs defaultValue="trading" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trading">Trading Obligatorio</TabsTrigger>
              <TabsTrigger value="personaje">Personaje</TabsTrigger>
            </TabsList>
            <TabsContent value="trading">
              <EditableMandatoryList category="trading" />
            </TabsContent>
            <TabsContent value="personaje">
              <EditableMandatoryList category="personaje" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
