
"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateEditorProps {
    date: string;
    onUpdate: (newDate: Date) => void;
}

const DateEditor: React.FC<DateEditorProps> = ({ date, onUpdate }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const currentDate = new Date(date);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            onUpdate(selectedDate);
            setIsOpen(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <span className="cursor-pointer hover:underline" onClick={(e) => {e.stopPropagation(); setIsOpen(true)}}>
                    {format(currentDate, 'dd MMM yyyy, HH:mm', { locale: es })}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={es}
                />
            </PopoverContent>
        </Popover>
    );
}

export default DateEditor;
