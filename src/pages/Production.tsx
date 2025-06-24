
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from 'date-fns'

import { useAuth } from "@/contexts/AuthContext";
import {
  getProductionRecords,
  createProductionRecord,
  updateProductionRecord,
  deleteProductionRecord,
  ProductionRecord,
  InsertProductionRecord,
  UpdateProductionRecord,
} from "@/features/production/api";
import { getColumns } from "@/features/production/columns";
import ProductionRecordForm, { ProductionRecordFormValues } from "@/features/production/ProductionRecordForm";
import { getPlots, Plot } from "@/features/plots/api";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Production = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | undefined>(undefined);

  const { data: productionRecords = [], isLoading } = useQuery({
    queryKey: ["productionRecords", user?.id],
    queryFn: getProductionRecords,
    enabled: !!user,
  });

  const { data: plots = [] } = useQuery<Plot[]>({
    queryKey: ["plots"],
    queryFn: getPlots,
  });

  const createMutation = useMutation({
    mutationFn: (item: InsertProductionRecord) => createProductionRecord(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionRecords"] });
      toast.success("Registro de produção adicionado!");
      setIsSheetOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar registro: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (item: UpdateProductionRecord & { id: string }) => updateProductionRecord(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionRecords"] });
      toast.success("Registro atualizado!");
      setIsSheetOpen(false);
      setSelectedRecord(undefined);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar registro: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductionRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productionRecords"] });
      toast.success("Registro excluído!");
      setIsAlertOpen(false);
      setSelectedRecord(undefined);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir registro: ${error.message}`);
    },
  });

  const handleFormSubmit = (values: ProductionRecordFormValues) => {
    if (!user) return;

    const plotId = values.plot_id === "none" ? null : values.plot_id || null;

    if (selectedRecord) {
      const updateData: UpdateProductionRecord & { id: string } = {
        id: selectedRecord.id,
        crop_name: values.crop_name,
        harvest_date: values.harvest_date,
        quantity: values.quantity,
        unit: values.unit,
        plot_id: plotId,
        quality: values.quality || null,
        observations: values.observations || null,
      };
      updateMutation.mutate(updateData);
    } else {
      const insertData: InsertProductionRecord = {
        user_id: user.id,
        crop_name: values.crop_name,
        harvest_date: values.harvest_date,
        quantity: values.quantity,
        unit: values.unit,
        plot_id: plotId,
        quality: values.quality || null,
        observations: values.observations || null,
      };
      createMutation.mutate(insertData);
    }
  };

  const handleEdit = (record: ProductionRecord) => {
    setSelectedRecord(record);
    setIsSheetOpen(true);
  };

  const handleDelete = (record: ProductionRecord) => {
    setSelectedRecord(record);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedRecord) {
      deleteMutation.mutate(selectedRecord.id);
    }
  }

  const columns = getColumns(handleEdit, handleDelete, plots);

  const table = useReactTable({
    data: productionRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento da Produção</h1>
          <p className="text-muted-foreground">Acompanhe a produtividade de suas culturas.</p>
        </div>
        <Button onClick={() => { setSelectedRecord(undefined); setIsSheetOpen(true); }} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Registro
        </Button>
      </div>

      <div className="rounded-md border min-w-[320px] overflow-x-auto">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Carregando..." : "Nenhum registro encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => {
          if (!open) setSelectedRecord(undefined);
          setIsSheetOpen(open);
      }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedRecord ? "Editar Registro" : "Adicionar Registro"}</SheetTitle>
            <SheetDescription>
              {selectedRecord ? "Atualize os detalhes do registro." : "Adicione um novo registro de produção."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <ProductionRecordForm
              onSubmit={handleFormSubmit}
              defaultValues={selectedRecord}
              isSubmitting={isSubmitting}
              plots={plots}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro
              da colheita de "{selectedRecord?.crop_name}" do dia {selectedRecord?.harvest_date && format(new Date(selectedRecord.harvest_date), 'dd/MM/yyyy')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Production;
