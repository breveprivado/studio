"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Target, Anchor, ShieldOff, BrainCircuit, BookCheck, ShieldQuestion } from 'lucide-react';

interface MandatoryRule {
  id: string;
  text: string;
}

const defaultIcons = [Target, ShieldOff, Anchor, BrainCircuit, BookCheck];

const IconMap: { [key: string]: React.ElementType } = {
  't1': Target,
  't2': ShieldOff,
  't3': Anchor,
  't4': BrainCircuit,
  't5': BookCheck,
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
      <CardContent>
        <TooltipProvider>
            <div className="flex flex-wrap gap-2">
            {tradingRules.map((rule, index) => {
                const Icon = IconMap[rule.id] || defaultIcons[index] || ShieldQuestion;
                return (
                    <Tooltip key={rule.id}>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-12 w-12">
                                <Icon className="h-6 w-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{rule.text}</p>
                        </TooltipContent>
                    </Tooltip>
                )
            })}
            {tradingRules.length === 0 && (
                <p className="text-sm text-muted-foreground">No se encontraron principios de trading.</p>
            )}
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default DisciplineSpells;
