"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const TimezoneClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timeZone,
    }).format(date);
  };

  const timezones = [
    { name: 'Nueva York', tz: 'America/New_York' },
    { name: 'Londres', tz: 'Europe/London' },
    { name: 'Tokio', tz: 'Asia/Tokyo' },
  ];

  return (
    <Card className="mb-8 bg-white/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
          <Clock className="h-5 w-5 mr-3 text-primary" />
          Zonas Horarias del Mercado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {timezones.map(({ name, tz }) => (
            <div key={name} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="font-semibold text-gray-700 dark:text-gray-300">{name}</p>
              <p className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider">
                {formatTime(time, tz)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneClock;
