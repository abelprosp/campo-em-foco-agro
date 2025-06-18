import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import AppSidebar from "./Sidebar";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Menu } from "lucide-react";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/landing');
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
      </div>
    </div>
  );
};

export default Layout;
