import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, ArrowUp, ArrowDown, Sprout, BrainCircuit, Loader2, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions } from "@/features/transactions/api";
import { getActivities } from "@/features/activities/api";
import { getProductionRecords } from "@/features/production/api";
import { getPlots } from "@/features/plots/api";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pdfExportedRef = useRef(false);
  const shareOptions = location.state?.shareOptions || {
    kpis: true,
    productionChart: true,
    financialChart: true,
    activities: true,
    aiReport: true,
  };
  const triggerShare = location.state?.triggerShare;

  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: subMonths(new Date(), 5),
    to: new Date(),
  });
  const [dataType, setDataType] = useState<'all' | 'receita' | 'despesa' | 'producao' | 'atividade' | 'maquinas'>('all');
  const [search, setSearch] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (triggerShare && !pdfExportedRef.current) {
      setTimeout(() => {
        handleExportPDF();
        pdfExportedRef.current = true;
      }, 800); // aguarda renderização
    }
  }, [triggerShare]);

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: getTransactions,
    enabled: !!user,
  });

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: getActivities,
    enabled: !!user,
  });

  const { data: productionRecords = [], isLoading: isLoadingProduction } = useQuery({
    queryKey: ['productionRecords', user?.id],
    queryFn: getProductionRecords,
    enabled: !!user,
  });

  const { data: plots = [], isLoading: isLoadingPlots } = useQuery({
    queryKey: ['plots', user?.id],
    queryFn: getPlots,
    enabled: !!user,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      const inRange = (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= addDays(dateRange.to, 1));
      const typeMatch = dataType === 'all' || t.type === dataType;
      const searchMatch = search === '' || (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
      return inRange && typeMatch && searchMatch;
    });
  }, [transactions, dateRange, dataType, search]);

  const filteredProduction = useMemo(() => {
    return productionRecords.filter(r => {
      if (!r.harvest_date) return false;
      const d = new Date(r.harvest_date);
      const inRange = (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= addDays(dateRange.to, 1));
      const searchMatch = search === '' ||
        (r.crop_name && r.crop_name.toLowerCase().includes(search.toLowerCase())) ||
        (r.observations && r.observations.toLowerCase().includes(search.toLowerCase()));
      return inRange && (dataType === 'all' || dataType === 'producao') && searchMatch;
    });
  }, [productionRecords, dateRange, dataType, search]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const d = new Date(a.created_at);
      const inRange = (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= addDays(dateRange.to, 1));
      const searchMatch = search === '' || (a.name && a.name.toLowerCase().includes(search.toLowerCase()));
      return inRange && (dataType === 'all' || dataType === 'atividade') && searchMatch;
    });
  }, [activities, dateRange, dataType, search]);

  const kpiData = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const monthlyTransactions = filteredTransactions.filter(t => {
      if (!t.date) return false;
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, { start: startOfCurrentMonth, end: endOfCurrentMonth });
    });

    const receitaMensal = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);

    const despesasMensais = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    const lucroMensal = receitaMensal - despesasMensais;

    const monthlyProduction = filteredProduction
      .filter(r => {
        if (!r.harvest_date) return false;
        const harvestDate = new Date(r.harvest_date);
        return isWithinInterval(harvestDate, { start: startOfCurrentMonth, end: endOfCurrentMonth });
      })
      .reduce((sum, r) => sum + Number(r.quantity), 0);

    return [
      { title: "Receita Mensal", value: formatCurrency(receitaMensal), Icon: DollarSign },
      { title: "Despesas Mensais", value: formatCurrency(despesasMensais), Icon: ArrowDown },
      { title: "Lucro Mensal", value: formatCurrency(lucroMensal), Icon: ArrowUp },
      { title: "Produção (Sacos)", value: monthlyProduction.toString(), Icon: Sprout },
    ];
  }, [filteredTransactions, filteredProduction]);

  const productionData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        name: format(date, 'MMM', { locale: ptBR }),
        start: startOfMonth(date),
        end: endOfMonth(date),
        Produção: 0,
      };
    });

    filteredProduction.forEach(record => {
      if (!record.harvest_date) return;
      const recordDate = new Date(record.harvest_date);
      for (const month of months) {
        if (isWithinInterval(recordDate, { start: month.start, end: month.end })) {
          month.Produção += Number(record.quantity);
          break;
        }
      }
    });

    return months.map(({ name, Produção }) => ({ name, Produção }));
  }, [filteredProduction]);

  const financialChartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        name: format(date, 'MMM', { locale: ptBR }),
        start: startOfMonth(date),
        end: endOfMonth(date),
        Receita: 0,
        Despesa: 0,
      };
    });

    filteredTransactions.forEach(transaction => {
      if (!transaction.date) return;
      const transactionDate = new Date(transaction.date);
      for (const month of months) {
        if (isWithinInterval(transactionDate, { start: month.start, end: month.end })) {
          if (transaction.type === 'receita') {
            month.Receita += transaction.amount;
          } else if (transaction.type === 'despesa') {
            month.Despesa += transaction.amount;
          }
          break;
        }
      }
    });

    return months.map(({ name, Receita, Despesa }) => ({ name, Receita, Despesa }));
  }, [filteredTransactions]);

  const recentActivities = useMemo(() => {
    const plotMap = new Map(plots.map(p => [p.id, p.name]));
    return [...filteredActivities]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map(activity => ({
        activity: activity.name,
        plot: activity.plot_id ? plotMap.get(activity.plot_id) || 'N/D' : 'N/A',
        date: format(new Date(activity.created_at), 'dd/MM/yyyy')
      }));
  }, [filteredActivities, plots]);

  const {
    mutate: generateReport,
    isPending: isGeneratingReport,
    data: reportData,
    error: reportError,
  } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-report");
      if (error) {
        if (error.context && error.context.text) {
          try {
            const parsedError = JSON.parse(error.context.text);
            if (parsedError.error) throw new Error(parsedError.error);
          } catch (e) { /* ignore parsing error */ }
        }
        throw new Error(error.message);
      }
      return data;
    },
  });

  const handleExportPDF = () => {
    const input = document.getElementById('pdf-content');
    if (input) {
      html2canvas(input, {
        scale: 2,
        backgroundColor: '#ffffff'
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = imgWidth / imgHeight;
        const pdfImageWidth = pdfWidth;
        const pdfImageHeight = pdfImageWidth / ratio;

        let heightLeft = pdfImageHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfImageWidth, pdfImageHeight);
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position -= pdfPageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfImageWidth, pdfImageHeight);
          heightLeft -= pdfPageHeight;
        }
        pdf.save('relatorio_agro-inteli.pdf');
      });
    }
  };

  const isLoading = isLoadingTransactions || isLoadingActivities || isLoadingProduction || isLoadingPlots;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta! Aqui está um resumo da sua fazenda.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2">
        <div>
          <label className="block text-sm font-medium mb-1">Período</label>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between" onClick={() => setShowCalendar(v => !v)}>
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                  : 'Todo o período'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => { setDateRange(range as any); setShowCalendar(false); }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="min-w-[180px]">
          <label className="block text-sm font-medium mb-1">Tipo de Dado</label>
          <Select value={dataType} onValueChange={v => setDataType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
              <SelectItem value="producao">Produção</SelectItem>
              <SelectItem value="atividade">Atividades</SelectItem>
              <SelectItem value="maquinas">Máquinas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Busca</label>
          <Input placeholder="Buscar por descrição, nome..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* KPIs */}
      {shareOptions.kpis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">No mês atual</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {shareOptions.productionChart && (
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Evolução da Produção</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                    formatter={(value: number) => [value, "Sacos"]}
                  />
                  <Line type="monotone" dataKey="Produção" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {shareOptions.activities && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{activity.activity}</TableCell>
                        <TableCell>{activity.plot}</TableCell>
                        <TableCell className="text-right">{activity.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        Nenhuma atividade recente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Gráfico Financeiro */}
      {shareOptions.financialChart && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="Receita" fill="#22c55e" />
                <Bar dataKey="Despesa" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      {/* Relatório IA */}
      {shareOptions.aiReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Análise Inteligente com IA</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gere um relatório analítico da sua fazenda usando a IA da Groq.
              </p>
            </div>
            <BrainCircuit className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateReport()} disabled={isGeneratingReport}>
              {isGeneratingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                'Gerar Relatório'
              )}
            </Button>
            {isGeneratingReport && <div className="mt-4 text-center"><p className="animate-pulse">Aguarde, a IA está processando seus dados...</p></div>}
            {reportError && <div className="mt-4 text-red-500"><p>Erro ao gerar relatório: {reportError.message}</p></div>}
            {reportData && reportData.report && (
              <div className="mt-4">
                <div id="report-content" className="p-4 border rounded-md bg-muted/20">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {reportData.report}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão de download sempre disponível */}
      <Button onClick={handleExportPDF} className="mt-8 self-end" variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF do Dashboard
      </Button>

      {/* Hidden content for improved PDF generation (sempre renderizado) */}
      <div style={{ position: 'absolute', left: '-9999px', width: '210mm' }}>
        <div id="pdf-content" className="p-12 bg-white text-black font-sans" style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#222' }}>
          <header className="mb-12 text-center">
            <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="Logo AgroAjuda" style={{ height: 60, margin: '0 auto 16px auto' }} />
            <h1 className="text-4xl font-bold text-green-700" style={{ color: '#15803d', fontWeight: 800, fontSize: 36, marginBottom: 8 }}>Dashboard Personalizado</h1>
            <p className="text-base text-gray-500 mt-2" style={{ color: '#64748b', fontSize: 16 }}>
              Gerado em: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </header>
          <main>
            {shareOptions.kpis && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b pb-2" style={{ color: '#166534', fontWeight: 700, fontSize: 28 }}>KPIs do mês</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {kpiData.map((kpi) => (
                    <div key={kpi.title} className="border rounded p-4" style={{ borderColor: '#e5e7eb', background: '#f0fdf4' }}>
                      <div className="text-lg font-bold" style={{ color: '#15803d', fontSize: 22 }}>{kpi.value}</div>
                      <div className="text-xs text-gray-500" style={{ color: '#64748b', fontSize: 14 }}>{kpi.title}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {shareOptions.productionChart && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b pb-2" style={{ color: '#166534', fontWeight: 700, fontSize: 28 }}>Evolução da Produção</h2>
                <div style={{ width: '100%', height: '300px', background: '#f0fdf4', borderRadius: 8, padding: 8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value} Sacos`, "Produção"]}/>
                      <Legend />
                      <Line type="monotone" dataKey="Produção" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
            {shareOptions.financialChart && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b pb-2" style={{ color: '#166534', fontWeight: 700, fontSize: 28 }}>Evolução Financeira</h2>
                <div style={{ width: '100%', height: '300px', background: '#f0fdf4', borderRadius: 8, padding: 8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="Receita" fill="#22c55e" />
                      <Bar dataKey="Despesa" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
            {shareOptions.activities && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b pb-2" style={{ color: '#166534', fontWeight: 700, fontSize: 28 }}>Atividades Recentes</h2>
                <table className="w-full text-sm border" style={{ borderColor: '#e5e7eb', background: '#f0fdf4', borderRadius: 8 }}>
                  <thead>
                    <tr>
                      <th className="border px-2 py-1" style={{ borderColor: '#e5e7eb', color: '#166534', fontWeight: 700 }}>Atividade</th>
                      <th className="border px-2 py-1" style={{ borderColor: '#e5e7eb', color: '#166534', fontWeight: 700 }}>Local</th>
                      <th className="border px-2 py-1" style={{ borderColor: '#e5e7eb', color: '#166534', fontWeight: 700 }}>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <tr key={index}>
                          <td className="border px-2 py-1" style={{ borderColor: '#e5e7eb' }}>{activity.activity}</td>
                          <td className="border px-2 py-1" style={{ borderColor: '#e5e7eb' }}>{activity.plot}</td>
                          <td className="border px-2 py-1" style={{ borderColor: '#e5e7eb' }}>{activity.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border px-2 py-1 text-center" style={{ borderColor: '#e5e7eb' }}>Nenhuma atividade recente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}
            {shareOptions.aiReport && reportData && reportData.report && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-green-800 border-b pb-2" style={{ color: '#166534', fontWeight: 700, fontSize: 28 }}>Relatório Inteligente (IA)</h2>
                {reportData.report.split('\n\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return <h3 key={index} className="text-xl font-semibold mt-8 mb-4 text-green-700 border-b pb-2" style={{ color: '#15803d', fontWeight: 700, fontSize: 22 }}>{trimmed.replace(/\*\*/g, '')}</h3>;
                  }
                  const isList = trimmed.startsWith('* ') || trimmed.startsWith('- ');
                  if (isList) {
                    return (
                      <ul key={index} className="list-disc list-inside mb-4 space-y-1 pl-4">
                        {trimmed.split('\n').map((item, i) => (
                          <li key={i} className="text-base text-gray-800 leading-relaxed" style={{ color: '#222', fontSize: 16 }}>{item.replace(/^[*-]\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (!trimmed) return null;
                  return <p key={index} className="text-base text-gray-800 leading-relaxed mb-4 text-justify" style={{ color: '#222', fontSize: 16 }}>{trimmed}</p>;
                })}
              </section>
            )}
          </main>
          <footer className="mt-16 pt-6 border-t text-center text-sm text-gray-500" style={{ color: '#64748b', borderColor: '#e5e7eb' }}>
            <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="Logo AgroAjuda" style={{ height: 32, margin: '0 auto 8px auto' }} />
            <p style={{ fontWeight: 600 }}>AgroAjuda - Plataforma de Gestão Agrícola</p>
            <p>Análise Inteligente para sua Fazenda</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
