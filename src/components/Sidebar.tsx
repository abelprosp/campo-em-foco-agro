import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NavLinks } from "./NavLinks";
import { PanelLeft } from "lucide-react";

const AppSidebar = () => {
  const [open, setOpen] = useState(true);
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
        <NavLinks />
      </aside>
    </>
  );
};

export default AppSidebar;
