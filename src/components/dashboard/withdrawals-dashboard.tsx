"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Withdrawal } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Banknote, BookText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface WithdrawalsDashboardProps {
  withdrawals: Withdrawal[];
  formatCurrency: (value: number) => string;
}

const WithdrawalsDashboard: React.FC<WithdrawalsDashboardProps> = ({ withdrawals, formatCurrency }) => {
    if (withdrawals.length === 0) {
        return null;
    }

    return (
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <div className="flex items-center">
                        <Banknote className="h-6 w-6 text-primary mr-3" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Historial de Retiros</h2>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {withdrawals.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(w => (
                                    <div key={w.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-primary">{formatCurrency(w.amount)}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(w.date), "dd MMM yyyy, HH:mm", { locale: es })}</p>
                                            </div>
                                             {w.notes && (
                                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 max-w-xs text-right">
                                                    <BookText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <p className="italic">"{w.notes}"</p>
                                                </div>
                                             )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default WithdrawalsDashboard;
