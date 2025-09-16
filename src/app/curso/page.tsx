"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookCopy, DollarSign, Lock, Baby, GraduationCap, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { type Trade, type Withdrawal, type BalanceAddition } from '@/lib/types';
import { SidebarTrigger } from '@/components/ui/sidebar';

const courseLevels = [
    {
        id: 'principiante',
        title: 'Nivel Principiante',
        description: 'Los fundamentos esenciales del trading. Aprende los conceptos básicos para empezar con buen pie.',
        price: 100,
        icon: Baby,
        imageHint: 'newborn baby',
        imageUrl: 'https://picsum.photos/seed/beginner/400/300'
    },
    {
        id: 'medio',
        title: 'Nivel Medio',
        description: 'Desarrolla tus habilidades con estrategias avanzadas, gestión de riesgos y psicología del trading.',
        price: 300,
        icon: GraduationCap,
        imageHint: 'graduation cap',
        imageUrl: 'https://picsum.photos/seed/intermediate/400/300'
    },
    {
        id: 'avanzado',
        title: 'Nivel Avanzado',
        description: 'Domina el mercado con análisis macroeconómico, sistemas de trading complejos y técnicas de maestría.',
        price: 500,
        icon: Crown,
        imageHint: 'golden crown',
        imageUrl: 'https://picsum.photos/seed/advanced/400/300'
    }
];

const CursoPage = () => {
    const { toast } = useToast();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [balanceAdditions, setBalanceAdditions] = useState<BalanceAddition[]>([]);
    
    const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedTrades = localStorage.getItem('trades');
            if (storedTrades) setTrades(JSON.parse(storedTrades));

            const storedWithdrawals = localStorage.getItem('withdrawals');
            if (storedWithdrawals) {
                const parsedWithdrawals: Withdrawal[] = JSON.parse(storedWithdrawals);
                setWithdrawals(parsedWithdrawals);

                // Check which courses have been purchased
                const purchased = parsedWithdrawals
                    .filter(w => w.notes?.startsWith('Curso Desbloqueado:'))
                    .map(w => w.notes!.split(': ')[1].toLowerCase());
                setUnlockedCourses(purchased);
            }
            
            const storedBalanceAdditions = localStorage.getItem('balanceAdditions');
            if (storedBalanceAdditions) setBalanceAdditions(JSON.parse(storedBalanceAdditions));
        }

        handleStorageChange(); // Initial load
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
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

    const handlePurchase = (courseId: string, courseTitle: string, price: number) => {
        if (unlockedCourses.includes(courseId)) {
             toast({
                title: 'Curso ya desbloqueado',
                description: 'Ya tienes acceso a este nivel del curso.',
            });
            return;
        }

        if (netProfit >= price) {
            const newWithdrawal: Withdrawal = {
                id: crypto.randomUUID(),
                amount: price,
                date: new Date().toISOString(),
                notes: `Curso Desbloqueado: ${courseTitle}`,
            };
            
            const updatedWithdrawals = [...withdrawals, newWithdrawal];
            setWithdrawals(updatedWithdrawals);
            localStorage.setItem('withdrawals', JSON.stringify(updatedWithdrawals));
            
            setUnlockedCourses([...unlockedCourses, courseId]);

            toast({
                title: '¡Curso Desbloqueado!',
                description: `Has gastado ${formatCurrency(price)}. Tu nuevo saldo se ha actualizado y ahora tienes acceso al curso.`,
            });
             // Trigger storage event to update other tabs
            window.dispatchEvent(new StorageEvent('storage', { key: 'withdrawals' }));
        } else {
            toast({
                variant: 'destructive',
                title: 'Saldo Insuficiente',
                description: `No tienes suficiente saldo para desbloquear este curso. Necesitas ${formatCurrency(price)}.`,
            });
        }
    };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <BookCopy className="h-8 w-8 mr-3 text-blue-600" />
              Academia de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu camino hacia la maestría en el trading, nivel por nivel.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <Card className="p-3 bg-gray-100 dark:bg-neutral-800">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500"/>
                    <span className="font-bold text-lg">{formatCurrency(netProfit)}</span>
                </div>
            </Card>
        </div>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courseLevels.map((level) => {
            const isUnlocked = unlockedCourses.includes(level.id);
            return (
              <Card key={level.id} className="flex flex-col">
                  <CardHeader>
                      <div className="aspect-[4/3] relative mb-4">
                          <Image src={level.imageUrl} alt={level.title} fill={true} className="rounded-t-lg object-cover" data-ai-hint={level.imageHint}/>
                      </div>
                      <CardTitle className="flex items-center gap-3">
                        <level.icon className="h-6 w-6 text-primary" />
                        {level.title}
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <CardDescription>{level.description}</CardDescription>
                  </CardContent>
                  <CardContent>
                      <Button 
                        onClick={() => handlePurchase(level.id, level.title, level.price)} 
                        disabled={netProfit < level.price && !isUnlocked}
                        className="w-full"
                      >
                        {isUnlocked ? (
                            "Ver Contenido"
                        ) : (
                            <>
                                <Lock className="mr-2 h-4 w-4" />
                                Desbloquear Curso ({formatCurrency(level.price)})
                            </>
                        )}
                      </Button>
                  </CardContent>
              </Card>
            )
        })}
      </main>

    </div>
  );
};

export default CursoPage;
