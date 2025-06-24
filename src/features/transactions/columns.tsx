import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "./api";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionRowActions } from "./TransactionRowActions";
import { Plot } from "@/features/plots/api";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const getColumns = (
  onEdit: (transaction: Transaction) => void,
  onDelete: (id: string) => void,
  isDeleting: boolean,
  plots: Plot[] = []
): ColumnDef<Transaction & { crop_name?: string | null }>[] => [
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.type;
      const color = type === "receita" ? "text-green-500" : "text-red-500";
      return <div className={`text-right font-medium ${color}`}>{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const variant = type === "receita" ? "success" : "destructive";
      return <Badge variant={variant} className="capitalize">{type}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") + 'T00:00:00');
      return <span>{format(date, "dd/MM/yyyy", { locale: ptBR })}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
  },
  {
    accessorKey: "crop_name",
    header: "Cultura",
    cell: ({ row }) => row.original.crop_name || "N/A",
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
    accessorKey: "file_url",
    header: "Anexo",
    cell: ({ row }) => {
        const fileUrl = row.original.file_url;
        if (!fileUrl) return null;
        return (
            <Button variant="ghost" size="icon" asChild>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver anexo">
                    <Paperclip />
                </a>
            </Button>
        )
    },
    size: 50,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <TransactionRowActions
          transaction={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </div>
    ),
  },
];
