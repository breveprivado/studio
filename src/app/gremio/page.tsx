"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Crown, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const friends = [
  { name: 'Titán_Axel', level: 125, role: 'Líder', avatar: '/avatars/01.png', class: 'Invocador' },
  { name: 'Sombra_Rys', level: 98, role: 'Miembro', avatar: '/avatars/02.png', class: 'Espadachín' },
  { name: 'Aetheria', level: 110, role: 'Miembro', avatar: '/avatars/03.png', class: 'Arquero' },
  { name: 'Zephyr', level: 85, role: 'Miembro', avatar: '/avatars/04.png', class: 'Espadachín' },
  { name: 'Kael', level: 92, role: 'Miembro', avatar: '/avatars/05.png', class: 'Invocador' },
];

const MemberCard = ({ member }: { member: typeof friends[0] }) => {
    const isLeader = member.role === 'Líder';
    return (
        <div className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1",
            isLeader 
                ? "bg-amber-100/50 dark:bg-amber-900/50 border-2 border-amber-400" 
                : "bg-card border"
        )}>
            <div className={cn(isLeader && "relative")}>
                {isLeader && (
                  <>
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-md opacity-75 animate-pulse-slow"></div>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-sm opacity-60"></div>
                  </>
                )}
                <Avatar className="h-16 w-16 border-2 border-white dark:border-neutral-700 relative">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
            </div>
            <div className="text-center">
                <p className="font-bold text-lg">{member.name}</p>
                <p className="text-sm text-muted-foreground">Nivel {member.level} - {member.class}</p>
            </div>
            {isLeader ? (
                <Badge variant="destructive" className="bg-amber-500 text-white shadow-md"><Crown className="h-3 w-3 mr-1" />{member.role}</Badge>
            ) : (
                <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1" />{member.role}</Badge>
            )}
        </div>
    );
};

const GremioPage = () => {
    const leader = friends.find(f => f.role === 'Líder');
    const members = friends.filter(f => f.role !== 'Líder');
    const tier2 = members.slice(0, 2);
    const tier3 = members.slice(2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Users className="h-8 w-8 mr-3 text-cyan-500" />
              Salón del Gremio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Aquí se reúnen los traders más valientes del Olimpo.</p>
          </div>
        </div>
      </header>

      <Card>
          <CardHeader className="text-center">
              <CardTitle>Miembros del Gremio "Olimpo Trades"</CardTitle>
              <CardDescription>Compañeros de batalla en la conquista del mercado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8 md:gap-12 py-8">
              {/* Tier 1: Leader */}
              {leader && (
                  <div className="flex justify-center">
                      <MemberCard member={leader} />
                  </div>
              )}
              
              {/* Tier 2 */}
              {tier2.length > 0 && (
                <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
                    {tier2.map(member => (
                        <MemberCard key={member.name} member={member} />
                    ))}
                </div>
              )}

              {/* Tier 3 */}
              {tier3.length > 0 && (
                <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
                    {tier3.map(member => (
                        <MemberCard key={member.name} member={member} />
                    ))}
                </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
};

export default GremioPage;
