
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HarvestCycle } from "./api";
import { HarvestCycleRowActions } from "./HarvestCycleRowActions";

export const getColumns = (
  onEdit: (cycle: HarvestCycle) => void,
  onDelete: (id: string) => void,
  isDeleting: boolean,
): ColumnDef<HarvestCycle>[] => [
  {
    accessorKey: "name",
    header: "Nome da Safra",
  },
  {
    accessorKey: "start_date",
    header: "Data de Início",
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_date") + 'T00:00:00');
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    },
  },
  {
    accessorKey: "end_date",
    header: "Data de Fim",
    cell: ({ row }) => {
      const dateValue = row.getValue("end_date");
      if (!dateValue) return "Em andamento";
      const date = new Date(dateValue + 'T00:00:00');
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <HarvestCycleRowActions
          cycle={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </div>
    ),
  },
];
