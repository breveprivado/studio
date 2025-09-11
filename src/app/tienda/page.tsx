
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Store, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlayerStats } from '@/lib/types';

const shopItems = [
    {
        id: 'pocion_reset',
        name: 'Poción de Amnesia Selectiva',
        description: 'Te permite resetear los encuentros de una bestia específica para volver a ganar XP por sus logros de caza.',
        price: 1500,
        imageUrl: 'https://picsum.photos/seed/potion/400/300',
        imageHint: 'magic potion',
    },
    {
        id: 'pergamino_sabiduria',
        name: 'Pergamino de Sabiduría Antigua',
        description: 'Recibe un análisis de IA avanzado sobre tu peor racha de operaciones para identificar el error raíz.',
        price: 2500,
        imageUrl: 'https://picsum.photos/seed/scroll/400/300',
        imageHint: 'ancient scroll',
    },
    {
        id: 'amuleto_disciplina',
        name: 'Amuleto del Guardián Disciplinado',
        description: 'Durante 7 días, duplica la XP ganada por supervivencia diaria (registros de 3 o 5 estrellas en la bitácora).',
        price: 5000,
        imageUrl: 'https://picsum.photos/seed/amulet/400/300',
        imageHint: 'magic amulet',
    },
     {
        id: 'orbe_clarividencia',
        name: 'Orbe de la Clarividencia',
        description: 'Recibe un consejo de IA personalizado para tu próxima semana de trading basado en tu rendimiento histórico.',
        price: 1000,
        imageUrl: 'https://picsum.photos/seed/orb/400/300',
        imageHint: 'crystal ball',
    }
];

const TiendaPage = () => {
    const { toast } = useToast();
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

    useEffect(() => {
        const storedStats = localStorage.getItem('playerStats');
        if (storedStats) {
            setPlayerStats(JSON.parse(storedStats));
        }
    }, []);

    const handlePurchase = (price: number) => {
        if (!playerStats) return;

        if (playerStats.xp >= price) {
            const newXp = playerStats.xp - price;
            const newStats = { ...playerStats, xp: newXp };
            setPlayerStats(newStats);
            localStorage.setItem('playerStats', JSON.stringify(newStats));
            
            toast({
                title: '¡Compra Realizada!',
                description: `Has gastado ${price} XP. Tu nuevo balance es ${newXp.toFixed(0)} XP.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'XP Insuficiente',
                description: 'No tienes suficiente experiencia para comprar este objeto.',
            });
        }
    };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Store className="h-8 w-8 mr-3 text-emerald-500" />
              Armería Divina
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Canjea tu experiencia (XP) por objetos y mejoras legendarias.</p>
          </div>
           <div className="flex items-center gap-4">
                <Card className="p-3 bg-gray-100 dark:bg-neutral-800">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-400"/>
                        <span className="font-bold text-lg">{playerStats ? playerStats.xp.toFixed(0) : '0'} XP</span>
                    </div>
                </Card>
                <Link href="/">
                    <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                    </Button>
                </Link>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shopItems.map(item => (
                <Card key={item.id} className="flex flex-col">
                    <CardHeader>
                        <div className="aspect-[4/3] relative mb-4">
                           <Image src={item.imageUrl} alt={item.name} layout="fill" className="rounded-t-lg object-cover" data-ai-hint={item.imageHint}/>
                        </div>
                        <CardTitle>{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                         <CardDescription>{item.description}</CardDescription>
                    </CardContent>
                     <CardContent>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 font-bold text-amber-500 text-lg">
                                <Star className="h-5 w-5" />
                                <span>{item.price}</span>
                            </div>
                            <Button onClick={() => handlePurchase(item.price)} disabled={!playerStats || playerStats.xp < item.price}>
                                Comprar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

      </div>
    </div>
  );
};

export default TiendaPage;

