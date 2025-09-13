"use client";

import React, { useState, useMemo, useEffect } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarProvider, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutGrid, BookHeart, Gamepad2, ClipboardCheck, BookOpen, Users, Award, Store, Sun, Moon, Trophy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/obligatorio", label: "Obligatorio", icon: ClipboardCheck, color: "bg-blue-500 text-white dark:bg-blue-600 dark:text-white" },
    { href: "/journal", label: "Bitácora", icon: BookOpen, color: "bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black" },
    { href: "/bestiario", label: "Bestiario", icon: BookHeart, color: "bg-red-500 text-white dark:bg-red-600 dark:text-white" },
    { href: "/misiones", label: "Misiones", icon: Gamepad2, color: "bg-orange-500 text-white dark:bg-orange-600 dark:text-white" },
    { href: "/bestiario/logros", label: "Panel de Logros", icon: Award, color: "bg-amber-500 text-white dark:bg-amber-600 dark:text-white" },
    { href: "/gremio", label: "Gremio", icon: Users, color: "bg-purple-500 text-white dark:bg-purple-600 dark:text-white" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Olimpo Wallet - Bitácora de Operaciones</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
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
             <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
