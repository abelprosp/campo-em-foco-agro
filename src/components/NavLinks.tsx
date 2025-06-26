import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingUp, 
  FileText, 
  User, 
  Settings,
  Loader2
} from "lucide-react";

interface NavLinksProps {
  onLinkClick?: () => void;
}

export const NavLinks = ({ onLinkClick }: NavLinksProps) => {
  const navItems = [
    { to: "/", icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard" },
    { to: "/atividades", icon: <Calendar className="w-5 h-5" />, label: "Atividades" },
    { to: "/financeiro", icon: <DollarSign className="w-5 h-5" />, label: "Financeiro" },
    { to: "/estoque", icon: <Package className="w-5 h-5" />, label: "Estoque" },
    { to: "/producao", icon: <TrendingUp className="w-5 h-5" />, label: "Produção" },
    { to: "/nota-fiscal", icon: <FileText className="w-5 h-5" />, label: "Nota Fiscal" },
    { to: "/maquinas", icon: <Loader2 className="w-5 h-5 animate-spin" />, label: "Máquinas" },
    { to: "/perfil", icon: <User className="w-5 h-5" />, label: "Perfil" },
    { to: "/admin", icon: <Settings className="w-5 h-5" />, label: "Admin" },
  ];

  return (
    <nav className="flex-1 px-4 py-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
