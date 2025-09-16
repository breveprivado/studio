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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trade, Creature } from '@/lib/types';
import { es } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  pair: z.string().min(1, 'La divisa es requerida').toUpperCase(),
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
                     <FormControl>
                      <Input placeholder="EURUSD" {...field} />
                    </FormControl>
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
                    <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-2 pt-2"
                        >
                            <FormItem>
                                <FormControl>
                                    <Label className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer", field.value === 'win' && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground')}>
                                        <RadioGroupItem value="win" className="sr-only" />
                                        Ganada
                                    </Label>
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormControl>
                                     <Label className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer", field.value === 'loss' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}>
                                        <RadioGroupItem value="loss" className="sr-only" />
                                        Perdida
                                    </Label>
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormControl>
                                     <Label className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer", field.value === 'doji' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                                        <RadioGroupItem value="doji" className="sr-only" />
                                        Doji
                                    </Label>
                                </FormControl>
                            </FormItem>
                        </RadioGroup>
                    </FormControl>
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
             <div className="space-y-2">
                 <FormField
                    control={form.control}
                    name="strategy"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estrategia</FormLabel>
                             <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-2 pt-2"
                                >
                                    {strategyOptions.map(option => (
                                        <FormItem key={option}>
                                            <FormControl>
                                                <Label className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-12 cursor-pointer", field.value === option && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground')}>
                                                    <RadioGroupItem value={option} className="sr-only" />
                                                    {option}
                                                </Label>
                                            </FormControl>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>
             <div className="grid grid-cols-2 gap-4">
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
                 <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Hora (HH:MM)</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>
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
                    <FormItem className="space-y-3">
                        <FormLabel>Bestia Asociada (Opcional)</FormLabel>
                         <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                            >
                                {creatures.sort((a,b) => parseInt(a.id) - parseInt(b.id)).map((creature) => (
                                    <FormItem key={creature.id}>
                                        <FormControl>
                                            <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary", field.value === creature.id && "border-primary")}>
                                                <RadioGroupItem value={creature.id} className="sr-only" />
                                                <span className="font-semibold text-center text-sm">{creature.name}</span>
                                            </Label>
                                        </FormControl>
                                    </FormItem>
                                ))}
                            </RadioGroup>
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

    