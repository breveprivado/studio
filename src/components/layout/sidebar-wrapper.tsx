"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarProvider, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Shield, LayoutGrid, ClipboardCheck, BookOpen, BookHeart, Gamepad2, Award, Users, Store, Sun, Moon, Bot } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid, color: "bg-blue-500 text-white" },
    { href: "/obligatorio", label: "Obligatorio", icon: ClipboardCheck, color: "bg-red-500 text-white" },
    { href: "/journal", label: "Bitácora", icon: BookOpen, color: "bg-yellow-400 text-black" },
    { href: "/bestiario", label: "Bestiario", icon: BookHeart, color: "bg-purple-500 text-white" },
    { href: "/misiones", label: "Misiones", icon: Gamepad2, color: "bg-orange-500 text-white" },
    { href: "/bestiario/logros", label: "Panel de Logros", icon: Award, color: "bg-amber-500 text-white" },
    { href: "/gremio", label: "Gremio", icon: Users, color: "bg-cyan-500 text-white" },
    { href: "/bot", label: "Bot", icon: Bot, color: "bg-gray-600 text-white" },
];

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const darkMode = storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(darkMode);
    if(darkMode) {
        document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Shield className="h-6 w-6 text-primary" /></Button>
            <span className="text-lg font-semibold text-sidebar-foreground">Olimpo Wallet</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                        <SidebarMenuButton 
                         isActive={pathname === item.href}
                         className={cn(pathname === item.href && item.color)}
                        >
                            <item.icon/>
                            {item.label}
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
              <SidebarMenuItem>
                <Link href="/tienda">
                  <SidebarMenuButton 
                      isActive={pathname === '/tienda'}
                      className="bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold hover:scale-105 transition-transform shadow-md"
                  >
                      <Store/>
                      Tienda
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='items-center'>
            <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5" />
                <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    />
                <Moon className="h-5 w-5" />
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
