import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NavLinks } from "./NavLinks";
import { PanelLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/features/profile/api";
import { Badge } from "./ui/badge";
import { Crown, Clock } from "lucide-react";
import { differenceInDays, isFuture } from "date-fns";

const AppSidebar = () => {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["sidebar-profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  let planBadge = null;
  if (profile && profile.user_usage) {
    const { plan_type, trial_end_date } = profile.user_usage;
    if (plan_type === "pro") {
      planBadge = (
        <Badge variant="success" className="gap-2">
          <Crown className="w-4 h-4" /> Plano Pro
        </Badge>
      );
    } else if (trial_end_date && isFuture(new Date(trial_end_date))) {
      const days = differenceInDays(new Date(trial_end_date), new Date());
      planBadge = (
        <Badge variant="secondary" className="gap-2">
          <Clock className="w-4 h-4" /> Teste: {days > 0 ? `${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}` : 'termina hoje'}
        </Badge>
      );
    } else {
      // Trial expirado
      planBadge = (
        <Badge variant="destructive" className="gap-2">
          <Clock className="w-4 h-4" /> Trial Expirado
        </Badge>
      );
    }
  }

  return (
    <>
      {/* Botão fixo para abrir o sidebar quando fechado (desktop) */}
      {!open && (
        <button
          className="hidden md:flex fixed top-4 left-4 z-50 bg-white dark:bg-background border border-gray-200 dark:border-gray-700 rounded-full shadow-lg p-2 hover:bg-muted transition-all"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)" }}
          onClick={() => setOpen(true)}
          aria-label="Mostrar menu"
        >
          <PanelLeft className="w-6 h-6 text-primary" />
        </button>
      )}
      {/* Sidebar suspenso/flutuante */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 flex-col border-r bg-secondary/80 backdrop-blur-md rounded-r-2xl shadow-2xl transition-transform duration-300 md:flex ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ boxShadow: open ? "0 8px 32px 0 rgba(0,0,0,0.18)" : "none" }}
      >
        <div className="flex h-16 items-center border-b px-6 justify-between">
          <NavLink to="/" className="flex items-center">
            <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="AgroAjuda Logo" className="h-8" />
          </NavLink>
          {/* Botão para fechar sidebar no desktop, dentro do header, alinhado à direita */}
          {open && (
            <button
              className="hidden md:flex ml-2 bg-white dark:bg-background border border-gray-200 dark:border-gray-700 rounded-full shadow-lg p-2 hover:bg-muted transition-all"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)" }}
              onClick={() => setOpen(false)}
              aria-label="Ocultar menu"
            >
              <PanelLeft className="w-6 h-6 text-primary" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {planBadge}
            <span className="text-xs text-muted-foreground">
              {planBadge && planBadge.props.children[1]?.props?.children === 'Plano Pro'
                ? 'Você tem acesso a todos os recursos.'
                : planBadge && planBadge.props.children[1]?.props?.children === 'Trial Expirado'
                ? 'Faça upgrade para continuar usando.'
                : null}
            </span>
          </div>
          {/* Botão Fale com um especialista (WhatsApp) */}
          <a
            href="https://wa.me/5551999135237?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20um%20especialista%20AgroAjuda"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2"
          >
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded transition text-sm font-medium shadow ${
              planBadge && planBadge.props.children[1]?.props?.children === 'Trial Expirado'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.72 11.06a6 6 0 10-11.44 2.13L3 21l7.92-2.28A6 6 0 0016.72 11.06z" /></svg>
              {planBadge && planBadge.props.children[1]?.props?.children === 'Trial Expirado'
                ? 'Fazer Upgrade Agora'
                : 'Fale com um especialista'
              }
            </button>
          </a>
        </div>
        <NavLinks />
      </aside>
    </>
  );
};

export default AppSidebar;
