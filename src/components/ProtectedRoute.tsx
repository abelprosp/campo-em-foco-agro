
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Sprout, X } from 'lucide-react';
import { useTrialStatus } from "@/hooks/useTrialStatus";
import TrialExpiredScreen from "./TrialExpiredScreen";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { isLoading: trialLoading, isPro, isTrialActive } = useTrialStatus();
  const navigate = useNavigate();

  if (loading || trialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <Sprout className="w-12 h-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  // Se não é Pro e o trial não está ativo, mostrar modal de trial expirado
  if (!isPro && !isTrialActive) {
    const handleUpgrade = () => {
      window.open("https://wa.me/5551999135237?text=Olá!%20Gostaria%20de%20fazer%20upgrade%20para%20o%20plano%20Pro%20do%20AgroAjuda.%20Pode%20me%20ajudar?", "_blank");
    };

    const handleContactExpert = () => {
      window.open("https://wa.me/5551999135237?text=Olá!%20Gostaria%20de%20falar%20com%20um%20especialista%20sobre%20o%20AgroAjuda.%20Pode%20me%20ajudar?", "_blank");
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/landing');
    };

    return (
      <>
        <Outlet />
        <Dialog open modal>
          <DialogContent className="backdrop-blur-sm bg-white/90 pt-2 pb-2 px-8 max-w-2xl">
            <TrialExpiredScreen 
              onUpgrade={handleUpgrade}
              onContactExpert={handleContactExpert}
              onClose={handleLogout}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
