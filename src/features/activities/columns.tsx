
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Activity } from "./api";
import { ActivityRowActions } from "./ActivityRowActions";
import { Plot } from "@/features/plots/api";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Pendente: "destructive",
  'Em andamento': "secondary",
  Concluída: "default",
};

export const getColumns = (
  handleEdit: (activity: Activity) => void,
  handleDelete: (id: string) => void,
  isDeleting: boolean,
  plots: Plot[] = []
): ColumnDef<Activity>[] => [
  {
    accessorKey: "name",
    header: "Atividade",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "plot_id",
    header: "Talhão/Área",
    cell: ({ row }) => {
      const plotId = row.original.plot_id;
      if (!plotId) return "N/A";
      const plot = plots.find(p => p.id === plotId);
      return plot ? plot.name : "N/D";
    },
  },
  {
    accessorKey: "due_date",
    header: "Data de Conclusão",
    cell: ({ row }) => {
      const date = row.getValue("due_date");
      return date ? format(new Date(date as string), "dd/MM/yyyy", { locale: ptBR }) : "N/A";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={statusVariant[status] || "outline"}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActivityRowActions 
        activity={row.original} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    ),
  },
];
