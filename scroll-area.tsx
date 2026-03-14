"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Anchor, ShieldOff, BrainCircuit, BookCheck, ShieldQuestion, Scale, Check } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

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

interface DisciplineSpellsProps {
    isEditable?: boolean;
    completedRuleIds?: string[];
    onCompletedChange?: (ruleId: string, isCompleted: boolean) => void;
}

const DisciplineSpells: React.FC<DisciplineSpellsProps> = ({ isEditable = false, completedRuleIds = [], onCompletedChange }) => {
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
            const isCompleted = completedRuleIds.includes(rule.id);
            return (
              <div 
                key={rule.id} 
                className={cn(
                    "flex items-start gap-4 p-3 rounded-lg border transition-colors",
                    isCompleted && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                )}
              >
                {isEditable ? (
                     <Checkbox
                        id={`rule-${rule.id}`}
                        checked={isCompleted}
                        onCheckedChange={(checked) => onCompletedChange?.(rule.id, !!checked)}
                        className="mt-1"
                    />
                ) : (
                     isCompleted ? <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> : <div className="w-5 h-5 mt-1"/>
                )}
                <Label htmlFor={`rule-${rule.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-primary" />
                          </div>
                      </div>
                      <div>
                          <p className="font-semibold text-sm">{rule.text}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                          )}
                      </div>
                    </div>
                </Label>
              </div>
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
