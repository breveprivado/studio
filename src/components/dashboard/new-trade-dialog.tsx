"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown, Smile, Frown, Meh, Star } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trade, Emotion } from '@/lib/types';
import { es } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { currencyPairs } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  pair: z.string().min(1, 'La descripción es requerida'),
  status: z.enum(['win', 'loss'], { required_error: 'El resultado es requerido' }),
  profit: z.coerce.number(),
  pips: z.coerce.number().optional(),
  lotSize: z.coerce.number().optional(),
  date: z.date({ required_error: 'La fecha es requerida' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  emotion: z.enum(['happy', 'neutral', 'sad']).optional(),
  discipline: z.number().min(1).max(5).optional(),
});

type NewTradeFormValues = z.infer<typeof formSchema>;

interface NewTradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
}

const strategyOptions = [
    '1G', '2G', '3G', '4G', '5G',
    '1C', '2C', '3C', '4C'
];

const NewTradeDialog: React.FC<NewTradeDialogProps> = ({ isOpen, onOpenChange, onAddTrade }) => {
  const [openPairCombobox, setOpenPairCombobox] = useState(false);
  const [disciplineRating, setDisciplineRating] = useState<number | undefined>(undefined);

  const form = useForm<NewTradeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pair: '',
      profit: 0,
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      strategy: '',
      notes: '',
      emotion: 'neutral',
      discipline: undefined,
    },
  });

  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  function onSubmit(data: NewTradeFormValues) {
    const [hours, minutes] = data.time.split(':');
    const tradeDate = new Date(data.date);
    tradeDate.setHours(parseInt(hours), parseInt(minutes));

    const finalProfit = data.status === 'win' ? Math.abs(data.profit) : -Math.abs(data.profit);

    const newTrade: Omit<Trade, 'id'> = {
      ...data,
      date: tradeDate.toISOString(),
      profit: finalProfit,
      status: data.status,
      strategyColor: data.strategy ? stringToColor(data.strategy) : undefined,
      discipline: disciplineRating,
    };
    onAddTrade(newTrade);
    form.reset({
      pair: '',
      profit: 0,
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      strategy: '',
      notes: '',
      emotion: 'neutral',
      discipline: undefined,
    });
    setDisciplineRating(undefined);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Operación</DialogTitle>
          <DialogDescription>
            Registra los detalles de tu operación para analizar tu rendimiento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="pair"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Descripción</FormLabel>
                    <Popover open={openPairCombobox} onOpenChange={setOpenPairCombobox}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPairCombobox}
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? currencyPairs.find(
                                        (pair) => pair.value.toLowerCase() === field.value.toLowerCase()
                                    )?.label ?? field.value
                                    : "Selecciona o escribe un par"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command
                                filter={(value, search) => {
                                  if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                                  return 0;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const currentValue = form.getValues('pair');
                                        if (currentValue && !currencyPairs.some(p => p.value.toLowerCase() === currentValue.toLowerCase())) {
                                            field.onChange(currentValue);
                                        }
                                        setOpenPairCombobox(false);
                                    }
                                }}
                            >
                                <CommandInput 
                                    placeholder="Buscar o crear par..." 
                                    onValueChange={(search) => {
                                      field.onChange(search);
                                    }}
                                />
                                <CommandList>
                                <CommandEmpty>
                                  <CommandItem
                                      value={form.getValues('pair')}
                                      onSelect={(currentValue) => {
                                          form.setValue("pair", currentValue)
                                          setOpenPairCombobox(false)
                                      }}
                                    >
                                      Crear "{form.getValues('pair')}"
                                    </CommandItem>
                                </CommandEmpty>
                                <CommandGroup>
                                {currencyPairs.map((pair) => (
                                    <CommandItem
                                        value={pair.value}
                                        key={pair.value}
                                        onSelect={(currentValue) => {
                                            form.setValue("pair", currentValue === field.value ? "" : currentValue)
                                            setOpenPairCombobox(false)
                                        }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        pair.value.toLowerCase() === field.value.toLowerCase()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {pair.label}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Resultado</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el resultado" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="win">Ganada</SelectItem>
                            <SelectItem value="loss">Perdida</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficio/Pérdida (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="pips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pips (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lote (Opcional)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="strategy"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Etiqueta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una etiqueta" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {strategyOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                ) : (
                                    <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>
             <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora (HH:MM)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emotion"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>¿Qué tan seguro estabas de la operación?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="happy" id="happy" className="sr-only" />
                        </FormControl>
                        <Label htmlFor="happy" className={cn("p-2 rounded-full cursor-pointer", field.value === 'happy' && 'bg-green-100 dark:bg-green-900/50')}>
                           <Smile className={cn("h-7 w-7 text-gray-400", field.value === 'happy' && 'text-green-500')} />
                        </Label>
                      </FormItem>
                       <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                           <RadioGroupItem value="neutral" id="neutral" className="sr-only" />
                        </FormControl>
                        <Label htmlFor="neutral" className={cn("p-2 rounded-full cursor-pointer", field.value === 'neutral' && 'bg-yellow-100 dark:bg-yellow-900/50')}>
                          <Meh className={cn("h-7 w-7 text-gray-400", field.value === 'neutral' && 'text-yellow-500')} />
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                           <RadioGroupItem value="sad" id="sad" className="sr-only" />
                        </FormControl>
                        <Label htmlFor="sad" className={cn("p-2 rounded-full cursor-pointer", field.value === 'sad' && 'bg-red-100 dark:bg-red-900/50')}>
                           <Frown className={cn("h-7 w-7 text-gray-400", field.value === 'sad' && 'text-red-500')} />
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>¿Respetaste tu Stop Loss y tu plan?</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <Star
                                        key={rating}
                                        className={cn(
                                            "h-7 w-7 cursor-pointer text-gray-300 dark:text-gray-600",
                                            (disciplineRating || 0) >= rating && "text-yellow-400"
                                        )}
                                        onClick={() => {
                                            const newRating = rating === disciplineRating ? undefined : rating;
                                            setDisciplineRating(newRating);
                                            field.onChange(newRating);
                                        }}
                                    />
                                ))}
                            </div>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade detalles sobre la operación..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Operación</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTradeDialog;
