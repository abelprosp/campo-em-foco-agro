import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Plot } from "./api";

interface PlotRowActionsProps {
  plot: Plot;
  onEdit: (plot: Plot) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const PlotRowActions = ({ plot, onEdit, onDelete, isDeleting }: PlotRowActionsProps) => {
  const handleEdit = () => {
    console.log('PlotRowActions - Editando talhão:', plot);
    onEdit(plot);
  };

  const handleDelete = () => {
    console.log('PlotRowActions - Excluindo talhão:', plot.id);
    onDelete(plot.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
