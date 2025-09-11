
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Crown, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const friends = [
  { name: 'Titán_Axel', level: 125, role: 'Líder', avatar: '/avatars/01.png', class: 'Invocador' },
  { name: 'Sombra_Rys', level: 98, role: 'Miembro', avatar: '/avatars/02.png', class: 'Espadachín' },
  { name: 'Aetheria', level: 110, role: 'Miembro', avatar: '/avatars/03.png', class: 'Arquero' },
  { name: 'Zephyr', level: 85, role: 'Miembro', avatar: '/avatars/04.png', class: 'Espadachín' },
  { name: 'Kael', level: 92, role: 'Miembro', avatar: '/avatars/05.png', class: 'Invocador' },
];

const GremioPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Users className="h-8 w-8 mr-3 text-cyan-500" />
              Salón del Gremio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Aquí se reúnen los traders más valientes del Olimpo.</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Miembros del Gremio "Olimpo Trades"</CardTitle>
                <CardDescription>Compañeros de batalla en la conquista del mercado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {friends.map(friend => (
                    <div key={friend.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800/50">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={friend.avatar} alt={friend.name} />
                                <AvatarFallback>{friend.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{friend.name}</p>
                                <p className="text-sm text-muted-foreground">Nivel {friend.level} - {friend.class}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {friend.role === 'Líder' ? (
                                <Badge variant="destructive" className="bg-amber-500 text-white"><Crown className="h-3 w-3 mr-1"/>{friend.role}</Badge>
                            ) : (
                                <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1"/>{friend.role}</Badge>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default GremioPage;
