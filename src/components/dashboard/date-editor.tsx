
"use client";

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateEditorProps {
    date: string;
    onUpdate: (newDate: Date) => void;
}

const DateEditor: React.FC<DateEditorProps> = ({ date, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date(date));
    const [time, setTime] = useState(format(new Date(date), 'HH:mm'));

    useEffect(() => {
        const newDateObj = new Date(date);
        setCurrentDate(newDateObj);
        setTime(format(newDateObj, 'HH:mm'));
    }, [date]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const [hours, minutes] = time.split(':');
            selectedDate.setHours(parseInt(hours), parseInt(minutes));
            setCurrentDate(selectedDate);
            onUpdate(selectedDate);
            setIsOpen(false);
        }
    };
    
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
    }
    
    const handleTimeBlur = () => {
        const [hours, minutes] = time.split(':');
        const newDateWithTime = new Date(currentDate);
        newDateWithTime.setHours(parseInt(hours), parseInt(minutes));
        
        if (newDateWithTime.getTime() !== currentDate.getTime()) {
             setCurrentDate(newDateWithTime);
             onUpdate(newDateWithTime);
        }
    }


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
                <div className="p-2 border-t">
                    <label className="text-sm font-medium">Hora</label>
                    <Input 
                        type="time" 
                        value={time}
                        onChange={handleTimeChange}
                        onBlur={handleTimeBlur}
                        className="mt-1"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default DateEditor;
