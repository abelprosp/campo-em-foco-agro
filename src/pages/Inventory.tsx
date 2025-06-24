import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  InventoryItem,
  InventoryItemInsert,
  InventoryItemUpdate,
} from "@/features/inventory/api";
import { getColumns } from "@/features/inventory/columns";
import { InventoryItemForm, InventoryItemFormValues } from "@/features/inventory/InventoryItemForm";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

const Inventory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);

  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ["inventoryItems", user?.id],
    queryFn: getInventoryItems,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (item: InventoryItemInsert) => createInventoryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Item adicionado ao estoque!");
      setIsSheetOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (item: InventoryItemUpdate & { id: string }) => updateInventoryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Item atualizado!");
      setIsSheetOpen(false);
      setSelectedItem(undefined);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar item: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Item excluído!");
      setIsAlertOpen(false);
      setSelectedItem(undefined);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir item: ${error.message}`);
    },
  });

  const handleFormSubmit = (values: InventoryItemFormValues) => {
    if (!user) return;

    const commonData = {
      name: values.name,
      description: values.description || null,
      quantity: values.quantity,
      unit: values.unit,
      category: values.category || null,
      low_stock_threshold: values.low_stock_threshold ?? null,
    };

    if (selectedItem) {
      updateMutation.mutate({
        ...commonData,
        id: selectedItem.id,
      });
    } else {
      createMutation.mutate({
        ...commonData,
        user_id: user.id,
      });
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  }

  const columns = getColumns(handleEdit, handleDelete);

  const table = useReactTable({
    data: inventoryItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Inventário de Insumos e Equipamentos</h1>
          <p className="text-muted-foreground">Controle seu estoque de insumos e equipamentos.</p>
        </div>
        <Button onClick={() => { setSelectedItem(undefined); setIsSheetOpen(true); }} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Item
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
                  {isLoading ? "Carregando..." : "Nenhum item encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
          if (!open) setSelectedItem(undefined);
          setIsSheetOpen(open);
      }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedItem ? "Editar Item" : "Adicionar Item"}</SheetTitle>
            <SheetDescription>
              {selectedItem ? "Atualize os detalhes do item." : "Adicione um novo item ao seu inventário."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <InventoryItemForm
              onSubmit={handleFormSubmit}
              defaultValues={selectedItem}
              isSubmitting={isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o item
              "{selectedItem?.name}" do seu inventário.
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

export default Inventory;
