"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, DollarSign } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const CurrencyConverter = () => {
    const [usdAmount, setUsdAmount] = useState('1');
    const [exchangeRate, setExchangeRate] = useState('3900'); // Default rate

    const copAmount = useMemo(() => {
        const usd = parseFloat(usdAmount);
        const rate = parseFloat(exchangeRate);
        if (isNaN(usd) || isNaN(rate)) {
            return '0.00';
        }
        return (usd * rate).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [usdAmount, exchangeRate]);


    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex items-center">
                        <DollarSign className="h-6 w-6 text-primary mr-3" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Conversor de Divisas</h2>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <Label htmlFor="usd-amount">Monto (USD)</Label>
                                    <Input
                                        id="usd-amount"
                                        type="number"
                                        value={usdAmount}
                                        onChange={(e) => setUsdAmount(e.target.value)}
                                        placeholder="1.00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exchange-rate">Tasa de Cambio (USD a COP)</Label>
                                    <Input
                                        id="exchange-rate"
                                        type="number"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(e.target.value)}
                                        placeholder="3900"
                                    />
                                </div>
                                <div className="flex items-center justify-center md:justify-start">
                                    <div className="text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900/50 w-full">
                                        <p className="text-sm font-medium text-muted-foreground">Equivalente en COP</p>
                                        <p className="text-lg font-bold text-primary">{copAmount}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default CurrencyConverter;
