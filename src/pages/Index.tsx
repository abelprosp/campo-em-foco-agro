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
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Index = () => {
  const { user } = useAuth();

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

  const kpiData = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const monthlyTransactions = transactions.filter(t => {
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

    const monthlyProduction = productionRecords
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
  }, [transactions, productionRecords]);

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

    productionRecords.forEach(record => {
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
  }, [productionRecords]);

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

    transactions.forEach(transaction => {
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
  }, [transactions]);

  const recentActivities = useMemo(() => {
    const plotMap = new Map(plots.map(p => [p.id, p.name]));
    return [...activities]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map(activity => ({
        activity: activity.name,
        plot: activity.plot_id ? plotMap.get(activity.plot_id) || 'N/D' : 'N/A',
        date: format(new Date(activity.created_at), 'dd/MM/yyyy')
      }));
  }, [activities, plots]);

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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
      </div>
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
              <Button onClick={handleExportPDF} className="mt-4" variant="outline" disabled={isGeneratingReport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar para PDF
              </Button>

              {/* Hidden content for improved PDF generation */}
              <div style={{ position: 'absolute', left: '-9999px', width: '210mm' }}>
                <div id="pdf-content" className="p-12 bg-white text-black font-sans">
                  <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Relatório de Análise com IA</h1>
                    <p className="text-base text-gray-500 mt-2">
                      Gerado em: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </header>
                  
                  <main>
                    {reportData.report.split('\n\n').map((paragraph, index) => {
                      const trimmed = paragraph.trim();
                      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                        return <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-gray-700 border-b pb-2">{trimmed.replace(/\*\*/g, '')}</h2>;
                      }
                      const isList = trimmed.startsWith('* ') || trimmed.startsWith('- ');
                      if (isList) {
                        return (
                          <ul key={index} className="list-disc list-inside mb-4 space-y-1 pl-4">
                            {trimmed.split('\n').map((item, i) => (
                              <li key={i} className="text-base text-gray-800 leading-relaxed">{item.replace(/^[*-]\s*/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (!trimmed) return null;
                      return <p key={index} className="text-base text-gray-800 leading-relaxed mb-4 text-justify">{trimmed}</p>;
                    })}

                    <h2 className="text-2xl font-semibold mt-16 mb-4 text-gray-700 border-b pb-2">Análise Gráfica</h2>

                    <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-600">Evolução da Produção (Sacos)</h3>
                    <div style={{ width: '100%', height: '300px' }}>
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

                    <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-600">Evolução Financeira (BRL)</h3>
                     <div style={{ width: '100%', height: '300px' }}>
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
                  </main>

                  <footer className="mt-16 pt-6 border-t text-center text-sm text-gray-500">
                    <p>Relatório gerado por Agro-Inteli</p>
                    <p>Análise Inteligente para sua Fazenda</p>
                  </footer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
