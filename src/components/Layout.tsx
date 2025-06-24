import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import AppSidebar from "./Sidebar";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Menu, Share2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { NavLinks } from "./NavLinks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TataAssistant from "./TataAssistant";

const Layout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    kpis: true,
    productionChart: true,
    financialChart: true,
    activities: true,
    aiReport: true,
  });
  const [isSharing, setIsSharing] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
  };

  const handleShareChange = (e) => {
    setShareOptions((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleShareConfirm = () => {
    setIsSharing(true);
    setIsShareModalOpen(false);
    navigate('/', { state: { shareOptions, triggerShare: true } });
    setTimeout(() => setIsSharing(false), 2000);
  };

  return (
    <div className="flex min-h-screen w-full bg-background dark">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 sm:px-6 sticky top-0 z-30 shrink-0">
          <div className="md:hidden mr-auto">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-64 bg-secondary p-0 z-50">
                  <div className="flex h-16 items-center border-b px-6">
                      <NavLink to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                          <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="AgroAjuda Logo" className="h-8" />
                      </NavLink>
                  </div>
                  <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="w-full flex-1 min-w-0"></div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Compartilhe seu resultado</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                <User className="h-5 w-5" />
                <span className="sr-only">Abrir menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-border shadow-lg z-50">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 flex min-w-0 overflow-x-auto">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
        <TataAssistant />

        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-background rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setIsShareModalOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Compartilhe seu resultado</h2>
              <form className="space-y-3 mb-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="kpis" checked={shareOptions.kpis} onChange={handleShareChange} />
                  KPIs do mês
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="productionChart" checked={shareOptions.productionChart} onChange={handleShareChange} />
                  Gráfico de Produção
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="financialChart" checked={shareOptions.financialChart} onChange={handleShareChange} />
                  Gráfico Financeiro
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="activities" checked={shareOptions.activities} onChange={handleShareChange} />
                  Atividades Recentes
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="aiReport" checked={shareOptions.aiReport} onChange={handleShareChange} />
                  Relatório Inteligente (IA)
                </label>
              </form>
              <Button onClick={handleShareConfirm} className="w-full mt-2" disabled={isSharing}>
                {isSharing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando PDF...</>
                ) : (
                  'Compartilhar em PDF'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
