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
import { cn } from '@/lib/utils';

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
        const rate = parseFloat(exchangeRate);
        const gain = parseFloat(gainPercentage) / 100;

        if (isNaN(balance) || isNaN(rate) || isNaN(gain) || balance <= 0) {
            return [];
        }

        let data = [];
        let currentEscaleras = balance;
        let gananciaTotalAcumulada = 0;

        const sortedCreatures = [...creatures].sort((a, b) => parseInt(a.id) - parseInt(b.id));

        for (let i = 1; i <= 17; i++) {
            const gananciaCruda = currentEscaleras * gain;
            gananciaTotalAcumulada += gananciaCruda;
            
            const gananciaPorEscalera = currentEscaleras * gain * (i === 1 ? 1 : (i <= 6 ? 1.1 : (i <= 11 ? 1.2 : 1.3))); // This logic is a guess
            const incorrectGananciaPorEscalera = balance + gananciaTotalAcumulada - currentEscaleras;

            const creature = sortedCreatures[i - 1];
            const creatureName = creature?.name || `Bestia #${i}`;
            
            data.push({
                level: i,
                name: creatureName,
                escaleras: currentEscaleras,
                gananciaCruda: gananciaCruda,
                gananciaTotal: gananciaTotalAcumulada,
                gananciaEnCOP: gananciaTotalAcumulada * rate,
                gananciaPorEscalera: currentEscaleras + gananciaCruda, // This seems to match the logic of the image where previous escaleras + ganancia cruda = new escaleras
            });

             currentEscaleras = currentEscaleras + gananciaCruda;
        }

        return data;
    }, [initialBalance, exchangeRate, gainPercentage, creatures]);

    const formatNumber = (value: number, digits = 2) => {
        if (isNaN(value)) return '0,00';
        return value.toLocaleString('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }
    
    const formatInteger = (value: number) => {
        if (isNaN(value)) return '0';
        return value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const getRowColor = (level: number) => {
        if(level <= 6) return 'bg-purple-200/30 dark:bg-purple-900/30';
        return 'bg-purple-300/30 dark:bg-purple-800/30';
    }

    const getEscaleraColor = (level: number) => {
        if (level <= 6) return 'bg-blue-200/30 dark:bg-blue-900/30';
        if (level <= 11) return 'bg-blue-300/30 dark:bg-blue-800/30';
        return 'bg-blue-400/30 dark:bg-blue-700/30';
    }
    
    const getCOPColor = (level: number) => {
        if(level <= 5) return 'bg-yellow-200/50 dark:bg-yellow-800/30';
        if(level <= 8) return 'bg-yellow-300/50 dark:bg-yellow-700/30';
        if(level <= 12) return 'bg-orange-300/50 dark:bg-orange-700/30';
        return 'bg-orange-400/50 dark:bg-orange-600/30';
    }


    return (
        <>
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
                            <TableHead className="text-center">Total bestias</TableHead>
                            <TableHead className="text-center">Escaleras</TableHead>
                            <TableHead className="text-center">%</TableHead>
                            <TableHead className="text-center">Ganancia cruda</TableHead>
                            <TableHead className="text-center">ganancia total</TableHead>
                            <TableHead className="text-center">GANANCIA POR ESCALERA</TableHead>
                            <TableHead className="text-center">GANANCIA EN COP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interestData.map((row) => (
                            <TableRow key={row.level} className={cn(getRowColor(row.level))}>
                                <TableCell className="text-center font-medium">{row.level}</TableCell>
                                <TableCell className="text-center">{formatNumber(row.escaleras)}</TableCell>
                                <TableCell className="text-center">{parseFloat(gainPercentage).toFixed(0)}%</TableCell>
                                <TableCell className="text-center">{formatNumber(row.gananciaCruda, 2)}</TableCell>
                                <TableCell className="text-center">{formatNumber(row.gananciaTotal)}</TableCell>
                                <TableCell className={cn("text-center font-bold", getEscaleraColor(row.level))}>$ {formatNumber(row.gananciaPorEscalera)}</TableCell>
                                <TableCell className={cn("text-center font-bold", getCOPColor(row.level))}>$ {formatInteger(row.gananciaEnCOP)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             {interestData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    Por favor, introduce un saldo inicial y una ganancia válidos para calcular la tabla.
                </div>
             )}
        </>
    );
}

export default CompoundInterestTable;
