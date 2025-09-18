
"use client";

import React, { useState, useEffect } from 'react';
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
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Skull, Trophy, Pencil, Trash2, Upload, XCircle, Dumbbell, Zap, BrainCircuit, Heart } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trade, Creature } from '@/lib/types';
import { es } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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
  isPrideTrade: z.boolean().optional(),
  isWorstTrade: z.boolean().optional(),
  imageUrl: z.string().optional(),
  expirationTime: z.string().optional(),
});

type NewTradeFormValues = z.infer<typeof formSchema>;

const defaultStrategies = [
    '1G', '2G', '3G', '4G', '5G',
    '1C', '2C', '3C', '4C'
];

const expirationTimeOptions = [
    "5seg", "10seg", "15seg", "30seg", "45seg", "1minuto",
    "2minuto", "3minuto", "4minuto", "5minuto"
];


interface NewTradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
  creatures: Creature[];
}

const NewTradeDialog: React.FC<NewTradeDialogProps> = ({ isOpen, onOpenChange, onAddTrade, creatures }) => {
  const [isEditStrategiesOpen, setIsEditStrategiesOpen] = useState(false);
  const [strategyOptions, setStrategyOptions] = useState<string[]>(defaultStrategies);
  const [newStrategy, setNewStrategy] = useState('');
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedStrategies = localStorage.getItem('strategyOptions');
    if (storedStrategies) {
      setStrategyOptions(JSON.parse(storedStrategies));
    } else {
      localStorage.setItem('strategyOptions', JSON.stringify(defaultStrategies));
    }
  }, []);

  const handleAddStrategy = () => {
    if (newStrategy && !strategyOptions.includes(newStrategy.toUpperCase())) {
      const updatedStrategies = [...strategyOptions, newStrategy.toUpperCase()];
      setStrategyOptions(updatedStrategies);
      localStorage.setItem('strategyOptions', JSON.stringify(updatedStrategies));
      setNewStrategy('');
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "La estrategia ya existe o el campo está vacío.",
        })
    }
  };

  const handleDeleteStrategy = (strategyToDelete: string) => {
    const updatedStrategies = strategyOptions.filter(s => s !== strategyToDelete);
    setStrategyOptions(updatedStrategies);
    localStorage.setItem('strategyOptions', JSON.stringify(updatedStrategies));
  };


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
      isPrideTrade: false,
      isWorstTrade: false,
      imageUrl: '',
      expirationTime: '',
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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


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
      expirationTime: data.expirationTime || undefined,
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
      creatureId: '',
      isPrideTrade: false,
      isWorstTrade: false,
      imageUrl: '',
      expirationTime: '',
    });
    onOpenChange(false);
  }
  
  const imageUrl = form.watch('imageUrl');

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Operación</DialogTitle>
          <DialogDescription>
            Registra los detalles de tu operación para analizar tu rendimiento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
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
                            <div className="flex items-center gap-2">
                                <FormLabel className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-red-500" />Estrategia</FormLabel>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditStrategiesOpen(true)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
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
            <div className="space-y-2">
                <FormField
                    control={form.control}
                    name="expirationTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" />Tiempo de Expiración</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-2 pt-2"
                                >
                                    {expirationTimeOptions.map(option => (
                                        <FormItem key={option}>
                                            <FormControl>
                                                <Label className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer", field.value === option && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground')}>
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
                  <FormLabel className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-blue-500" />Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade detalles sobre la operación..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Imagen (Opcional)</FormLabel>
                {imageUrl ? (
                  <div className="relative mt-2">
                    <Image src={imageUrl} alt="Vista previa de la operación" width={400} height={200} className="rounded-lg object-cover w-full" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => form.setValue('imageUrl', '')}>
                      <XCircle className="h-4 w-4"/>
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Adjuntar Imagen
                  </Button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="isPrideTrade"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            Orgulloso
                        </FormLabel>
                        </div>
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="isWorstTrade"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                            <Skull className="h-4 w-4 text-destructive" />
                            La peor operación
                        </FormLabel>
                        </div>
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="creatureId"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2"><Heart className="h-4 w-4 text-green-500" />Bestia Asociada (Opcional)</FormLabel>
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
            <DialogFooter className="pt-4">
              <Button type="submit">Guardar Operación</Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={isEditStrategiesOpen} onOpenChange={setIsEditStrategiesOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Estrategias</DialogTitle>
                <DialogDescription>
                    Añade o elimina las estrategias disponibles en el formulario.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex gap-2">
                    <Input 
                        value={newStrategy}
                        onChange={(e) => setNewStrategy(e.target.value)}
                        placeholder="Nueva estrategia (ej: 6G)"
                    />
                    <Button onClick={handleAddStrategy}>Añadir</Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {strategyOptions.map(strategy => (
                        <div key={strategy} className="flex items-center justify-between rounded-md border p-3">
                            <span className="font-medium">{strategy}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteStrategy(strategy)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cerrar</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    <input 
      type="file" 
      ref={fileInputRef} 
      onChange={handleImageUpload} 
      className="hidden" 
      accept="image/*"
    />
    </>
  );
};

export default NewTradeDialog;
    

    

