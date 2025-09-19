"use client";

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth, setYear, setMonth, addDays, subDays, startOfDay, getISOWeek, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, Star, XCircle, Calendar as CalendarIconLucide, Upload, Shield, HelpCircle, CheckCircle, Book, TrendingUp, TrendingDown, ArrowDown, ArrowUp, Plus, Trash2, Percent } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalEntry, PlayerStats, DailyLedgerData, GainPhase } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import DisciplineSpells from '@/components/journal/discipline-spells';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const DailyLedger = ({ selectedDate }: { selectedDate: Date }) => {
    const [initialBalance, setInitialBalance] = useState(100);
    const [gainPhases, setGainPhases] = useState<GainPhase[]>([
        { startWeek: 1, endWeek: 52, weeklyGain: 100, id: crypto.randomUUID() }
    ]);
    const [balances, setBalances] = useState<{ [date: string]: number }>({});
    const [editingBalance, setEditingBalance] = useState<{ date: string; value: string } | null>(null);
    const [percentageToCalculate, setPercentageToCalculate] = useState(10);

    useEffect(() => {
        const storedInitialBalance = localStorage.getItem('dailyLedger_initialBalance');
        if (storedInitialBalance) setInitialBalance(JSON.parse(storedInitialBalance));

        const storedGainPhases = localStorage.getItem('dailyLedger_gainPhases');
        if (storedGainPhases) setGainPhases(JSON.parse(storedGainPhases));

        const storedBalances = localStorage.getItem('dailyLedger_balances');
        if (storedBalances) setBalances(JSON.parse(storedBalances));
        
        const storedPercentage = localStorage.getItem('dailyLedger_percentageToCalculate');
        if (storedPercentage) setPercentageToCalculate(JSON.parse(storedPercentage));
    }, []);
    
    useEffect(() => {
        localStorage.setItem('dailyLedger_initialBalance', JSON.stringify(initialBalance));
    }, [initialBalance]);
     useEffect(() => {
        localStorage.setItem('dailyLedger_gainPhases', JSON.stringify(gainPhases));
    }, [gainPhases]);
    useEffect(() => {
        localStorage.setItem('dailyLedger_balances', JSON.stringify(balances));
    }, [balances]);
     useEffect(() => {
        localStorage.setItem('dailyLedger_percentageToCalculate', JSON.stringify(percentageToCalculate));
    }, [percentageToCalculate]);


    const handleBalanceChange = (date: string, value: string) => {
        setEditingBalance({ date, value });
    };

    const handleBalanceBlur = (date: string) => {
        if (editingBalance && editingBalance.date === date) {
            const newBalanceValue = editingBalance.value;
            setBalances(prev => {
                const newBalances = { ...prev };
                if (newBalanceValue === '' || newBalanceValue === null || isNaN(parseFloat(newBalanceValue))) {
                    delete newBalances[date];
                } else {
                    const newBalance = parseFloat(newBalanceValue);
                    newBalances[date] = newBalance;
                }
                return newBalances;
            });
        }
        setEditingBalance(null);
    };

    const handlePhaseChange = (id: string, field: keyof Omit<GainPhase, 'id'>, value: string) => {
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
            setGainPhases(prevPhases =>
                prevPhases.map(phase =>
                    phase.id === id ? { ...phase, [field]: numericValue } : phase
                )
            );
        }
    };

    const addPhase = () => {
        const lastWeek = gainPhases.reduce((max, p) => Math.max(max, p.endWeek), 0);
        setGainPhases(prev => [
            ...prev,
            { id: crypto.randomUUID(), startWeek: lastWeek + 1, endWeek: lastWeek + 1, weeklyGain: 100 }
        ]);
    };

    const removePhase = (id: string) => {
        setGainPhases(prev => prev.filter(p => p.id !== id));
    };
    
    const formatCurrency = (value: number) => {
        if (isNaN(value)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    }

    const getWeeklyGainForWeek = (weekNumber: number) => {
        const applicablePhase = gainPhases.find(p => weekNumber >= p.startWeek && weekNumber <= p.endWeek);
        return applicablePhase?.weeklyGain ?? gainPhases[0]?.weeklyGain ?? 0;
    };

    const fullYearData = useMemo(() => {
        const data = [];
        const year = new Date().getFullYear();
        const startDate = new Date(year, 8, 13); // September 13 of current year
        
        let lastKnownBalance = initialBalance;
        let weeklyGoal = 0;
        let dailyGoal = 0;

        for (let i = 0; i < 365; i++) {
            const currentDate = startOfDay(addDays(startDate, i));
            const dateKey = format(currentDate, 'yyyy-MM-dd');
            const weekNumber = getWeek(currentDate, { weekStartsOn: 1, firstWeekContainsDate: 4 });
            const isWeekday = currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
            const isMonday = currentDate.getDay() === 1;

            if (isMonday) {
                 const weeklyGain = getWeeklyGainForWeek(weekNumber);
                 dailyGoal = weeklyGain / 5;
            } else if (!isWeekday) {
                dailyGoal = 0;
            }
            
            let projectedBalance = lastKnownBalance + dailyGoal;
            
            const actualBalance = balances[dateKey];
            lastKnownBalance = projectedBalance;
            
            data.push({
                date: currentDate,
                dateKey: dateKey,
                weekNumber,
                dailyGoal: dailyGoal,
                projectedBalance: projectedBalance,
                actualBalance: actualBalance,
            });
        }
        return data;
    }, [initialBalance, gainPhases, balances]);


    const { todayProjected, todayActual, performanceDifference, chartData, percentageValue } = useMemo(() => {
        const today = startOfDay(new Date());
        
        const balancesWithValues = Object.entries(balances)
          .map(([date, balance]) => ({ date: startOfDay(new Date(date)), balance }))
          .filter(item => item.balance != null && !isNaN(item.balance))
          .sort((a,b) => b.date.getTime() - a.date.getTime());
        
        const lastActualBalance = balancesWithValues.length > 0 ? balancesWithValues[0].balance : initialBalance;

        const todayData = fullYearData.find(d => isSameDay(d.date, today));
        const todayProjectedValue = todayData?.projectedBalance ?? initialBalance;
        
        const difference = lastActualBalance - todayProjectedValue;

        const chartDataFormatted = fullYearData.map(d => ({
            name: format(d.date, 'dd MMM'),
            'Saldo Proyectado': d.projectedBalance,
            'Saldo Real': d.actualBalance,
        }));
        
        const calculatedPercentageValue = todayProjectedValue * (percentageToCalculate / 100);
        
        return {
            todayProjected: todayProjectedValue,
            todayActual: lastActualBalance,
            performanceDifference: difference,
            chartData: chartDataFormatted,
            percentageValue: calculatedPercentageValue,
        };
    }, [fullYearData, balances, initialBalance, percentageToCalculate]);


    return (
        <Accordion type="single" collapsible className="w-full" defaultValue="ledger">
            <AccordionItem value="ledger">
                <AccordionTrigger>
                    <div className="flex items-center">
                        <Book className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="font-semibold">Libro Mayor Diario</h3>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div>
                                <Label htmlFor="initial-balance">Saldo Inicial (USD)</Label>
                                <Input
                                    id="initial-balance"
                                    type="number"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(parseFloat(e.target.value))}
                                    className="w-full md:w-1/3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fases de Ganancia</Label>
                                {gainPhases.map((phase) => (
                                <div key={phase.id} className="flex flex-col md:flex-row items-center gap-2 p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Label>Semanas</Label>
                                        <Input
                                            type="number"
                                            value={phase.startWeek}
                                            onChange={(e) => handlePhaseChange(phase.id, 'startWeek', e.target.value)}
                                            className="w-20 h-8"
                                        />
                                        <span>-</span>
                                        <Input
                                            type="number"
                                            value={phase.endWeek}
                                            onChange={(e) => handlePhaseChange(phase.id, 'endWeek', e.target.value)}
                                            className="w-20 h-8"
                                        />
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Label>Meta Semanal (USD)</Label>
                                        <Input
                                            type="number"
                                            value={phase.weeklyGain}
                                            onChange={(e) => handlePhaseChange(phase.id, 'weeklyGain', e.target.value)}
                                            className="w-24 h-8"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePhase(phase.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                ))}
                                <Button onClick={addPhase} variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Añadir Fase
                                </Button>
                            </div>
                            <div className="pt-4 space-y-2">
                                <Label>Calculadora de Porcentaje</Label>
                                <div className="flex flex-col md:flex-row items-center gap-4 p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={percentageToCalculate}
                                            onChange={(e) => setPercentageToCalculate(parseFloat(e.target.value))}
                                            className="w-24 h-8"
                                        />
                                        <Percent className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        del saldo proyectado de hoy ({formatCurrency(todayProjected)}) es = <span className="font-bold text-foreground">{formatCurrency(percentageValue)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Saldo Proyectado Hoy</CardDescription>
                                    <CardTitle className="text-2xl">{formatCurrency(todayProjected)}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Último Saldo Real</CardDescription>
                                    <CardTitle className="text-2xl">{formatCurrency(todayActual)}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className={cn(performanceDifference >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                                <CardHeader className="pb-2">
                                    <CardDescription>Rendimiento vs. Proyectado</CardDescription>
                                    <CardTitle className={cn("text-2xl flex items-center gap-2", performanceDifference >= 0 ? "text-green-600" : "text-red-600")}>
                                       {performanceDifference >= 0 ? <ArrowUp/> : <ArrowDown/>}
                                       {formatCurrency(performanceDifference)}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>
                        
                         <Card>
                            <CardHeader>
                                <CardTitle>Gráfico de Progreso</CardTitle>
                                <CardDescription>Comparación visual de tu saldo real contra el proyectado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `$${value/1000}k`} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="Saldo Proyectado" stackId="1" stroke="#8884d8" fill="#8884d8" />
                                        <Area type="monotone" dataKey="Saldo Real" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>


                        <Card className="max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Semana / Fecha</TableHead>
                                        <TableHead>Meta Diaria (USD)</TableHead>
                                        <TableHead>Saldo Proyectado</TableHead>
                                        <TableHead>Saldo Real</TableHead>
                                        <TableHead>Diferencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fullYearData.map(({ date, dateKey, weekNumber, dailyGoal, projectedBalance, actualBalance }, index) => {
                                        const difference = actualBalance !== undefined ? actualBalance - projectedBalance : undefined;
                                        const isNewWeek = date.getDay() === 1 || index === 0;
                                        
                                        return (
                                            <React.Fragment key={dateKey}>
                                                {isNewWeek && (
                                                    <TableRow className="bg-muted/30">
                                                        <TableCell colSpan={5} className="font-bold text-center">
                                                            Semana {weekNumber}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow className={cn(isSameDay(date, selectedDate) && "bg-muted/50")}>
                                                    <TableCell>{format(date, "EEE, dd MMM", { locale: es })}</TableCell>
                                                    <TableCell>{formatCurrency(dailyGoal)}</TableCell>
                                                    <TableCell>{formatCurrency(projectedBalance)}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={editingBalance?.date === dateKey ? editingBalance.value : (actualBalance ?? '')}
                                                            onChange={(e) => handleBalanceChange(dateKey, e.target.value)}
                                                            onBlur={() => handleBalanceBlur(dateKey)}
                                                            placeholder="-"
                                                            className="h-8 w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "font-bold",
                                                        difference === undefined ? "" :
                                                        difference >= 0 ? "text-green-500" : "text-red-500"
                                                    )}>
                                                        {difference !== undefined ? `${difference >= 0 ? '+' : ''}${formatCurrency(difference)}` : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};


const RatingRules = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
            <div className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Reglas de Calificación</h3>
            </div>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-3 text-sm p-2 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">5 Estrellas:</span> Día perfecto. Disciplina de hierro, arrasaste con todo.</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">4 Estrellas:</span> Buen día, pero con pequeños errores (corazones perdidos sin romper el límite).</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">3 Estrellas:</span> Límite de pérdidas alcanzado (3 corazones). Fin del día.</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">2 Estrellas:</span> No se respetó la estrategia o el Stop Loss.</div></li>
            <li className="flex items-start"><Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2 flex-shrink-0" /><div><span className="font-bold">1 Estrella:</span> Metralleta. Operativa impulsiva y sin control.</div></li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
);


const RatingsDashboard = ({ entries, viewDate, onDateChange }: { entries: JournalEntry[], viewDate: Date, onDateChange: (date: Date) => void }) => {
  const startOfThisWeek = startOfWeek(viewDate, { locale: es });
  const endOfThisWeek = endOfWeek(viewDate, { locale: es });
  const startOfThisMonth = startOfMonth(viewDate);
  const endOfThisMonth = endOfMonth(viewDate);

  const { weeklyAvg, monthlyAvg, weeklyCount, monthlyCount } = useMemo(() => {
    let weeklyStars = 0;
    let weeklyCount = 0;
    let monthlyStars = 0;
    let monthlyCount = 0;

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entry.rating > 0) {
        if (isWithinInterval(entryDate, { start: startOfThisWeek, end: endOfThisWeek })) {
          weeklyStars += entry.rating;
          weeklyCount++;
        }
        if (isWithinInterval(entryDate, { start: startOfThisMonth, end: endOfThisMonth })) {
          monthlyStars += entry.rating;
          monthlyCount++;
        }
      }
    });
    
    const weeklyAvg = weeklyCount > 0 ? weeklyStars / weeklyCount : 0;
    const monthlyAvg = monthlyCount > 0 ? monthlyStars / monthlyCount : 0;

    return { weeklyAvg, monthlyAvg, weeklyCount, monthlyCount };
  }, [entries, startOfThisWeek, endOfThisWeek, startOfThisMonth, endOfThisMonth]);

  const getFeedback = (average: number) => {
    if (average >= 4.5) {
      return { message: "¡Excelente!", description: "Mantienes una disciplina de hierro. Sigue así.", color: "text-green-500" };
    }
    if (average >= 3.5) {
      return { message: "¡Buen trabajo!", description: "Tu consistencia está dando frutos. Hay pequeños detalles por pulir.", color: "text-blue-500" };
    }
    if (average >= 2.5) {
      return { message: "Vas por buen camino.", description: "Hay días buenos y malos. Enfócate en tu plan.", color: "text-yellow-500" };
    }
    return { message: "¡Atención!", description: "Este no es el camino. Revisa tu plan, apégate a tus reglas y no dejes que las emociones te dominen.", color: "text-red-500" };
  };

  const weeklyFeedback = getFeedback(weeklyAvg);
  const monthlyFeedback = getFeedback(monthlyAvg);
  
  const [selectedYear, setSelectedYear] = useState(getYear(viewDate));
  const [selectedMonth, setSelectedMonth] = useState(getMonth(viewDate));
  
  useEffect(() => {
    setSelectedYear(getYear(viewDate));
    setSelectedMonth(getMonth(viewDate));
  }, [viewDate]);

  const years = useMemo(() => {
    const allYears = entries.map(e => getYear(new Date(e.date)));
    const uniqueYears = [...new Set(allYears), getYear(new Date())];
    return uniqueYears.sort((a,b) => b-a);
  }, [entries]);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const handleDateChange = (year: number, month: number) => {
      setSelectedYear(year);
      setSelectedMonth(month);
      const newDate = setMonth(setYear(new Date(), year), month);
      onDateChange(newDate);
  }

  return (
    <Card className="bg-white dark:bg-neutral-900">
      <CardHeader>
        <CardTitle>Dashboard de Calificaciones</CardTitle>
        <CardDescription>Revisa tu rendimiento pasado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
             <div>
                <Label>Año</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => handleDateChange(parseInt(v), selectedMonth)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Mes</Label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => handleDateChange(selectedYear, parseInt(v))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month, index) => <SelectItem key={month} value={index.toString()}>{month}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div>
            <h3 className="font-semibold mb-2">Rendimiento Semanal <span className="text-sm text-gray-500">({format(startOfThisWeek, 'dd MMM')} - {format(endOfThisWeek, 'dd MMM')})</span></h3>
            <div className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Promedio de Estrellas</span>
                    <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-bold text-lg">{weeklyAvg.toFixed(1)}</span>
                    </div>
                </div>
                <p className={`text-sm font-semibold ${weeklyFeedback.color}`}>{weeklyFeedback.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{weeklyFeedback.description}</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">Basado en {weeklyCount} día(s) calificados.</p>
            </div>
        </div>
        <div>
            <h3 className="font-semibold mb-2">Rendimiento Mensual <span className="text-sm text-gray-500">({format(startOfThisMonth, 'MMMM yyyy', { locale: es })})</span></h3>
            <div className="p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Promedio de Estrellas</span>
                    <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-bold text-lg">{monthlyAvg.toFixed(1)}</span>
                    </div>
                </div>
                 <p className={`text-sm font-semibold ${monthlyFeedback.color}`}>{monthlyFeedback.message}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{monthlyFeedback.description}</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">Basado en {monthlyCount} día(s) calificados.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ratingDescriptions: { [key: number]: { title: string, color: string } } = {
    5: { title: "¡Decisiones Excelentes!", color: "text-green-500" },
    4: { title: "Buenas decisiones", color: "text-blue-500" },
    3: { title: "Decisiones Regulares", color: "text-yellow-500" },
    2: { title: "Malas decisiones", color: "text-orange-500" },
    1: { title: "¡Decisiones Terribles!", color: "text-red-500" },
};


export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const [currentRating, setCurrentRating] = useState(0);
  const [currentRatingComment, setCurrentRatingComment] = useState('');
  const [editingRating, setEditingRating] = useState(0);
  const [editingRatingComment, setEditingRatingComment] = useState('');
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);
  
  const ratedDaysCount = useMemo(() => {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      const parsedEntries: JournalEntry[] = JSON.parse(storedEntries);
      return parsedEntries.filter(e => e.rating === 3 || e.rating === 5).length;
    }
    return 0;
  }, [entries]);

  const entryForSelectedDate = useMemo(() => {
    return entries.find(entry => isSameDay(new Date(entry.date), selectedDate));
  }, [entries, selectedDate]);

  useEffect(() => {
    if (entryForSelectedDate) {
      setCurrentEntry(entryForSelectedDate.content);
      setCurrentRating(entryForSelectedDate.rating);
      setCurrentRatingComment(entryForSelectedDate.ratingComment);
      setCurrentImage(entryForSelectedDate.imageUrl || null);
    } else {
      setCurrentEntry('');
      setCurrentRating(0);
      setCurrentRatingComment('');
      setCurrentImage(null);
    }
    setEditingEntryId(null);
  }, [selectedDate, entryForSelectedDate]);
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if(editingEntryId) {
            setEditingImage(result);
        } else {
            setCurrentImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
 const checkSurvivalMissions = (newEntriesList: JournalEntry[], newRating: number) => {
    // Only proceed if the rating is valid for survival
    if (newRating !== 3 && newRating !== 5) return;

    let totalXpGained = 0;
    
    // Get current player stats from storage
    const statsStr = localStorage.getItem('playerStats');
    const storedPlayerStats: PlayerStats = statsStr ? JSON.parse(statsStr) : { xp: 0, startDate: new Date().toISOString(), class: undefined };
    if (typeof storedPlayerStats.xp !== 'number') storedPlayerStats.xp = 0;

    // --- 1. Grant XP for the single day of survival ---
    storedPlayerStats.xp += 100; //XP_PER_SURVIVAL_DAY;
    totalXpGained += 100; //XP_PER_SURVIVAL_DAY;
    toast({
        title: `¡Día Sobrevivido!`,
        description: `Has ganado ${100} XP por tu disciplina de hoy.`
    });

    // --- 2. Check for milestone missions ---
    const currentRatedDays = newEntriesList.filter(e => e.rating === 3 || e.rating === 5).length;
    let milestoneUnlocked = false;
    
    const levelMilestones: { [key: number]: number } = {
        1: 1, 2: 7, 3: 21, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150,
        9: 180, 10: 210, 11: 240, 12: 270, 13: 300, 14: 330, 15: 365,
    };


    Object.entries(levelMilestones).forEach(([level, milestone]) => {
        const xpEarnedForMilestone = JSON.parse(localStorage.getItem(`xpEarned_${milestone}`) || 'false');

        if (currentRatedDays >= milestone && !xpEarnedForMilestone) {
            storedPlayerStats.xp += 500; //XP_PER_SURVIVAL_MISSION;
            totalXpGained += 500; //XP_PER_SURVIVAL_MISSION;
            localStorage.setItem(`xpEarned_${milestone}`, 'true');
            toast({
                title: `¡Misión de Supervivencia Completa!`,
                description: `Has sobrevivido ${milestone} día(s) y ganado ${500} XP!`
            });
            milestoneUnlocked = true;
        }
    });

    // --- 3. Save updated stats and notify other components ---
    if (totalXpGained > 0) {
        localStorage.setItem('playerStats', JSON.stringify(storedPlayerStats));
        // This is a simple way to trigger a storage event for other tabs/pages to listen to.
        localStorage.setItem('xp_updated', Date.now().toString());
    }
  }


  const handleSaveEntry = () => {
    if (currentEntry.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vacía',
        description: 'No puedes guardar una entrada vacía.',
      });
      return;
    }
    
    if (entryForSelectedDate) {
       toast({
        variant: 'destructive',
        title: 'Entrada Duplicada',
        description: 'Ya existe una entrada para este día. Puedes editarla.',
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: selectedDate.toISOString(),
      content: currentEntry,
      rating: currentRating,
      ratingComment: currentRatingComment,
      imageUrl: currentImage,
    };
    
    const newEntries = [newEntry, ...entries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(newEntries);
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));

    checkSurvivalMissions(newEntries, newEntry.rating);
    
    toast({
      title: 'Entrada Guardada',
      description: 'Tu entrada en la bitácora ha sido guardada.',
    });
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    toast({
      title: 'Entrada Eliminada',
      description: 'La entrada de la bitácora ha sido eliminada.',
    });
    if (entryForSelectedDate && entryForSelectedDate.id === id) {
        setCurrentEntry('');
        setCurrentRating(0);
        setCurrentRatingComment('');
        setCurrentImage(null);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditingContent(entry.content);
    setEditingRating(entry.rating || 0);
    setEditingRatingComment(entry.ratingComment || '');
    setEditingImage(entry.imageUrl || null);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingContent('');
    setEditingRating(0);
    setEditingRatingComment('');
    setEditingImage(null);
  };

  const handleUpdateEntry = () => {
    if (editingContent.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vacía',
        description: 'No puedes guardar una entrada vacía.',
      });
      return;
    }
    
    const oldEntry = entries.find(e => e.id === editingEntryId);
    const wasPreviouslyUnratedForSurvival = oldEntry && ![3, 5].includes(oldEntry.rating);

    const newEntries = entries.map(entry =>
      entry.id === editingEntryId
        ? { 
            ...entry, 
            content: editingContent,
            rating: editingRating,
            ratingComment: editingRatingComment,
            imageUrl: editingImage,
          }
        : entry
    );
    setEntries(newEntries);
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));

    // If the entry was not previously rated for survival, check missions
    if (wasPreviouslyUnratedForSurvival) {
        checkSurvivalMissions(newEntries, editingRating);
    }


    const updatedEntry = newEntries.find(e => e.id === editingEntryId);
    if(updatedEntry && isSameDay(new Date(updatedEntry.date), selectedDate)) {
        setCurrentEntry(editingContent);
        setCurrentRating(editingRating);
        setCurrentRatingComment(editingRatingComment);
        setCurrentImage(editingImage);
    }


    handleCancelEdit();
    toast({
      title: 'Entrada Actualizada',
      description: 'Tu entrada ha sido actualizada correctamente.',
    });
  };
  
  const ratedDays = useMemo(() => entries.filter(e => e.rating === 3 || e.rating === 5).map(e => new Date(e.date)), [entries]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-primary" />
              Bitácora de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Un espacio para tus reflexiones y análisis diarios.</p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
          <DailyLedger selectedDate={selectedDate} />

          <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="md:col-span-1 space-y-6">
                    <Card className="bg-white dark:bg-neutral-900">
                      <CardHeader>
                          <CardTitle className="flex items-center"><CalendarIconLucide className="h-5 w-5 mr-2" />Navegación del Diario</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <RatingsDashboard entries={entries} viewDate={selectedDate} onDateChange={setSelectedDate} />
                           <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => date && setSelectedDate(date)}
                              className="p-0 border rounded-md"
                              locale={es}
                              modifiers={{ rated: ratedDays }}
                              modifiersStyles={{ rated: {
                                  // @ts-ignore
                                  '--day-border-color': 'hsl(var(--primary))',
                                  'borderWidth': '2px',
                                  'borderColor': 'var(--day-border-color)',
                                  'borderRadius': '50%',
                                } }}
                          />
                      </CardContent>
                    </Card>
                  <Card className="bg-white dark:bg-neutral-900">
                    <CardHeader>
                        <CardTitle>Entrada para {format(selectedDate, "PPP", { locale: es })}</CardTitle>
                        {!entryForSelectedDate ? (
                            <CardDescription>Añade una nueva entrada para este día.</CardDescription>
                        ) : (
                            <CardDescription>Aquí puedes ver o editar tu entrada.</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {editingEntryId && entryForSelectedDate && editingEntryId === entryForSelectedDate.id ? (
                              // Editing view
                              <>
                                <Textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                  {editingImage && (
                                  <div className="relative">
                                      <Image src={editingImage} alt="Imagen de la entrada" width={400} height={250} className="rounded-lg object-cover w-full" />
                                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setEditingImage(null)}><XCircle className="h-4 w-4"/></Button>
                                  </div>
                                  )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        {editingRating >= 4 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                                        Decisiones del Día
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <Star
                                                key={rating}
                                                className={cn(
                                                    "h-6 w-6 cursor-pointer",
                                                    editingRating >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                                                )}
                                                onClick={() => setEditingRating(rating)}
                                            />
                                        ))}
                                    </div>
                                    {editingRating > 0 && ratingDescriptions[editingRating] && (
                                        <p className={cn("text-sm font-semibold", ratingDescriptions[editingRating].color)}>
                                            {ratingDescriptions[editingRating].title}
                                        </p>
                                    )}
                                </div>
                                <Input
                                    placeholder="Comentario sobre tus decisiones..."
                                    value={editingRatingComment}
                                    onChange={(e) => setEditingRatingComment(e.target.value)}
                                />
                                <div className="flex gap-2 flex-wrap">
                                  <Button onClick={handleUpdateEntry}>Guardar Cambios</Button>
                                  <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                      <Upload className="h-4 w-4 mr-2" />
                                      {editingImage ? 'Cambiar Imagen' : 'Adjuntar Imagen'}
                                  </Button>
                                </div>
                              </>
                            ) : entryForSelectedDate ? (
                              // Display view
                              <div>
                                  {entryForSelectedDate.imageUrl && (
                                    <Image src={entryForSelectedDate.imageUrl} alt="Imagen de la entrada" width={400} height={250} className="rounded-lg object-cover w-full mb-4" />
                                  )}
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{entryForSelectedDate.content}</p>
                                  {entryForSelectedDate.rating > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold">Decisiones:</p>
                                        <div className="flex">
                                          {[1,2,3,4,5].map(star => (
                                            <Star key={star} className={cn("h-5 w-5", entryForSelectedDate.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600')} />
                                          ))}
                                        </div>
                                      </div>
                                      {entryForSelectedDate.rating > 0 && ratingDescriptions[entryForSelectedDate.rating] && (
                                          <p className={cn("text-sm font-semibold mt-2", ratingDescriptions[entryForSelectedDate.rating].color)}>
                                              {ratingDescriptions[entryForSelectedDate.rating].title}
                                          </p>
                                      )}
                                      {entryForSelectedDate.ratingComment && (
                                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">"{entryForSelectedDate.ratingComment}"</p>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex gap-2 mt-4">
                                  <Button onClick={() => handleEditEntry(entryForSelectedDate)}>
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                  </Button>
                                  <Button variant="destructive" onClick={() => handleDeleteEntry(entryForSelectedDate.id)}>
                                    <XCircle className="h-4 w-4 mr-2" /> Eliminar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                                // New entry view
                              <>
                                <Textarea
                                    placeholder="Escribe aquí tu entrada del día..."
                                    value={currentEntry}
                                    onChange={(e) => setCurrentEntry(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                  {currentImage && (
                                  <div className="relative">
                                      <Image src={currentImage} alt="Imagen de la entrada" width={400} height={250} className="rounded-lg object-cover w-full" />
                                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setCurrentImage(null)}><XCircle className="h-4 w-4"/></Button>
                                  </div>
                                  )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        {currentRating >= 4 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                                        Decisiones del Día
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <Star
                                                key={rating}
                                                className={cn(
                                                    "h-6 w-6 cursor-pointer",
                                                    currentRating >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                                                )}
                                                onClick={() => setCurrentRating(rating)}
                                            />
                                        ))}
                                    </div>
                                    {currentRating > 0 && ratingDescriptions[currentRating] && (
                                        <p className={cn("text-sm font-semibold", ratingDescriptions[currentRating].color)}>
                                            {ratingDescriptions[currentRating].title}
                                        </p>
                                    )}
                                </div>
                                <Input
                                    placeholder="Comentario sobre tus decisiones..."
                                    value={currentRatingComment}
                                    onChange={(e) => setCurrentRatingComment(e.target.value)}
                                />
                                <div className="flex gap-2 flex-wrap">
                                  <Button onClick={handleSaveEntry} className="md:w-auto self-end">Guardar Entrada</Button>
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                      <Upload className="h-4 w-4 mr-2" />
                                      {currentImage ? 'Cambiar Imagen' : 'Adjuntar Imagen'}
                                  </Button>
                                </div>
                              </>
                            )}
                        </div>
                    </CardContent>
                  </Card>
              </div>
              <div className="md:col-span-1 space-y-4">
                  <DisciplineSpells />
                  <RatingRules />
              </div>
          </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
}
