"use client";

import React from 'react';
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
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trade, Creature } from '@/lib/types';
import { es } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { currencyPairs } from '@/lib/data';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const formSchema = z.object({
  pair: z.string().min(1, 'La divisa es requerida'),
  status: z.enum(['win', 'loss', 'doji'], { required_error: 'El resultado es requerido' }),
  profit: z.coerce.number(),
  pips: z.coerce.number().optional(),
  lotSize: z.coerce.number().optional(),
  date: z.date({ required_error: 'La fecha es requerida' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  creatureId: z.string().optional(),
});

type NewTradeFormValues = z.infer<typeof formSchema>;

interface NewTradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
  creatures: Creature[];
}

const strategyOptions = [
    '1G', '2G', '3G', '4G', '5G',
    '1C', '2C', '3C', '4C'
];

const NewTradeDialog: React.FC<NewTradeDialogProps> = ({ isOpen, onOpenChange, onAddTrade, creatures }) => {
  const [openCombobox, setOpenCombobox] = React.useState(false)

  const form = useForm<NewTradeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pair: '',
      profit: 0,
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      strategy: '',
      notes: '',
      creatureId: '',
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

    let finalProfit = 0;
    if (data.status === 'win') {
      finalProfit = Math.abs(data.profit);
    } else if (data.status === 'loss') {
      finalProfit = -Math.abs(data.profit);
    }

    const newTrade: Omit<Trade, 'id'> = {
      ...data,
      creatureId: data.creatureId === 'none' ? undefined : data.creatureId,
      date: tradeDate.toISOString(),
      profit: finalProfit,
      status: data.status,
      strategyColor: data.strategy ? stringToColor(data.strategy) : undefined,
    };
    onAddTrade(newTrade);
    form.reset({
      pair: '',
      profit: 0,
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      strategy: '',
      notes: '',
      creatureId: ''
    });
    onOpenChange(false);
  }
  
  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if (!currencyPairs.some(p => p.value.toLowerCase() === form.getValues('pair').toLowerCase())) {
        e.preventDefault();
        setOpenCombobox(false);
      }
    }
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
                  <FormItem>
                    <FormLabel>Divisas</FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                    ? field.value
                                    : "Selecciona una divisa o escribe una nueva"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command onKeyDown={handleCommandKeyDown} shouldFilter={false}>
                            <CommandInput
                                placeholder="Busca o crea una divisa..."
                                value={field.value}
                                onValueChange={(value) => {
                                    form.setValue('pair', value.toUpperCase(), { shouldValidate: true });
                                }}
                            />
                            <CommandList>
                                <CommandEmpty>No se encontró la divisa.</CommandEmpty>
                                <CommandGroup>
                                {currencyPairs.filter(pair => pair.value.toLowerCase().includes(form.getValues('pair').toLowerCase())).map((pair) => (
                                    <CommandItem
                                        value={pair.value}
                                        key={pair.value}
                                        onSelect={() => {
                                            form.setValue("pair", pair.value)
                                            setOpenCombobox(false)
                                        }}
                                        >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        pair.value === field.value ? "opacity-100" : "opacity-0"
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
                            <SelectItem value="doji">Empate/Doji</SelectItem>
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
                        <FormLabel>Estrategia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una estrategia" />
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
             <FormField
                control={form.control}
                name="creatureId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bestia Asociada (Opcional)</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una bestia del bestiario" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="none">Ninguna</SelectItem>
                            {creatures.sort((a,b) => parseInt(a.id) - parseInt(b.id)).map((creature) => (
                                <SelectItem key={creature.id} value={creature.id}>
                                    <div className="flex items-center gap-2">
                                        <span>{creature.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
