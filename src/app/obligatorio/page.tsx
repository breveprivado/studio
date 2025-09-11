"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Edit, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const defaultMandatoryItems = {
  trading: [
    "Seguir el plan de trading sin desviaciones emocionales.",
    "Respetar el Stop Loss una vez establecido. No moverlo en contra.",
    "No sobre-apalancarse. Gestionar el riesgo en cada operación.",
    "Analizar el mercado antes de entrar, no durante la operación.",
    "Aceptar las pérdidas como parte del negocio y aprender de ellas.",
  ],
  personaje: [
    "Mantener la disciplina dentro y fuera del mercado.",
    "Estudiar constantemente y buscar la mejora continua.",
    "Tener paciencia y esperar las oportunidades correctas.",
    "Cuidar la salud física y mental para un rendimiento óptimo.",
    "Ser humilde en las ganancias y resiliente en las pérdidas.",
  ],
};

const MandatoryItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{text}</span>
  </li>
);

const EditableMandatoryList = ({ category }: { category: 'trading' | 'personaje' }) => {
  const [items, setItems] = useState<string[]>([]);
  const [editingText, setEditingText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedItems = localStorage.getItem(`mandatoryItems_${category}`);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      setItems(defaultMandatoryItems[category]);
    }
  }, [category]);

  const handleSave = () => {
    const newItems = editingText.split('\n').filter(item => item.trim() !== '');
    setItems(newItems);
    localStorage.setItem(`mandatoryItems_${category}`, JSON.stringify(newItems));
    setIsEditing(false);
    toast({
      title: 'Reglas Guardadas',
      description: `Tus reglas para "${category}" han sido actualizadas.`,
    });
  };

  const handleEdit = () => {
    setEditingText(items.join('\n'));
    setIsEditing(true);
  };

  return (
    <Card className="bg-white dark:bg-neutral-900 mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                 <CardTitle>{category === 'trading' ? 'Principios de Trading' : 'Desarrollo de Personaje'}</CardTitle>
                 <CardDescription>{category === 'trading' ? 'Las reglas que rigen cada una de tus operaciones.' : 'Las cualidades que forjan a un trader de élite.'}</CardDescription>
            </div>
             {isEditing ? (
                 <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                 </Button>
             ) : (
                <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
             )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            rows={items.length + 2}
            className="text-base"
          />
        ) : (
          <ul className="space-y-4">
            {items.map((item, index) => (
              <MandatoryItem key={index} text={item} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
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

    