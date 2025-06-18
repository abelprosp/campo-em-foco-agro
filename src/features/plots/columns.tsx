
import { ColumnDef } from "@tanstack/react-table";
import { Plot } from "./api";
import { PlotRowActions } from "./PlotRowActions";

export const getColumns = (
  onEdit: (plot: Plot) => void,
  onDelete: (id: string) => void,
  isDeleting: boolean,
): ColumnDef<Plot>[] => [
  {
    accessorKey: "name",
    header: "Nome do Talhão",
  },
  {
    accessorKey: "area_hectares",
    header: "Área (ha)",
    cell: ({ row }) => {
        const area = row.getValue("area_hectares");
        return area ? `${Number(area).toLocaleString('pt-BR')} ha` : 'N/D';
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <PlotRowActions
          plot={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </div>
    ),
  },
];
