"use client";

import React, { useEffect, useRef, memo, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const TradingViewEventsWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Detect theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    const darkMode = storedTheme === 'dark' || (storedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(darkMode ? 'dark' : 'light');

    // Observer for class changes on <html> element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (container.current && container.current.children.length === 0) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": theme,
        "isTransparent": false,
        "width": "100%",
        "height": "100%",
        "locale": "es",
        "importanceFilter": "-1,0,1",
        "currencyFilter": "USD,EUR,JPY,GBP,CHF,AUD,CAD,NZD,CNY"
      });
      container.current.appendChild(script);
    }
     // Re-render widget on theme change
     else if (container.current) {
        container.current.innerHTML = ""; // Clear previous widget
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": theme,
            "isTransparent": false,
            "width": "100%",
            "height": "100%",
            "locale": "es",
            "importanceFilter": "-1,0,1",
            "currencyFilter": "USD,EUR,JPY,GBP,CHF,AUD,CAD,NZD,CNY"
        });
        container.current.appendChild(script);
     }
  }, [theme]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "calc(100vh - 150px)", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
});

TradingViewEventsWidget.displayName = 'TradingViewEventsWidget';


const NoticiasPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Newspaper className="h-8 w-8 mr-3 text-green-600" />
              Noticias del Mercado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Calendario económico para seguir los eventos que mueven el mercado.</p>
          </div>
        </div>
      </header>
      
      <main>
        <TradingViewEventsWidget />
      </main>

    </div>
  );
};

export default NoticiasPage;
