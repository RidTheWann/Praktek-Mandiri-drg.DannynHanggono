import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";

import { Navigation } from "@/components/navigation";
import Home from "@/pages/home";
import DataHarian from "@/pages/data-harian";
import Dashboard from "@/pages/dashboard";
import ArshipTugas from "@/pages/arship-tugas";
import SearchPatient from "@/pages/search-patient";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/data-harian">{() => <DataHarian />}</Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/arship-tugas" component={ArshipTugas} />
      <Route path="/search-patient" component={SearchPatient} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <Router />
            <Toaster />
            <Analytics />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
