"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bot, BarChart, Percent, BrainCircuit, TrendingUp, Lock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type Trade, type Withdrawal, type BalanceAddition } from '@/lib/types';

const botActions = [
    {
        title: "Porcentaje de Asertividad sin Gale",
        description: "Calcula tu tasa de acierto real excluyendo operaciones de martingala.",
        icon: Percent,
        price: 50,
    },
    {
        title: "Análisis de Racha de Pérdidas",
        description: "La IA analiza tus peores rachas para encontrar patrones y errores comunes.",
        icon: BarChart,
        price: 150,
    },
    {
        title: "Proyección de Rentabilidad",
        description: "Proyecta tu crecimiento potencial basado en tu rendimiento actual.",
        icon: TrendingUp,
        price: 100,
    },
    {
        title: "Consejo de la Semana",
        description: "Obtén un consejo práctico de la IA para tu próxima semana de trading.",
        icon: BrainCircuit,
        price: 75,
    },
]

const BotPage = () => {
    const { toast } = useToast();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [balanceAdditions, setBalanceAdditions] = useState<BalanceAddition[]>([]);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedTrades = localStorage.getItem('trades');
            if (storedTrades) setTrades(JSON.parse(storedTrades));

            const storedWithdrawals = localStorage.getItem('withdrawals');
            if (storedWithdrawals) setWithdrawals(JSON.parse(storedWithdrawals));
            
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
    
    const handlePurchase = (itemName: string, price: number) => {
        if (netProfit >= price) {
            const newWithdrawal: Withdrawal = {
                id: crypto.randomUUID(),
                amount: price,
                date: new Date().toISOString(),
                notes: `Desbloqueo IA: ${itemName}`,
            };
            
            const updatedWithdrawals = [...withdrawals, newWithdrawal];
            setWithdrawals(updatedWithdrawals);
            localStorage.setItem('withdrawals', JSON.stringify(updatedWithdrawals));
            
            toast({
                title: '¡Análisis Desbloqueado!',
                description: `Has gastado ${formatCurrency(price)}. Tu nuevo saldo se ha actualizado. La función de IA ahora está disponible.`,
            });
             // Trigger storage event to update other tabs, like the main dashboard
            window.dispatchEvent(new StorageEvent('storage', { key: 'withdrawals' }));
        } else {
            toast({
                variant: 'destructive',
                title: 'Saldo Insuficiente',
                description: `No tienes suficiente saldo para desbloquear esta función. Necesitas ${formatCurrency(price)}.`,
            });
        }
    };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Bot className="h-8 w-8 mr-3 text-gray-500" />
              Asistente de IA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu compañero IA para analizar y mejorar tu trading.</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {botActions.map((item) => (
            <Card key={item.title}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <item.icon className="h-6 w-6 text-primary" />
                        {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => handlePurchase(item.title, item.price)} className="w-full" disabled={netProfit < item.price}>
                        <Lock className="mr-2 h-4 w-4" />
                        Desbloquear Análisis ({formatCurrency(item.price)})
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default BotPage;
