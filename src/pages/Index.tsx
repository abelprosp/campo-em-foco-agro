import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Package, Activity, AlertTriangle, Sun, Cloud, Wind, Thermometer, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps, CartesianGrid } from "recharts";
import { LineChart, Line } from "recharts";
import { getProductionRecords } from "@/features/production/api";
import { getPlots } from "@/features/plots/api";
import { getPlotCenter } from "@/features/plots/plotUtils";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Calendar as UiCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
  interface Window {
    generatePDF?: () => void;
    shareOptions?: {
      kpis: boolean;
      productionChart: boolean;
      activities: boolean;
      weather: boolean;
      aiReport: boolean;
    };
  }
}

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [kpis, setKpis] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    activities: 0,
    inventory: 0,
    production: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [aiReport, setAiReport] = useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [search, setSearch] = React.useState('');
  const [dataType, setDataType] = React.useState('all');
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    kpis: true,
    productionChart: true,
    activities: true,
    weather: true,
    aiReport: true
  });

  // Produção mensal
  const { data: productionRecords = [] } = useQuery({
    queryKey: ["productionRecords", user?.id],
    queryFn: getProductionRecords,
    enabled: !!user,
  });

  // Talhões
  const { data: plots = [] } = useQuery({
    queryKey: ["plots", user?.id],
    queryFn: getPlots,
    enabled: !!user,
  });

  // Descobrir todas as unidades presentes
  const allUnits = React.useMemo<string[]>(() => {
    const set = new Set<string>();
    productionRecords.forEach(rec => set.add(rec.unit || 'Unidade'));
    return Array.from(set);
  }, [productionRecords]);

  // Agrupar produção por mês/ano e unidade, sempre mostrar todos os meses do ano atual
  const productionByMonth = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
    const map = new Map();
    productionRecords.forEach((rec) => {
      const date = new Date(rec.harvest_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, {});
      const unit = rec.unit || 'Unidade';
      if (!map.get(key)[unit]) map.get(key)[unit] = 0;
      map.get(key)[unit] += Number(rec.quantity);
    });
    // Para cada mês do ano, criar um objeto com as unidades e valores (0 se não houver)
    return months.map((key) => {
      const units = map.get(key) || {};
      const obj = { mes: key };
      allUnits.forEach(unit => {
        obj[unit] = units[unit] || 0;
      });
      return obj;
    });
  }, [productionRecords, allUnits]);

  // Custom Tooltip para o gráfico de produção
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(27,75,71,0.95)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{label}</div>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ color: '#C6FF6B', fontWeight: 400 }}>
              {entry.unit ? `${entry.unit}: ` : ''}{entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Previsão do tempo para todos os talhões
  const [plotsWeather, setPlotsWeather] = React.useState([]);
  React.useEffect(() => {
    const fetchWeather = async () => {
      if (!plots.length) return setPlotsWeather([]);
      const results = await Promise.all(
        plots.map(async (plot) => {
          const center = getPlotCenter(plot);
          if (!center) return { plot, weather: null };
          try {
            const { data, error } = await supabase.functions.invoke('get-weather', {
              body: { latitude: center.latitude, longitude: center.longitude },
            });
            if (error || data?.error) return { plot, weather: null };
            return { plot, weather: data };
          } catch {
            return { plot, weather: null };
          }
        })
      );
      setPlotsWeather(results);
    };
    fetchWeather();
  }, [plots]);

  useEffect(() => {
    if (location.state?.triggerShare) {
      generatePDF();
    }
    loadDashboardData();
  }, [location.state]);

  const loadDashboardData = async () => {
    // Carregar dados reais do dashboard
    try {
      // Buscar dados reais do banco de dados
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      setTransactions(transactions || []);

      // Calcular KPIs reais
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = transactions?.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      }) || [];

      const revenue = monthlyTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthlyTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const profit = revenue - expenses;

      setKpis({
        revenue,
        expenses,
        profit,
        activities: activities?.length || 0,
        inventory: 0, // Será calculado quando implementar estoque
        production: 0 // Será calculado quando implementar produção
      });

      // Atividades recentes reais
      const recentActivitiesData = activities?.map(activity => ({
        id: activity.id,
        type: activity.name,
        description: activity.description || `Atividade no talhão ${activity.plot_id}`,
        date: new Date(activity.created_at),
        status: activity.status || "Concluído"
      })) || [];

      setRecentActivities(recentActivitiesData);

      // Dados do tempo reais (se implementado)
      setWeatherData(null);

      // Relatório IA real (se implementado)
      setAiReport("");

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      
      // Fallback para dados vazios
      setKpis({
        revenue: 0,
        expenses: 0,
        profit: 0,
        activities: 0,
        inventory: 0,
        production: 0
      });

      setRecentActivities([]);
      setWeatherData(null);
      setAiReport("");
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 40;

    // Usar as opções selecionadas pelo usuário
    const options = window.shareOptions || {
      kpis: true,
      productionChart: true,
      activities: true,
      weather: true,
      aiReport: true
    };

    // Cabeçalho com design da plataforma
    doc.setFillColor(27, 75, 71); // Cor verde da plataforma
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AgroAjuda - Relatório', pageWidth / 2, 35, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y = 80;

    // Data do relatório
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy às HH:mm')}`, 40, y);
    y += 30;

    // KPIs com design de cards
    if (options.kpis) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Indicadores Financeiros', 40, y);
      y += 25;

      // Card de Receita
      doc.setFillColor(240, 253, 244);
      doc.rect(40, y, 120, 60, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.rect(40, y, 120, 60, 'S');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Receita', 50, y + 15);
      doc.setFontSize(18);
      doc.text(`R$ ${kpis.revenue.toLocaleString()}`, 50, y + 35);

      // Card de Despesas
      doc.setFillColor(254, 242, 242);
      doc.rect(180, y, 120, 60, 'F');
      doc.setDrawColor(239, 68, 68);
      doc.rect(180, y, 120, 60, 'S');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Despesas', 190, y + 15);
      doc.setFontSize(18);
      doc.text(`R$ ${kpis.expenses.toLocaleString()}`, 190, y + 35);

      // Card de Lucro
      doc.setFillColor(240, 253, 244);
      doc.rect(320, y, 120, 60, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.rect(320, y, 120, 60, 'S');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Lucro', 330, y + 15);
      doc.setFontSize(18);
      doc.text(`R$ ${kpis.profit.toLocaleString()}`, 330, y + 35);

      y += 80;
    }

    // Gráfico de Produção
    if (options.productionChart) {
      const prodChart = document.querySelector('.recharts-wrapper');
      if (prodChart) {
        const prodCanvas = await html2canvas(prodChart as HTMLElement);
        const prodImg = prodCanvas.toDataURL('image/png');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(27, 75, 71);
        doc.text('Evolução da Produção', 40, y);
        y += 25;
        
        doc.addImage(prodImg, 'PNG', 40, y, 500, 200);
        y += 220;
      }
    }

    // Atividades Recentes
    if (options.activities) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Atividades Recentes', 40, y);
      y += 25;

      recentActivities.slice(0, 6).forEach((a) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${a.type}: ${a.description}`, 50, y);
        y += 16;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`  Data: ${format(a.date, 'dd/MM/yyyy')}`, 50, y);
        y += 20;
      });
      y += 10;
    }

    // Previsão do Tempo
    if (options.weather) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Previsão do Tempo por Talhão', 40, y);
      y += 25;

      plotsWeather.slice(0, 3).forEach(({ plot, weather }) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${plot.name}:`, 50, y);
        y += 16;
        if (weather) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`  ${weather.weather[0]?.description} - ${Math.round(weather.main.temp)}ºC`, 50, y);
          y += 16;
          doc.text(`  Mín: ${Math.round(weather.main.temp_min)}ºC | Máx: ${Math.round(weather.main.temp_max)}ºC`, 50, y);
          y += 16;
          doc.text(`  Umidade: ${weather.main.humidity}% | Vento: ${weather.wind.speed} km/h`, 50, y);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text(`  Clima não disponível`, 50, y);
        }
        y += 20;
      });
      y += 10;
    }

    // Relatório IA
    if (options.aiReport && aiReport) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 75, 71);
      doc.text('Relatório Inteligente (IA)', 40, y);
      y += 25;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const split = doc.splitTextToSize(aiReport, 500);
      doc.text(split, 40, y);
      y += split.length * 14 + 10;
    }

    // Rodapé
    doc.setFillColor(27, 75, 71);
    doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AgroAjuda - Gestão Inteligente para o Campo', pageWidth / 2, pageHeight - 20, { align: 'center' });

    doc.save('relatorio-agroajuda.pdf');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800";
      case "Em andamento": return "bg-yellow-100 text-yellow-800";
      case "Agendado": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filtro de produção por data, tipo e busca
  const filteredProductionRecords = React.useMemo(() => {
    return productionRecords.filter(rec => {
      // Filtro de período
      if (dateRange && dateRange.from && dateRange.to) {
        const d = new Date(rec.harvest_date);
        if (d < dateRange.from || d > dateRange.to) return false;
      }
      // Filtro de tipo de dado
      if (dataType !== 'all' && dataType !== 'production') return false;
      // Filtro de busca
      if (search) {
        const s = search.toLowerCase();
        if (!rec.crop_name?.toLowerCase().includes(s) && !rec.quality?.toLowerCase().includes(s) && !rec.observations?.toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [productionRecords, dateRange, dataType, search]);

  // Filtro de atividades (exemplo, se quiser mostrar cards de atividades)
  const filteredActivities = React.useMemo(() => {
    if (!Array.isArray(recentActivities)) return [];
    return recentActivities.filter(act => {
      // Filtro de período
      if (dateRange && dateRange.from && dateRange.to) {
        const d = new Date(act.date);
        if (d < dateRange.from || d > dateRange.to) return false;
      }
      // Filtro de tipo de dado
      if (dataType !== 'all' && dataType !== 'activities') return false;
      // Filtro de busca
      if (search) {
        const s = search.toLowerCase();
        if (!act.type?.toLowerCase().includes(s) && !act.description?.toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [recentActivities, dateRange, dataType, search]);

  // Filtro de talhões para previsão do tempo (busca por nome)
  const filteredPlotsWeather = React.useMemo(() => {
    if (!Array.isArray(plotsWeather)) return [];
    let filtered = plotsWeather;
    
    // Filtro de busca
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(({ plot }) => plot.name?.toLowerCase().includes(s));
    }
    
    // Filtro de tipo de dado
    if (dataType !== 'all' && dataType !== 'plots') return [];
    
    return filtered;
  }, [plotsWeather, search, dataType]);

  // Filtro de KPIs baseado no período selecionado
  const filteredKpis = React.useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) return kpis;
    
    // Filtrar transações por período para recalcular KPIs
    const filteredTransactions = transactions?.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    }) || [];

    const revenue = filteredTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = revenue - expenses;

    return {
      ...kpis,
      revenue,
      expenses,
      profit,
      activities: filteredActivities.length
    };
  }, [kpis, dateRange, transactions, filteredActivities]);

  const handleGenerateAIReport = async () => {
    setAiReportLoading(true);
    setAiReport("");
    try {
      const { data, error } = await supabase.functions.invoke('generate-report');
      if (error || data?.error) {
        setAiReport('Erro ao gerar relatório inteligente.');
      } else {
        setAiReport(data?.report || data || 'Relatório gerado, mas sem conteúdo.');
      }
    } catch (err) {
      setAiReport('Erro ao gerar relatório inteligente.');
    } finally {
      setAiReportLoading(false);
    }
  };

  React.useEffect(() => {
    window.generatePDF = generatePDF;
    return () => { delete window.generatePDF; };
  }, [generatePDF]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center mb-2">
        {/* Período */}
        <div className="flex flex-col min-w-[220px]">
          <span className="text-sm text-muted-foreground mb-1">Período</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="border rounded-lg px-4 py-2 text-left bg-transparent text-white focus:outline-none">
                {dateRange && dateRange.from && dateRange.to
                  ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                  : 'Selecione o período'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <UiCalendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Tipo de Dado */}
        <div className="flex flex-col min-w-[180px]">
          <span className="text-sm text-muted-foreground mb-1">Tipo de Dado</span>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="production">Produção</SelectItem>
              <SelectItem value="activities">Atividades</SelectItem>
              <SelectItem value="plots">Talhões</SelectItem>
              {/* Adicione mais tipos se desejar */}
            </SelectContent>
          </Select>
        </div>
        {/* Busca */}
        <div className="flex flex-col flex-1 min-w-[240px]">
          <span className="text-sm text-muted-foreground mb-1">Busca</span>
          <Input
            className="w-full"
            placeholder="Buscar por descrição, nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.user_metadata?.full_name || "Produtor"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {filteredKpis.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredKpis.revenue > 0 ? "Dados do período selecionado" : "Nenhuma receita registrada"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {filteredKpis.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredKpis.expenses > 0 ? "Dados do período selecionado" : "Nenhuma despesa registrada"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {filteredKpis.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredKpis.profit > 0 ? "Resultado do período selecionado" : "Sem lucro registrado"}
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{filteredKpis.activities}</div>
            <p className="text-xs text-muted-foreground">
              {filteredKpis.activities > 0 ? "Atividades do período selecionado" : "Nenhuma atividade registrada"}
            </p>
            </CardContent>
          </Card>
      </div>
      
      {/* Charts and Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Evolução da Produção</CardTitle>
          </CardHeader>
          <CardContent className="py-6 px-2">
            {productionByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={productionByMonth} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C6FF6B" opacity={0.2} />
                  <XAxis dataKey="mes"
                    tickFormatter={mes => {
                      const [ano, mesNum] = mes.split('-');
                      return ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][parseInt(mesNum, 10) - 1];
                    }}
                    tick={{ fontSize: 16, fill: '#C6FF6B', fontWeight: 400 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 16, fill: '#C6FF6B', fontWeight: 400 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    labelFormatter={mes => {
                      const [ano, mesNum] = mes.split('-');
                      return ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][parseInt(mesNum, 10) - 1];
                    }}
                    cursor={{ stroke: '#C6FF6B', strokeWidth: 1, opacity: 0.2 }}
                  />
                  {allUnits.map((unit, idx) => (
                    <Line key={unit} type="monotone" dataKey={unit} name={unit}
                      stroke="#C6FF6B" strokeWidth={2}
                      dot={{ r: 5, fill: '#C6FF6B', stroke: '#C6FF6B' }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum dado de produção encontrado
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Previsão do Tempo por Talhão</CardTitle>
            <CardDescription>Veja o clima de cada talhão cadastrado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredPlotsWeather.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {filteredPlotsWeather.map(({ plot, weather }) => (
                  <div
                    key={plot.id}
                    className="rounded-2xl shadow-md flex items-center justify-between px-4 py-3"
                    style={{ background: 'rgba(27,75,71,0.95)' }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-semibold text-white">{plot.name}</span>
                      <span className="text-sm text-green-100">
                        {weather ? weather.weather[0]?.description : 'Clima não disponível'}
                      </span>
                      <span className="text-xs text-green-200 mt-1">
                        {weather ? `High: ${Math.round(weather.main.temp_max)}º  Low: ${Math.round(weather.main.temp_min)}º` : ''}
                      </span>
                      {weather && (
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-gray-300">
                            Sensação <Thermometer className="inline w-4 h-4 mx-1" />
                            <span className="text-green-100 font-semibold">{Math.round(weather.main.feels_like)}ºC</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-300">
                            Vento <Wind className="inline w-4 h-4 mx-1" />
                            <span className="text-green-100 font-semibold">{weather.wind.speed} km/h</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-300">
                            Umidade <Droplets className="inline w-4 h-4 mx-1" />
                            <span className="text-green-100 font-semibold">{weather.main.humidity}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-4xl font-bold text-green-100 flex items-end">
                      {weather ? `${Math.round(weather.main.temp)}º` : '--'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum talhão cadastrado ou clima indisponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and AI Report */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atividades realizadas na fazenda
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(activity.date, "dd/MM")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Relatório Inteligente</CardTitle>
            <CardDescription>Análise IA da sua fazenda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiReport ? (
                <>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm">{aiReport}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleGenerateAIReport} disabled={aiReportLoading}>
                    {aiReportLoading ? 'Gerando...' : 'Gerar Novamente'}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Relatório não disponível</p>
                  <p className="text-xs">Adicione mais dados para gerar insights</p>
                  <Button variant="outline" size="sm" onClick={handleGenerateAIReport} disabled={aiReportLoading}>
                    {aiReportLoading ? 'Gerando...' : 'Gerar Relatório IA'}
                  </Button>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Index;
