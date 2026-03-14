import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Olimpo Wallet - Bitácora de Operaciones</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
        <Toaster />
      </body>
    </html>
  );
}
