"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Edit, Save, Upload, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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

  const handleItemClick = (item: MandatoryRule) => {
    setSelectedItem(item);
    setEditText(item.text);
    setEditDescription(item.description);
    setEditImageUrl(item.imageUrl || null);
  };
  
  const handleSaveDetails = () => {
    if (!selectedItem) return;
    setItems(items.map(item => 
      item.id === selectedItem.id 
        ? { ...item, text: editText, description: editDescription, imageUrl: editImageUrl }
        : item
    ));
    setSelectedItem(null);
    toast({
      title: 'Principio Actualizado',
      description: 'Los detalles de tu regla han sido guardados.',
    });
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
              <CardDescription>{category === 'trading' ? 'Las reglas que rigen cada una de tus operaciones.' : 'Las cualidades que forjan a un trader de élite.'}</CardDescription>
            </div>
            {/* You can add an "Edit List" button here if needed */}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {items.map((item) => (
              <li 
                key={item.id} 
                className="flex items-start p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 flex-1">{item.text}</span>
                <Edit className="h-4 w-4 text-gray-400 dark:text-gray-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Principio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div>
                  <label className="text-sm font-medium">Principio</label>
                  <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="mt-1" />
              </div>
              <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="mt-1" />
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
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveDetails}>Guardar Cambios</Button>
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
              <Image src="/logo.png" alt="Olimpo Trade Academy Logo" width={40} height={40} className="mr-3 rounded-full" />
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