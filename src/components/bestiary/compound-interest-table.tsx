"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Creature } from '@/lib/types';

interface CompoundInterestTableProps {
    creatures: Creature[];
    initialBalance: number;
    onBalanceChange: (newBalance: number) => void;
}

const CompoundInterestTable: React.FC<CompoundInterestTableProps> = ({ creatures, initialBalance, onBalanceChange }) => {
    const [gainPercentage, setGainPercentage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ci_gainPercentage') || '80';
        }
        return '80';
    });
    const [exchangeRate, setExchangeRate] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ci_exchangeRate') || '4000';
        }
        return '4000';
    });
     const [localBalance, setLocalBalance] = useState(initialBalance.toString());

    useEffect(() => {
        setLocalBalance(initialBalance.toString());
    }, [initialBalance]);

    useEffect(() => {
        localStorage.setItem('ci_gainPercentage', gainPercentage);
    }, [gainPercentage]);
    
    useEffect(() => {
        localStorage.setItem('ci_exchangeRate', exchangeRate);
    }, [exchangeRate]);

    const handleBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalBalance(e.target.value);
    };

    const handleBalanceBlur = () => {
        const newBalance = parseFloat(localBalance);
        if (!isNaN(newBalance)) {
            onBalanceChange(newBalance);
        } else {
            setLocalBalance(initialBalance.toString());
        }
    };


    const interestData = useMemo(() => {
        const balance = initialBalance;
        const percentage = parseFloat(gainPercentage) / 100;
        const rate = parseFloat(exchangeRate);

        if (isNaN(balance) || isNaN(percentage) || isNaN(rate) || balance <= 0 || percentage <= 0 || rate <= 0) {
            return [];
        }

        let data = [];
        let accumulatedGain = 0;
        let escalerasCapital = balance;
        
        const sortedCreatures = [...creatures].sort((a, b) => parseInt(a.id) - parseInt(b.id));

        for (let i = 1; i <= 17; i++) {
            const gananciaCruda = escalerasCapital * percentage;
            const gananciaTotalAcumulada = accumulatedGain + gananciaCruda;
            
            const creature = sortedCreatures[i - 1];
            const creatureName = creature?.name || `Bestia #${i}`;
            
            data.push({
                level: i,
                name: creatureName,
                escaleras: escalerasCapital,
                gananciaCruda: gananciaCruda,
                gananciaTotal: gananciaTotalAcumulada,
                gananciaEnCOP: (gananciaTotalAcumulada * rate),
            });

            escalerasCapital += gananciaCruda;
            accumulatedGain = gananciaTotalAcumulada;
        }

        return data;
    }, [initialBalance, gainPercentage, exchangeRate, creatures]);

    const formatNumber = (value: number, digits = 2) => {
        if (isNaN(value)) return '0,00';
        return value.toLocaleString('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }
    
    const formatInteger = (value: number) => {
        if (isNaN(value)) return '0';
        return value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    return (
        <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <Label htmlFor="initial-balance">Saldo Inicial (USD)</Label>
                        <Input
                            id="initial-balance"
                            type="number"
                            value={localBalance}
                            onChange={handleBalanceInputChange}
                            onBlur={handleBalanceBlur}
                            placeholder="100"
                        />
                    </div>
                    <div>
                        <Label htmlFor="gain-percentage">Ganancia (%)</Label>
                        <Input
                            id="gain-percentage"
                            type="number"
                            value={gainPercentage}
                            onChange={(e) => setGainPercentage(e.target.value)}
                            placeholder="80"
                        />
                    </div>
                    <div>
                        <Label htmlFor="exchange-rate">Tasa de Cambio (USD a COP)</Label>
                        <Input
                            id="exchange-rate"
                            type="number"
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(e.target.value)}
                            placeholder="4000"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Total Bestias</TableHead>
                                <TableHead className="text-center">Escaleras</TableHead>
                                <TableHead className="text-center">Ganancia Cruda</TableHead>
                                <TableHead className="text-center">GANANCIA POR ESCALERA ($)</TableHead>
                                <TableHead className="text-center">GANANCIA EN COP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interestData.map((row) => (
                                <TableRow key={row.level} className={row.level <= 6 ? 'bg-amber-50 dark:bg-amber-950/50' : ''}>
                                    <TableCell className="text-center font-medium">{row.name}</TableCell>
                                    <TableCell className="text-center">{formatNumber(row.escaleras)}</TableCell>
                                    <TableCell className="text-center">{formatNumber(row.gananciaCruda, 5)}</TableCell>
                                    <TableCell className={`text-center font-bold ${row.level <= 11 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-emerald-200 dark:bg-emerald-800/50'}`}>$ {formatNumber(row.gananciaTotal)}</TableCell>
                                    <TableCell className={`text-center font-bold ${row.level <= 8 ? 'bg-amber-200 dark:bg-amber-700/40' : 'bg-orange-300 dark:bg-orange-700/50'}`}>$ {formatInteger(row.gananciaEnCOP)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {interestData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        Por favor, introduce valores válidos y positivos en los campos de arriba para calcular la tabla.
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}

export default CompoundInterestTable;
