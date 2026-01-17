import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import CheckIn from "./pages/CheckIn";
import Buddy from "./pages/Buddy";
import Patterns from "./pages/Patterns";
import Wins from "./pages/Wins";
import Weekly from "./pages/Weekly";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <AppLayout>
          <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className={!isLoginPage ? "max-w-lg mx-auto px-4 pb-24" : ""}>
                <CheckIn />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/buddy"
          element={
            <ProtectedRoute>
              <div className="max-w-lg mx-auto px-4 pb-24">
                <Buddy />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patterns"
          element={
            <ProtectedRoute>
              <div className="max-w-lg mx-auto px-4 pb-24">
                <Patterns />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wins"
          element={
            <ProtectedRoute>
              <div className="max-w-lg mx-auto px-4 pb-24">
                <Wins />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly"
          element={
            <ProtectedRoute>
              <div className="max-w-lg mx-auto px-4 pb-24">
                <Weekly />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
        </AppLayout>
      )}
      {isLoginPage && <Routes><Route path="/login" element={<Login />} /></Routes>}
    </>
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
