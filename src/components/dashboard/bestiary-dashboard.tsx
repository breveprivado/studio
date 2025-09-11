"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Creature } from '@/lib/types';


interface BestiaryDashboardProps {
  creatures: Creature[];
}

const BestiaryDashboard: React.FC<BestiaryDashboardProps> = ({ creatures }) => {
  const sortedCreatures = [...creatures].sort((a, b) => parseInt(a.id) - parseInt(b.id));

  return (
    <Accordion type="single" collapsible className="w-full" id="bestiary-dashboard">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard de Bestias</h2>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCreatures.map(creature => (
                  <div key={creature.id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{creature.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{creature.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{creature.encounters.length}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default BestiaryDashboard;
