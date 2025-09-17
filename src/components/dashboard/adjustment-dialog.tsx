
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
import { Textarea } from '@/components/ui/textarea';
import { Adjustment } from '@/lib/types';


const formSchema = z.object({
  amount: z.coerce.number(),
  notes: z.string().optional(),
});

type AdjustmentFormValues = z.infer<typeof formSchema>;

interface AdjustmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAdjustment: (adjustment: Omit<Adjustment, 'id' | 'date'>) => void;
}

const AdjustmentDialog: React.FC<AdjustmentDialogProps> = ({ isOpen, onOpenChange, onAddAdjustment }) => {

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      notes: 'CORRECCIÓN',
    },
  });

  function onSubmit(data: AdjustmentFormValues) {
    onAddAdjustment(data);
    form.reset({ amount: 0, notes: 'CORRECCIÓN' });
    onOpenChange(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Saldo</DialogTitle>
          <DialogDescription>
            Registra una corrección manual en tu cuenta. Usa un valor negativo para restar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto del Ajuste (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                    <Textarea placeholder="Ej: Corrección de error, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Ajuste</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustmentDialog;
