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
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trade, TradeStatus } from '@/lib/types';
import { es } from 'date-fns/locale';

const formSchema = z.object({
  pair: z.string().min(1, 'El par es requerido'),
  profit: z.coerce.number().refine(val => val !== 0, 'El beneficio no puede ser cero'),
  pips: z.coerce.number(),
  lotSize: z.coerce.number().positive('El lote debe ser positivo'),
  date: z.date({ required_error: 'La fecha es requerida' }),
  strategy: z.string().optional(),
});

type NewTradeFormValues = z.infer<typeof formSchema>;

interface NewTradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
}

const NewTradeDialog: React.FC<NewTradeDialogProps> = ({ isOpen, onOpenChange, onAddTrade }) => {
  const form = useForm<NewTradeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pair: '',
      profit: 0,
      pips: 0,
      lotSize: 0.1,
      date: new Date(),
      strategy: '',
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
    const status: TradeStatus = data.profit > 0 ? 'win' : 'loss';
    const newTrade: Omit<Trade, 'id'> = {
      ...data,
      date: data.date.toISOString(),
      status,
      strategyColor: data.strategy ? stringToColor(data.strategy) : undefined,
    };
    onAddTrade(newTrade);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
                  <FormLabel>Par de Divisas</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: EUR/USD Long" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="pips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pips</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: 1G, 2C" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de la Operación</FormLabel>
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
