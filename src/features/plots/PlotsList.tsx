import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlots, createPlot, updatePlot, deletePlot, Plot } from "./api";
import { getColumns } from "./columns";
import { PlotForm } from "./PlotForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PlotsMap } from "./PlotsMap";
import { WeatherDisplay } from "./WeatherDisplay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PlotsList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: plots = [], isLoading } = useQuery({
    queryKey: ["plots"],
    queryFn: getPlots,
  });

  const filteredPlots = useMemo(() => {
    if (selectedPlotId === 'all') {
      return plots;
    }
    return plots.filter(plot => plot.id === selectedPlotId);
  }, [plots, selectedPlotId]);

  const selectedPlotObject = useMemo(() => {
    if (selectedPlotId === 'all') return null;
    return plots.find(p => p.id === selectedPlotId);
  }, [plots, selectedPlotId]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      setIsDialogOpen(false);
      setSelectedPlot(null);
    },
    onError: (error: Error) => {
      toast.error("Ocorreu um erro", { description: error.message });
    },
  };

  const createMutation = useMutation({
    mutationFn: createPlot,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Talhão criado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePlot,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Talhão atualizado com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] });
      toast.success("Talhão excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir talhão", { description: error.message });
    },
  });

  const handleFormSubmit = (values: any) => {
    if (!user) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return;
    }
    const plotData = { 
      ...values, 
      area_hectares: values.area_hectares || null, 
      user_id: user.id,
      geometry: values.geometry || null,
    };

    if (selectedPlot) {
      updateMutation.mutate({ ...plotData, id: selectedPlot.id });
    } else {
      createMutation.mutate(plotData);
    }
  };

  const handleEdit = (plot: Plot) => {
    setSelectedPlot(plot);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const columns = getColumns(handleEdit, handleDelete, deleteMutation.isPending);
  const table = useReactTable({ data: plots, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedPlotId} onValueChange={setSelectedPlotId}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Filtrar por talhão no mapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Talhões</SelectItem>
            {plots.map((plot) => (
              <SelectItem key={plot.id} value={plot.id}>
                {plot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <PlotsMap plots={filteredPlots} />
      {selectedPlotObject ? (
        <WeatherDisplay plot={selectedPlotObject} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clima e Análise de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Selecione um talhão no filtro acima para ver a previsão do tempo e análise de riscos climáticos.
            </p>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end">
        <Button onClick={() => { setSelectedPlot(null); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Talhão
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum talhão encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedPlot ? "Editar Talhão" : "Novo Talhão"}</DialogTitle>
            <DialogDescription>
              {selectedPlot ? "Altere os detalhes e salve." : "Preencha os detalhes do novo talhão."}
            </DialogDescription>
          </DialogHeader>
          <PlotForm
            key={selectedPlot?.id || 'new'}
            onSubmit={handleFormSubmit}
            defaultValues={selectedPlot || {}}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
