import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Navigation } from "@/components/navigation";
import Home from "@/pages/home";
import DataHarian from "@/pages/data-harian";
import Dashboard from "@/pages/dashboard";
import ArshipTugas from "@/pages/arship-tugas";
import SearchPatient from "@/pages/search-patient";
import NotFound from "@/pages/not-found";
import { setupRouter } from "@/lib/simple-router";

function Router() {
  const [location] = useLocation();
  
  // Setup router untuk SPA
  useEffect(() => {
    // Setup router untuk menangani navigasi
    setupRouter();
    
    // Tangani refresh halaman dan direct URL access
    if (typeof window !== 'undefined') {
      // Jika ada query parameter, pastikan itu dipertahankan
      if (window.location.search && location.indexOf('?') === -1) {
        const fullPath = location + window.location.search;
        window.history.replaceState(null, '', fullPath);
      }
    }
  }, []);

  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/data-harian">{() => <DataHarian />}</Route>
      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/arship-tugas" component={ArshipTugas}/>
      <Route path="/search-patient" component={SearchPatient}/>
      <Route component={NotFound}/>
    </Switch>
  );
}

// Import ErrorBoundary, Refresh Handler dan Asset Fix
import ErrorBoundary from "@/lib/error-boundary";
import setupRefreshHandler from "@/lib/refresh-handler";
import setupAssetFix from "@/lib/asset-fix";

// Setup handlers
setupRefreshHandler();
setupAssetFix();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation />
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
