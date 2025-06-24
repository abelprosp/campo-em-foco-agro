import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Activity, 
  DollarSign, 
  Package, 
  BarChart3,
  Shield,
  FileText,
  Tractor,
  Settings,
  Loader
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/contexts/AdminContext";
import { Badge } from "@/components/ui/badge";

interface NavLinksProps {
  onLinkClick?: () => void;
}

export const NavLinks = ({ onLinkClick }: NavLinksProps) => {
  const { isAdmin } = useAdmin();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/atividades", icon: Activity, label: "Atividades" },
    { to: "/financeiro", icon: DollarSign, label: "Financeiro" },
    { to: "/estoque", icon: Package, label: "Estoque" },
    { to: "/producao", icon: BarChart3, label: "Produção" },
    { to: "/maquinas", icon: Settings, label: <><span>Máquinas</span> <Loader className="ml-1 w-4 h-4 text-yellow-500 animate-spin inline" title="Em produção" /></> },
    { to: "/nota-fiscal", icon: FileText, label: "Nota Fiscal", badge: "NOVO" },
  ];

  if (isAdmin) {
    navItems.push({ to: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onLinkClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )
          }
        >
          <Icon className="h-4 w-4" />
          <span className="flex items-center gap-2">
            {label}
            {badge && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {badge}
              </Badge>
            )}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};
