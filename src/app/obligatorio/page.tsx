"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const MandatoryItem = ({ text }: { text: string }) => (
  <li className="flex items-start">
    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{text}</span>
  </li>
);

export default function MandatoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Image src="/logo.png" alt="Olimpo Trade Academy Logo" width={40} height={40} className="mr-3 rounded-full" />
              Reglas Obligatorias
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tus principios inquebrantables para el éxito.</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </header>

        <main>
          <Tabs defaultValue="trading" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trading">Trading Obligatorio</TabsTrigger>
              <TabsTrigger value="personaje">Personaje</TabsTrigger>
            </TabsList>
            <TabsContent value="trading">
              <Card className="bg-white dark:bg-neutral-900 mt-6">
                <CardHeader>
                  <CardTitle>Principios de Trading</CardTitle>
                  <CardDescription>Las reglas que rigen cada una de tus operaciones.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <MandatoryItem text="Seguir el plan de trading sin desviaciones emocionales." />
                    <MandatoryItem text="Respetar el Stop Loss una vez establecido. No moverlo en contra." />
                    <MandatoryItem text="No sobre-apalancarse. Gestionar el riesgo en cada operación." />
                    <MandatoryItem text="Analizar el mercado antes de entrar, no durante la operación." />
                    <MandatoryItem text="Aceptar las pérdidas como parte del negocio y aprender de ellas." />
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="personaje">
              <Card className="bg-white dark:bg-neutral-900 mt-6">
                <CardHeader>
                  <CardTitle>Desarrollo de Personaje</CardTitle>
                  <CardDescription>Las cualidades que forjan a un trader de élite.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <MandatoryItem text="Mantener la disciplina dentro y fuera del mercado." />
                    <MandatoryItem text="Estudiar constantemente y buscar la mejora continua." />
                    <MandatoryItem text="Tener paciencia y esperar las oportunidades correctas." />
                    <MandatoryItem text="Cuidar la salud física y mental para un rendimiento óptimo." />
                    <MandatoryItem text="Ser humilde en las ganancias y resiliente en las pérdidas." />
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
