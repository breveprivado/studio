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
import { BalanceAddition } from '@/lib/types';


const formSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser un número positivo.'),
  notes: z.string().optional(),
});

type BalanceFormValues = z.infer<typeof formSchema>;

interface AddBalanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBalance: (balance: Omit<BalanceAddition, 'id' | 'date'>) => void;
}

const AddBalanceDialog: React.FC<AddBalanceDialogProps> = ({ isOpen, onOpenChange, onAddBalance }) => {

  const form = useForm<BalanceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      notes: '',
    },
  });

  function onSubmit(data: BalanceFormValues) {
    onAddBalance(data);
    form.reset({ amount: 0, notes: '' });
    onOpenChange(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Saldo</DialogTitle>
          <DialogDescription>
            Registra un nuevo depósito o saldo inicial en tu cuenta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto a Añadir (USD)</FormLabel>
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
                    <Textarea placeholder="Ej: Depósito inicial, bonificación..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Saldo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBalanceDialog;
