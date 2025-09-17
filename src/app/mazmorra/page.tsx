"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type HabitTask } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay } from 'date-fns';

const MazmorraPage = () => {
  const [tasks, setTasks] = useState<HabitTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const storedTasks = localStorage.getItem('habitTasks');
    if (storedTasks) {
      // Ensure date strings are converted to Date objects for compatibility
      const parsedTasks: HabitTask[] = JSON.parse(storedTasks);
      setTasks(parsedTasks);
    }
  }, []);

  useEffect(() => {
    // Only save to localStorage on the client side after the initial load.
    if (tasks.length > 0 || localStorage.getItem('habitTasks')) {
      localStorage.setItem('habitTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const tasksForSelectedDate = useMemo(() => {
    const selectedDay = startOfDay(selectedDate).toISOString().split('T')[0];
    return tasks.filter(task => task.date === selectedDay);
  }, [tasks, selectedDate]);

  const handleAddTask = () => {
    if (newTaskText.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Tarea vacía',
        description: 'No puedes añadir una tarea sin texto.',
      });
      return;
    }
    const newTask: HabitTask = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      date: startOfDay(selectedDate).toISOString().split('T')[0],
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    toast({
      title: '¡Tarea Añadida!',
      description: `Se ha añadido una nueva tarea para el ${format(selectedDate, 'PPP')}.`,
    });
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: 'Tarea eliminada',
      variant: 'destructive',
    });
  };
  
  const { daysWithTasks, completedDays } = useMemo(() => {
    const daysWithTasks = new Set<Date>();
    const taskStatusByDay: { [key: string]: { total: number, completed: number } } = {};

    tasks.forEach(task => {
        const taskDate = new Date(task.date);
        daysWithTasks.add(startOfDay(taskDate));

        if(!taskStatusByDay[task.date]) {
            taskStatusByDay[task.date] = { total: 0, completed: 0 };
        }
        taskStatus_byDay[task.date].total++;
        if(task.completed) {
            taskStatusByDay[task.date].completed++;
        }
    });

    const completedDays = Object.entries(taskStatusByDay)
        .filter(([_, status]) => status.total > 0 && status.total === status.completed)
        .map(([dateString]) => new Date(dateString));

    return { daysWithTasks: Array.from(daysWithTasks), completedDays };
  }, [tasks]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Dumbbell className="h-8 w-8 mr-3 text-zinc-800 dark:text-zinc-300" />
              Mazmorra del Hábito
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Forja tu disciplina día a día. Selecciona un día y gestiona tus tareas.</p>
          </div>
        </div>
      </header>
      
      <main className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><CalendarIcon className="h-5 w-5 mr-2" />Calendario de Hábitos</CardTitle>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="p-0"
                    modifiers={{ 
                        hasTasks: daysWithTasks,
                        allCompleted: completedDays,
                    }}
                    modifiersStyles={{
                        hasTasks: {
                            // @ts-ignore
                            '--day-border-color': 'hsl(var(--primary))',
                            borderStyle: 'solid',
                            borderWidth: '2px',
                            borderColor: 'var(--day-border-color)',
                            borderRadius: '50%',
                        },
                        allCompleted: {
                            // @ts-ignore
                            '--day-bg-color': 'hsl(var(--chart-2) / 0.3)',
                            backgroundColor: 'var(--day-bg-color)',
                        }
                    }}
                />
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tareas para el {format(selectedDate, 'dd MMMM')}</CardTitle>
                    <CardDescription>Añade los desafíos que quieres conquistar hoy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Ej: Leer 10 páginas..."
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                        <Button onClick={handleAddTask}>
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Desafíos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {tasksForSelectedDate.length > 0 ? (
                            tasksForSelectedDate.map(task => (
                                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={`task-${task.id}`}
                                        checked={task.completed}
                                        onCheckedChange={() => handleToggleTask(task.id)}
                                    />
                                    <label
                                        htmlFor={`task-${task.id}`}
                                        className={cn(
                                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer",
                                            task.completed && "line-through text-muted-foreground"
                                        )}
                                    >
                                        {task.text}
                                    </label>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No hay tareas para este día. ¡Añade tu primer desafío!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>

    </div>
  );
};

export default MazmorraPage;
