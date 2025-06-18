
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { useAuth } from "@/contexts/AuthContext";
import { getHarvestCycles, createHarvestCycle, updateHarvestCycle, deleteHarvestCycle, HarvestCycle } from "./api";
import { getColumns } from "./columns";
import { HarvestCycleForm } from "./HarvestCycleForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const HarvestCyclesList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<HarvestCycle | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ["harvestCycles"],
    queryFn: getHarvestCycles,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["harvestCycles"] });
      setIsDialogOpen(false);
      setSelectedCycle(null);
    },
    onError: (error: Error) => {
      toast.error("Ocorreu um erro", { description: error.message });
    },
  };

  const createMutation = useMutation({
    mutationFn: createHarvestCycle,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Safra criada com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateHarvestCycle,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Safra atualizada com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHarvestCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["harvestCycles"] });
      toast.success("Safra excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir safra", { description: error.message });
    },
  });

  const handleFormSubmit = (values: any) => {
    if (!user) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return;
    }
    const cycleData = {
      ...values,
      user_id: user.id,
      start_date: format(values.start_date, 'yyyy-MM-dd'),
      end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null,
    };
    
    if (selectedCycle) {
      updateMutation.mutate({ ...cycleData, id: selectedCycle.id });
    } else {
      createMutation.mutate(cycleData);
    }
  };
  
  const handleEdit = (cycle: HarvestCycle) => {
    setSelectedCycle(cycle);
    setIsDialogOpen(true);
  };

  const columns = getColumns(handleEdit, deleteMutation.mutate, deleteMutation.isPending);
  const table = useReactTable({ data: cycles, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => { setSelectedCycle(null); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Safra
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
                  Nenhuma safra encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{selectedCycle ? "Editar Safra" : "Nova Safra"}</DialogTitle>
            <DialogDescription>
              {selectedCycle ? "Altere os detalhes e salve." : "Preencha os detalhes da nova safra."}
            </DialogDescription>
          </DialogHeader>
          <HarvestCycleForm
            key={selectedCycle?.id || 'new'}
            onSubmit={handleFormSubmit}
            defaultValues={selectedCycle || {}}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
