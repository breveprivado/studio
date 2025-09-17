
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


const formSchema = z.object({
  newBalance: z.coerce.number(),
});

type AdjustmentFormValues = z.infer<typeof formSchema>;

interface AdjustmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAdjustment: (newTotalBalance: number) => void;
  netProfit: number;
}

const AdjustmentDialog: React.FC<AdjustmentDialogProps> = ({ isOpen, onOpenChange, onAddAdjustment, netProfit }) => {

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newBalance: netProfit,
    },
  });
  
  React.useEffect(() => {
    if (isOpen) {
      form.setValue('newBalance', netProfit);
    }
  }, [isOpen, netProfit, form]);


  function onSubmit(data: AdjustmentFormValues) {
    onAddAdjustment(data.newBalance);
    form.reset({ newBalance: 0 });
    onOpenChange(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Saldo Final</DialogTitle>
          <DialogDescription>
            Introduce el saldo final que deseas tener. El sistema calculará y registrará la diferencia como una corrección.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="newBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuevo Saldo Final (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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

    