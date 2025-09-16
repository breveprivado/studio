"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Anchor, ShieldOff, BrainCircuit, BookCheck, ShieldQuestion, Scale } from 'lucide-react';

interface MandatoryRule {
  id: string;
  text: string;
  description: string;
}

const defaultIcons = [Target, ShieldOff, Anchor, BrainCircuit, BookCheck, Scale];

const IconMap: { [key: string]: React.ElementType } = {
  't1': Target,
  't2': ShieldOff,
  't3': Scale,
  't4': BrainCircuit,
  't5': BookCheck,
  't6': BrainCircuit,
};

const DisciplineSpells = () => {
  const [tradingRules, setTradingRules] = useState<MandatoryRule[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedItems = localStorage.getItem('mandatoryItems_trading');
    if (storedItems) {
      try {
        setTradingRules(JSON.parse(storedItems));
      } catch (e) {
        console.error("Failed to parse trading rules from localStorage", e);
      }
    }
  }, []);

  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hechizos de Disciplina</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-10" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hechizos de Disciplina</CardTitle>
        <CardDescription>Tus principios de trading como recordatorios visuales.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tradingRules.length > 0 ? (
          tradingRules.map((rule, index) => {
            const Icon = IconMap[rule.id] || defaultIcons[index] || ShieldQuestion;
            return (
              <Card key={rule.id} className="p-3 bg-gray-50 dark:bg-neutral-800/50">
                  <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-primary" />
                          </div>
                      </div>
                      <div className="flex-1">
                          <p className="font-semibold text-sm">{rule.text}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                          )}
                      </div>
                  </div>
              </Card>
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No se encontraron principios de trading. Ve a la sección "Obligatorio" para añadirlos.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DisciplineSpells;
