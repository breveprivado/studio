"use client";

import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DollarSign } from 'lucide-react';
import { type Creature } from '@/lib/types';
import { initialCreatures } from '@/lib/data';
import CompoundInterestTable from '@/components/bestiary/compound-interest-table';


const InteresCompuestoPage = () => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [compoundInterestBalance, setCompoundInterestBalance] = useState(100);

    const loadData = () => {
        const storedCreatures = localStorage.getItem('bestiaryCreatures');
        if (storedCreatures) {
            setCreatures(JSON.parse(storedCreatures));
        } else {
            setCreatures(initialCreatures);
        }
        
        const storedBalance = localStorage.getItem('ci_initialBalance');
        if (storedBalance) {
            setCompoundInterestBalance(parseFloat(storedBalance));
        }
    }

    useEffect(() => {
        loadData();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'bestiaryCreatures' || e.key === 'ci_initialBalance') {
                loadData();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('ci_initialBalance', compoundInterestBalance.toString());
    }, [compoundInterestBalance]);


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <DollarSign className="h-8 w-8 mr-3 text-green-500" />
              Tabla de Interés Compuesto
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Proyecta tu crecimiento de capital paso a paso.</p>
          </div>
        </div>
      </header>

      <main>
        <CompoundInterestTable creatures={creatures} initialBalance={compoundInterestBalance} onBalanceChange={setCompoundInterestBalance} />
      </main>
      
    </div>
  );
};

export default InteresCompuestoPage;
