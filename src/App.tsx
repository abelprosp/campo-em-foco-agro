import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Activities from "./pages/Activities";
import Financial from "./pages/Financial";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Admin from "./pages/Admin";
import Invoice from "./pages/Invoice";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import AlwaysAccessibleRoute from "./components/AlwaysAccessibleRoute";
import ProfilePage from "./pages/Profile";
import { useActivityAlerts } from "./hooks/useActivityAlerts";
import { useWeatherAlerts } from "./hooks/useWeatherAlerts";
import Machines from "./pages/Machines";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();
  useActivityAlerts();
  useWeatherAlerts();
  return (
    <Routes>
      <Route path="/landing" element={!user ? <LandingPage /> : <Navigate to="/" />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      
      {/* Rotas sempre acessíveis (perfil para logout) */}
      <Route element={<AlwaysAccessibleRoute />}>
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      
      {/* Rotas que precisam de trial ativo ou plano Pro */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/atividades" element={<Activities />} />
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/producao" element={<Production />} />
          <Route path="/nota-fiscal" element={<Invoice />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/maquinas" element={<Machines />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <AppRoutes />
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
