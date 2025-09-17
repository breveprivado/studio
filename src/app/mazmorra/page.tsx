"use client";

import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type HabitTask } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const MazmorraPage = () => {
  const [tasks, setTasks] = useState<HabitTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedTasks = localStorage.getItem('habitTasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('habitTasks', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

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
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    toast({
      title: '¡Tarea Añadida!',
      description: 'Un nuevo desafío te espera en la mazmorra.',
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

  if (!isClient) {
    return null; // Or a loading spinner
  }

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
            <p className="text-gray-600 dark:text-gray-400 mt-2">Forja tu disciplina día a día. Añade tareas y complétalas.</p>
          </div>
        </div>
      </header>
      
      <main className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Añadir Nueva Tarea</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex w-full items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Ej: Leer 10 páginas, hacer 30 minutos de ejercicio..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <Button onClick={handleAddTask}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Tarea
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Lista de Tareas</CardTitle>
                <CardDescription>Marca las tareas completadas para forjar tu disciplina.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
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
                        <p className="text-center text-muted-foreground py-6">No hay tareas pendientes. ¡Añade tu primer desafío!</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default MazmorraPage;
