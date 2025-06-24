
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ProductionRecord } from "./api";
import { ProductionRecordRowActions } from "./ProductionRecordRowActions";
import { Plot } from "@/features/plots/api";

export const getColumns = (
  onEdit: (record: ProductionRecord) => void,
  onDelete: (record: ProductionRecord) => void,
  plots: Plot[] = []
): ColumnDef<ProductionRecord>[] => [
  {
    accessorKey: "crop_name",
    header: "Cultura",
  },
  {
    accessorKey: "harvest_date",
    header: "Data da Colheita",
    cell: ({ row }) => format(new Date(row.getValue("harvest_date")), "dd/MM/yyyy"),
  },
  {
    accessorKey: "quantity",
    header: "Quantidade",
    cell: ({ row }) => {
        const quantity = parseFloat(row.getValue("quantity"))
        const unit = row.original.unit
        return `${quantity.toLocaleString('pt-BR')} ${unit}`
    }
  },
  {
    accessorKey: "plot_id",
    header: "Talhão",
    cell: ({ row }) => {
      const plotId = row.original.plot_id;
      if (!plotId) return "N/A";
      const plot = plots.find(p => p.id === plotId);
      return plot ? plot.name : "N/D";
    },
  },
  {
    accessorKey: "quality",
    header: "Qualidade",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ProductionRecordRowActions 
        record={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
