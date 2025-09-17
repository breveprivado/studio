"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarProvider, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Shield, LayoutGrid, ClipboardCheck, BookOpen, BookHeart, Gamepad2, Award, Users, Store, Sun, Moon, Bot, Newspaper, BookCopy, Swords, Sparkles, Landmark, Dumbbell, PartyPopper } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import defaultNavItems from '@/lib/nav-items.json';
import { type NavItem } from '@/lib/types';

const iconMap: { [key: string]: React.ElementType } = {
    LayoutGrid, ClipboardCheck, BookOpen, BookHeart, Gamepad2, Award, Users, Bot, Newspaper, BookCopy, Swords, Sparkles, Landmark, Dumbbell, PartyPopper, Store
};


export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
  const pathname = usePathname();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const darkMode = storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(darkMode);
    if(darkMode) {
        document.documentElement.classList.add('dark');
    }

    const storedNavItems = localStorage.getItem('navItems');
    if (storedNavItems) {
        try {
            setNavItems(JSON.parse(storedNavItems));
        } catch (e) {
            setNavItems(defaultNavItems);
        }
    }

     const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'navItems') {
            const newNavItems = localStorage.getItem('navItems');
             if (newNavItems) {
                try {
                    setNavItems(JSON.parse(newNavItems));
                } catch (e) {
                    setNavItems(defaultNavItems);
                }
            }
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

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
            {navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutGrid;
                return (
                    <SidebarMenuItem key={item.label}>
                        <Link href={item.href} prefetch={true}>
                            <SidebarMenuButton 
                            isActive={pathname === item.href}
                            className={cn(pathname === item.href && item.color)}
                            >
                                <Icon/>
                                {item.label}
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                )
            })}
              <SidebarMenuItem>
                <Link href="/tienda" prefetch={true}>
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
