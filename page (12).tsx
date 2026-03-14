"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Crown, ShieldCheck, GitCommitHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

// Helper to generate a large number of members for the demo
const generateInvitees = (count: number) => {
  const names = ["Blade", "Shadow", "Storm", "Iron", "Soul", "Reaper", "Void", "Fang", "Serpent", "Wraith", "Specter", "Rogue"];
  const suffixes = ["strike", "fury", "wind", "heart", "render", "shade", "moon", "sun", "fire", "ice"];
  const classes = ['Espadachín', 'Arquero', 'Mago', 'Clérigo', 'Pícaro', 'Bárbaro', 'Invocador'];
  const members = [];
  for (let i = 1; i <= count; i++) {
    const name = `${names[i % names.length]}${suffixes[i % suffixes.length]}${i}`;
    const member = {
      name: name,
      level: 70 + (i % 25), // Levels between 70 and 94
      role: 'Miembro' as const,
      avatar: `/avatars/${(i % 16) + 1}.png`,
      class: classes[i % classes.length],
      invitees: [],
    };
    members.push(member);
  }
  return members;
}

// New hierarchical data structure with one member having 100 invitees
const guildData = {
  name: 'Titán_Axel',
  level: 125,
  role: 'Líder',
  avatar: '/avatars/01.png',
  class: 'Invocador',
  invitees: [
    {
      name: 'Sombra_Rys',
      level: 110,
      role: 'Miembro',
      avatar: '/avatars/02.png',
      class: 'Espadachín',
      invitees: generateInvitees(100) // This member has 100 direct referrals
    },
    {
      name: 'Aetheria',
      level: 115,
      role: 'Miembro',
      avatar: '/avatars/03.png',
      class: 'Arquero',
      invitees: []
    },
    {
        name: 'IronHeart',
        level: 105,
        role: 'Miembro',
        avatar: '/avatars/08.png',
        class: 'Bárbaro',
        invitees: []
    }
  ]
};

type Member = {
  name: string;
  level: number;
  role: 'Líder' | 'Miembro';
  avatar: string;
  class: string;
  invitees: Member[];
};

const MemberCard = ({ member, isChild }: { member: Member, isChild?: boolean }) => {
    const isLeader = member.role === 'Líder';
    return (
        <div className="flex flex-col items-center">
             <div className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 w-48",
                isLeader 
                    ? "bg-amber-100/50 dark:bg-amber-900/50 border-2 border-amber-400" 
                    : "bg-card border",
                isChild && "scale-90"
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
        </div>
    );
};

// Recursive component to render the pyramid
const ReferralTree = ({ member }: { member: Member }) => {
    return (
        <div className="flex flex-col items-center">
            <MemberCard member={member} />
            {member.invitees && member.invitees.length > 0 && (
                <>
                    {/* Vertical line down */}
                    <div className="w-px h-8 bg-border" />
                    {/* Horizontal line across */}
                    {member.invitees.length > 1 && <div className="w-1/2 h-px bg-border" />}
                    <div className="flex justify-center gap-8 md:gap-16">
                        {member.invitees.map((invitee, index) => (
                             <div key={index} className="flex flex-col items-center relative">
                                 {/* Vertical line up to the horizontal line */}
                                <div className="absolute bottom-full w-px h-8 bg-border" />
                                <ReferralTree member={invitee} />
                             </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const GremioPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          <CardContent className="flex flex-col items-center gap-8 md:gap-12 py-8 overflow-x-auto">
              <ReferralTree member={guildData} />
          </CardContent>
      </Card>
    </div>
  );
};

export default GremioPage;
