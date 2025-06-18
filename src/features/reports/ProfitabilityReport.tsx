
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/features/transactions/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { Transaction } from '@/features/transactions/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const ProfitabilityReport = () => {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  const profitabilityData = useMemo(() => {
    if (!transactions.length) return [];

    const groupedByCrop: Record<string, { revenue: number, expense: number }> = {};

    transactions.forEach(t => {
      const cropName = t.crop_name || 'Não especificado';
      if (!groupedByCrop[cropName]) {
        groupedByCrop[cropName] = { revenue: 0, expense: 0 };
      }

      if (t.type === 'receita') {
        groupedByCrop[cropName].revenue += t.amount;
      } else {
        groupedByCrop[cropName].expense += t.amount;
      }
    });

    return Object.entries(groupedByCrop).map(([crop_name, data]) => ({
      crop_name,
      revenue: data.revenue,
      expense: data.expense,
      profit: data.revenue - data.expense,
    })).sort((a, b) => b.profit - a.profit);

  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentabilidade por Cultura</CardTitle>
        <CardDescription>Análise de receitas, despesas e lucro para cada cultura registrada.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cultura</TableHead>
              <TableHead className="text-right text-green-500">Receitas</TableHead>
              <TableHead className="text-right text-red-500">Despesas</TableHead>
              <TableHead className="text-right">Lucro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profitabilityData.length > 0 ? (
              profitabilityData.map(item => (
                <TableRow key={item.crop_name}>
                  <TableCell className="font-medium">{item.crop_name}</TableCell>
                  <TableCell className="text-right text-green-500">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right text-red-500">{formatCurrency(item.expense)}</TableCell>
                  <TableCell className={`text-right font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.profit)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Não há dados suficientes para gerar o relatório.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
