import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import CheckIn from "./pages/CheckIn";
import Buddy from "./pages/Buddy";
import Patterns from "./pages/Patterns";
import Wins from "./pages/Wins";
import Weekly from "./pages/Weekly";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<CheckIn />} />
            <Route path="/buddy" element={<Buddy />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/wins" element={<Wins />} />
            <Route path="/weekly" element={<Weekly />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
