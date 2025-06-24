import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, Transaction } from "@/features/transactions/api";
import { getColumns } from "@/features/transactions/columns";
import { TransactionForm } from "@/features/transactions/TransactionForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusCircle, Loader2, TrendingUp, TrendingDown, Wallet, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HarvestCyclesList } from "@/features/harvest_cycles/HarvestCyclesList";
import { PlotsList } from "@/features/plots/PlotsList";
import { getPlots, Plot } from "@/features/plots/api";
import { ProfitabilityReport } from "@/features/reports/ProfitabilityReport";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Financial = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const { data: plots = [] } = useQuery<Plot[]>({
    queryKey: ["plots"],
    queryFn: getPlots,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsDialogOpen(false);
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast.error("Ocorreu um erro", { description: error.message });
    },
  };

  const createMutation = useMutation({
    mutationFn: createTransaction,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Transação criada com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Transação atualizada com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir transação", { description: error.message });
    },
  });

  const handleFormSubmit = (values: any) => {
    if (!user) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return;
    }
    
    const { file, ...otherValues } = values;

    const transactionData = {
      ...otherValues,
      user_id: user.id,
      date: format(values.date, 'yyyy-MM-dd'),
    };
    
    if (selectedTransaction) {
      updateMutation.mutate({ ...transactionData, id: selectedTransaction.id, file });
    } else {
      createMutation.mutate({ ...transactionData, file });
    }
  };
  
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const columns = getColumns(handleEdit, handleDelete, deleteMutation.isPending, plots);
  const table = useReactTable({ data: transactions, columns, getCoreRowModel: getCoreRowModel() });

  const summary = useMemo(() => {
    const totalReceitas = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalDespesas = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + t.amount, 0);
    const saldo = totalReceitas - totalDespesas;
    return { totalReceitas, totalDespesas, saldo };
  }, [transactions]);

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Controle Financeiro e Safras</h1>
          <p className="text-muted-foreground">Gerencie suas finanças e ciclos de produção.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => { setSelectedTransaction(null); setIsDialogOpen(true); }} className="flex-1 sm:flex-none">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
          <Button onClick={() => navigate('/nota-fiscal')} variant="outline" className="flex-1 sm:flex-none">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Nota Fiscal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cycles">Safras</TabsTrigger>
          <TabsTrigger value="plots">Talhões</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalReceitas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.totalDespesas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.saldo)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border min-w-[320px] max-w-full overflow-x-auto bg-white dark:bg-card">
            <Table className="w-full min-w-[600px]">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="cycles">
          <HarvestCyclesList />
        </TabsContent>
        <TabsContent value="plots">
          <PlotsList />
        </TabsContent>
        <TabsContent value="reports">
          <ProfitabilityReport />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{selectedTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
            <DialogDescription>
              {selectedTransaction ? "Altere os detalhes e salve." : "Preencha os detalhes da nova transação."}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            key={selectedTransaction?.id || 'new'}
            onSubmit={handleFormSubmit}
            defaultValues={selectedTransaction || {}}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financial;
