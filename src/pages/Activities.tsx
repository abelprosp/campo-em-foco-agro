
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActivities, createActivity, updateActivity, deleteActivity, Activity } from "@/features/activities/api";
import { getColumns } from "@/features/activities/columns";
import { ActivityForm } from "@/features/activities/ActivityForm";
import { ActivityCalendar } from "@/features/activities/ActivityCalendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { getPlots, Plot } from "@/features/plots/api";

const Activities = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  const { data: plots = [] } = useQuery<Plot[]>({
    queryKey: ["plots"],
    queryFn: getPlots,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      setIsDialogOpen(false);
      setSelectedActivity(null);
    },
    onError: (error: Error) => {
      toast.error("Ocorreu um erro", { description: error.message });
    },
  };

  const createMutation = useMutation({
    mutationFn: createActivity,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Atividade criada com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateActivity,
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast.success("Atividade atualizada com sucesso!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Atividade excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir atividade", { description: error.message });
    },
  });

  const handleFormSubmit = (values: any) => {
    if (!user) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return;
    }
    const activityData = {
      ...values,
      user_id: user.id,
      due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : null,
    };
    
    if (selectedActivity) {
      updateMutation.mutate({ ...activityData, id: selectedActivity.id });
    } else {
      createMutation.mutate(activityData);
    }
  };
  
  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const columns = getColumns(handleEdit, deleteMutation.mutate, deleteMutation.isPending, plots);
  const table = useReactTable({ data: activities, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Registro de Atividades</h1>
          <p className="text-muted-foreground">Cadastre e acompanhe suas atividades diárias.</p>
        </div>
        <Button onClick={() => { setSelectedActivity(null); setIsDialogOpen(true); }} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <ActivityCalendar activities={activities} />
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-md border min-w-[320px] overflow-x-auto">
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
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma atividade encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedActivity ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
            <DialogDescription>
              {selectedActivity ? "Altere os detalhes e salve." : "Preencha os detalhes da nova atividade."}
            </DialogDescription>
          </DialogHeader>
          <ActivityForm
            key={selectedActivity?.id || 'new'}
            onSubmit={handleFormSubmit}
            defaultValues={selectedActivity || { status: 'Pendente' }}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Activities;
