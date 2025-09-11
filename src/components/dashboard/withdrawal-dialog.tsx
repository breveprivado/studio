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
import { Withdrawal } from '@/lib/types';


const formSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser un número positivo.'),
  notes: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof formSchema>;

interface WithdrawalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'date'>) => void;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({ isOpen, onOpenChange, onAddWithdrawal }) => {

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      notes: '',
    },
  });

  function onSubmit(data: WithdrawalFormValues) {
    const newWithdrawal = {
      ...data,
      date: new Date().toISOString(),
    };
    onAddWithdrawal(newWithdrawal);
    form.reset();
    onOpenChange(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Retiro</DialogTitle>
          <DialogDescription>
            Introduce el monto del retiro y una nota opcional.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto del Retiro (USD)</FormLabel>
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
                    <Textarea placeholder="Ej: Gastos personales, inversión..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Retiro</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
