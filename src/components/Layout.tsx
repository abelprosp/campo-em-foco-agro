import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import AppSidebar from "./Sidebar";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Menu, Share2, Loader2, Bell } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import { getProductionRecords } from '@/features/production/api';
import { getPlots } from '@/features/plots/api';
import { getPlotCenter } from '@/features/plots/plotUtils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Calendar } from "lucide-react";
import React from 'react';

const Layout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    kpis: true,
    productionChart: true,
    activities: true,
    weather: true,
    aiReport: true
  });
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('activities').select('*').order('due_date', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });
  const { data: plots = [] } = useQuery({
    queryKey: ['plots', user?.id],
    queryFn: getPlots,
    enabled: !!user,
  });
  const [weatherAlerts, setWeatherAlerts] = React.useState([]);

  React.useEffect(() => {
    const fetchWeatherAlerts = async () => {
      if (!plots.length) return setWeatherAlerts([]);
      const results = await Promise.all(
        plots.map(async (plot) => {
          const center = getPlotCenter(plot);
          if (!center) return null;
          try {
            const { data, error } = await supabase.functions.invoke('get-weather', {
              body: { latitude: center.latitude, longitude: center.longitude },
            });
            if (error || data?.error) return null;
            const alerts = [];
            if (data.main.temp > 35) alerts.push({
              type: 'Clima',
              message: `Temperatura alta em "${plot.name}": ${Math.round(data.main.temp)}°C`,
              date: new Date(),
            });
            if (data.main.temp < 5) alerts.push({
              type: 'Clima',
              message: `Temperatura baixa em "${plot.name}": ${Math.round(data.main.temp)}°C`,
              date: new Date(),
            });
            if (data.wind.speed * 3.6 > 40) alerts.push({
              type: 'Clima',
              message: `Vento forte em "${plot.name}": ${(data.wind.speed * 3.6).toFixed(1)} km/h`,
              date: new Date(),
            });
            const condition = data.weather[0].main;
            if (["Rain", "Thunderstorm", "Drizzle", "Snow"].includes(condition)) alerts.push({
              type: 'Clima',
              message: `Precipitação em "${plot.name}": ${data.weather[0].description}`,
              date: new Date(),
            });
            return alerts;
          } catch {
            return null;
          }
        })
      );
      setWeatherAlerts(results.flat().filter(Boolean));
    };
    fetchWeatherAlerts();
  }, [plots]);

  const activityAlerts = React.useMemo(() => {
    const ALERT_DAYS = 5;
    return activities.filter(activity => {
      if (!activity.due_date || activity.status === 'Concluída') return false;
      try {
        const daysUntilDue = differenceInDays(parseISO(activity.due_date), new Date());
        return daysUntilDue >= 0 && daysUntilDue <= ALERT_DAYS;
      } catch {
        return false;
      }
    }).map(activity => {
      const daysUntilDue = differenceInDays(parseISO(activity.due_date), new Date());
      let message = '';
      if (daysUntilDue === 0) message = `A atividade "${activity.name}" vence hoje.`;
      else if (daysUntilDue === 1) message = `A atividade "${activity.name}" vence amanhã.`;
      else message = `A atividade "${activity.name}" vence em ${daysUntilDue} dias.`;
      return {
        type: 'Atividade',
        message,
        date: parseISO(activity.due_date),
      };
    });
  }, [activities]);

  const notifications = React.useMemo(() => {
    return [
      ...activityAlerts,
      ...weatherAlerts,
    ].sort((a, b) => b.date - a.date);
  }, [activityAlerts, weatherAlerts]);

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
    if (typeof window.generatePDF === 'function') {
      window.shareOptions = shareOptions;
      window.generatePDF();
    } else {
      navigate('/', { state: { shareOptions, triggerShare: true } });
    }
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

          {/* Notificações */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="sr-only">Ver notificações</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
              <div className="max-h-96 overflow-y-auto divide-y">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">Nenhum alerta recente.</div>
                ) : notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition">
                    <div className="mt-1">
                      {n.type === 'Clima' ? <AlertTriangle className="h-5 w-5 text-blue-500" /> : <Calendar className="h-5 w-5 text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{n.type}</div>
                      <div className="text-sm text-muted-foreground">{n.message}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(n.date, 'dd/MM HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

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
                  Indicadores Financeiros (KPIs)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="productionChart" checked={shareOptions.productionChart} onChange={handleShareChange} />
                  Gráfico de Produção
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="activities" checked={shareOptions.activities} onChange={handleShareChange} />
                  Atividades Recentes
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="weather" checked={shareOptions.weather} onChange={handleShareChange} />
                  Previsão do Tempo
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
