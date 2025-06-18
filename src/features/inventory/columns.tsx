
import { ColumnDef } from "@tanstack/react-table";
import { InventoryItem } from "./api";
import { Badge } from "@/components/ui/badge";
import { InventoryItemRowActions } from "./InventoryItemRowActions";

export const getColumns = (
  onEdit: (item: InventoryItem) => void,
  onDelete: (item: InventoryItem) => void
): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "quantity",
    header: "Quantidade",
    cell: ({ row }) => {
      const item = row.original;
      const isLowStock = item.low_stock_threshold !== null && item.quantity <= item.low_stock_threshold;
      return (
        <div className="flex items-center gap-2">
          <span>{`${item.quantity} ${item.unit}`}</span>
          {isLowStock && <Badge variant="destructive">Estoque Baixo</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => row.original.category || "-",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-right">
          <InventoryItemRowActions 
            item={item}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </div>
      );
    },
  },
];
