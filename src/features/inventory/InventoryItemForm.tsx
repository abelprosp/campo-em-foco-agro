import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "./api";
import { Textarea } from "@/components/ui/textarea";

export const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().nullable().optional(),
  quantity: z.coerce.number().min(0, "A quantidade não pode ser negativa."),
  unit: z.string().min(1, "A unidade é obrigatória."),
  category: z.string().nullable().optional(),
  low_stock_threshold: z.coerce.number().min(0, "O limite não pode ser negativo.").nullable().optional(),
});

export type InventoryItemFormValues = z.infer<typeof formSchema>;

interface InventoryItemFormProps {
  onSubmit: (values: InventoryItemFormValues) => void;
  defaultValues?: InventoryItem;
  isSubmitting: boolean;
}

export const InventoryItemForm = ({ onSubmit, defaultValues, isSubmitting }: InventoryItemFormProps) => {
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? null,
      quantity: defaultValues?.quantity ?? 0,
      unit: defaultValues?.unit ?? "",
      category: defaultValues?.category ?? null,
      low_stock_threshold: defaultValues?.low_stock_threshold ?? null,
    },
  });

  const handleSubmit = (values: InventoryItemFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Item</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sementes de Milho" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Sementes de milho crioulo para plantio" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: kg, L, un" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Insumo, Equipamento" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="low_stock_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alerta de Estoque Baixo</FormLabel>
                <FormControl>
                   <Input type="number" placeholder="Opcional" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
};
