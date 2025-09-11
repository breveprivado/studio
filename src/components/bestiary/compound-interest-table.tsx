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

const CompoundInterestTable: React.FC = () => {
    const [initialBalance, setInitialBalance] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ci_initialBalance') || '100';
        }
        return '100';
    });
    const [gainPercentage, setGainPercentage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ci_gainPercentage') || '0.86';
        }
        return '0.86';
    });
    const [exchangeRate, setExchangeRate] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ci_exchangeRate') || '4000';
        }
        return '4000';
    });

    useEffect(() => {
        localStorage.setItem('ci_initialBalance', initialBalance);
    }, [initialBalance]);

    useEffect(() => {
        localStorage.setItem('ci_gainPercentage', gainPercentage);
    }, [gainPercentage]);
    
    useEffect(() => {
        localStorage.setItem('ci_exchangeRate', exchangeRate);
    }, [exchangeRate]);

    const interestData = useMemo(() => {
        const balance = parseFloat(initialBalance);
        const percentage = parseFloat(gainPercentage) / 100;
        const rate = parseFloat(exchangeRate);

        if (isNaN(balance) || isNaN(percentage) || isNaN(rate) || balance <= 0 || percentage <= 0 || rate <= 0) {
            return [];
        }

        let data = [];
        let accumulatedGain = 0;

        for (let i = 1; i <= 17; i++) {
            const currentCapital = balance + accumulatedGain;
            const rawGain = currentCapital * percentage;
            accumulatedGain += rawGain;

            const percentageSoFar = (accumulatedGain / balance) * 100;
            
            data.push({
                level: i,
                percentage: `${percentageSoFar.toFixed(2)}%`,
                rawGain: rawGain.toFixed(2),
                totalGain: (balance + accumulatedGain).toFixed(2),
                gainPerStep: accumulatedGain.toFixed(2),
                gainInCOP: (accumulatedGain * rate).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
            });
        }

        return data;
    }, [initialBalance, gainPercentage, exchangeRate]);

    const formatNumber = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0,00';
        return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value)}
                            placeholder="100"
                        />
                    </div>
                    <div>
                        <Label htmlFor="gain-percentage">Ganancia por Op. (%)</Label>
                        <Input
                            id="gain-percentage"
                            type="number"
                            value={gainPercentage}
                            onChange={(e) => setGainPercentage(e.target.value)}
                            placeholder="0.86"
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
                                <TableHead className="text-center">Balance Total ($)</TableHead>
                                <TableHead className="text-center">% Acumulado</TableHead>
                                <TableHead className="text-center">Ganancia cruda ($)</TableHead>
                                <TableHead className="text-center">GANANCIA POR ESCALERA ($)</TableHead>
                                <TableHead className="text-center">GANANCIA EN COP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interestData.map((row) => (
                                <TableRow key={row.level} className={row.level <= 6 ? 'bg-amber-50 dark:bg-amber-950/50' : ''}>
                                    <TableCell className="text-center font-medium">{row.level}</TableCell>
                                    <TableCell className="text-center">{formatNumber(row.totalGain)}</TableCell>
                                    <TableCell className="text-center">{row.percentage}</TableCell>
                                    <TableCell className="text-center">{formatNumber(row.rawGain)}</TableCell>
                                    <TableCell className={`text-center font-bold ${row.level <= 11 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-emerald-200 dark:bg-emerald-800/50'}`}>$ {formatNumber(row.gainPerStep)}</TableCell>
                                    <TableCell className={`text-center font-bold ${row.level <= 8 ? 'bg-amber-200 dark:bg-amber-700/40' : 'bg-orange-300 dark:bg-orange-700/50'}`}>$ {row.gainInCOP}</TableCell>
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
