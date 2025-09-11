
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Store, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { type PlayerStats, type Trade, type Withdrawal, type BalanceAddition } from '@/lib/types';

const shopItems = [
    {
        id: 'pocion_reset',
        name: 'Poción de Amnesia Selectiva',
        description: 'Te permite resetear los encuentros de una bestia específica para volver a ganar XP por sus logros de caza.',
        price: 150,
        imageUrl: 'https://picsum.photos/seed/potion/400/300',
        imageHint: 'magic potion',
    },
    {
        id: 'pergamino_sabiduria',
        name: 'Pergamino de Sabiduría Antigua',
        description: 'Recibe un análisis de IA avanzado sobre tu peor racha de operaciones para identificar el error raíz.',
        price: 250,
        imageUrl: 'https://picsum.photos/seed/scroll/400/300',
        imageHint: 'ancient scroll',
    },
    {
        id: 'amuleto_disciplina',
        name: 'Amuleto del Guardián Disciplinado',
        description: 'Durante 7 días, duplica la XP ganada por supervivencia diaria (registros de 3 o 5 estrellas en la bitácora).',
        price: 500,
        imageUrl: 'https://picsum.photos/seed/amulet/400/300',
        imageHint: 'magic amulet',
    },
     {
        id: 'orbe_clarividencia',
        name: 'Orbe de la Clarividencia',
        description: 'Recibe un consejo de IA personalizado para tu próxima semana de trading basado en tu rendimiento histórico.',
        price: 100,
        imageUrl: 'https://picsum.photos/seed/orb/400/300',
        imageHint: 'crystal ball',
    }
];

const TiendaPage = () => {
    const { toast } = useToast();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [balanceAdditions, setBalanceAdditions] = useState<BalanceAddition[]>([]);

    useEffect(() => {
        const storedTrades = localStorage.getItem('trades');
        if (storedTrades) setTrades(JSON.parse(storedTrades));

        const storedWithdrawals = localStorage.getItem('withdrawals');
        if (storedWithdrawals) setWithdrawals(JSON.parse(storedWithdrawals));
        
        const storedBalanceAdditions = localStorage.getItem('balanceAdditions');
        if (storedBalanceAdditions) setBalanceAdditions(JSON.parse(storedBalanceAdditions));
    }, []);

    const netProfit = useMemo(() => {
        const gains = trades.filter(t => t.status === 'win').reduce((acc, t) => acc + t.profit, 0);
        const losses = trades.filter(t => t.status === 'loss').reduce((acc, t) => acc + t.profit, 0);
        const totalWithdrawals = withdrawals.reduce((acc, w) => acc + w.amount, 0);
        const totalBalanceAdditions = balanceAdditions.reduce((acc, b) => acc + b.amount, 0);
        return totalBalanceAdditions + gains + losses - totalWithdrawals;
    }, [trades, withdrawals, balanceAdditions]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handlePurchase = (itemName: string, price: number) => {
        if (netProfit >= price) {
            const newWithdrawal: Withdrawal = {
                id: crypto.randomUUID(),
                amount: price,
                date: new Date().toISOString(),
                notes: `Compra: ${itemName}`,
            };
            
            const updatedWithdrawals = [...withdrawals, newWithdrawal];
            setWithdrawals(updatedWithdrawals);
            localStorage.setItem('withdrawals', JSON.stringify(updatedWithdrawals));
            
            toast({
                title: '¡Compra Realizada!',
                description: `Has gastado ${formatCurrency(price)}. Tu nuevo saldo se ha actualizado.`,
            });
             // Trigger storage event to update other tabs
            window.dispatchEvent(new Event('storage'));
        } else {
            toast({
                variant: 'destructive',
                title: 'Saldo Insuficiente',
                description: `No tienes suficiente saldo para comprar este objeto. Necesitas ${formatCurrency(price)}.`,
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
            <p className="text-gray-600 dark:text-gray-400 mt-2">Canjea tu saldo (USD) por objetos y mejoras legendarias.</p>
          </div>
           <div className="flex items-center gap-4">
                <Card className="p-3 bg-gray-100 dark:bg-neutral-800">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500"/>
                        <span className="font-bold text-lg">{formatCurrency(netProfit)}</span>
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
                            <div className="flex items-center gap-1 font-bold text-green-600 text-lg">
                                <DollarSign className="h-5 w-5" />
                                <span>{item.price}</span>
                            </div>
                            <Button onClick={() => handlePurchase(item.name, item.price)} disabled={netProfit < item.price}>
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
