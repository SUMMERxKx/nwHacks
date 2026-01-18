/**
 * App.tsx — Root component: providers and routing.
 *
 * - /login: Login (no layout, no ProtectedRoute).
 * - /, /buddy, /patterns, /wins: AppLayout + TabNavigation; ProtectedRoute (redirect to /login if not signed in).
 * - *: NotFound.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Buddy from "./pages/Buddy";
// import Patterns from "./pages/Patterns"; // Commented out for now
import Wins from "./pages/Wins";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buddy"
          element={
            <ProtectedRoute>
              <Buddy />
            </ProtectedRoute>
          }
        />
        {/* Patterns route commented out for now */}
        {/* <Route
          path="/patterns"
          element={
            <ProtectedRoute>
              <Patterns />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/wins"
          element={
            <ProtectedRoute>
              <Wins />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
