
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ProductionRecord } from "./api";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plot } from "@/features/plots/api";

const formSchema = z.object({
  crop_name: z.string().min(1, "O nome da cultura é obrigatório."),
  harvest_date: z.string().min(1, "A data da colheita é obrigatória."),
  quantity: z.coerce.number().min(0.01, "A quantidade deve ser maior que 0."),
  unit: z.string().min(1, "A unidade é obrigatória."),
  plot_id: z.string().optional(),
  quality: z.string().optional(),
  observations: z.string().optional(),
});

export type ProductionRecordFormValues = z.infer<typeof formSchema>;

interface ProductionRecordFormProps {
  onSubmit: (values: ProductionRecordFormValues) => void;
  defaultValues?: ProductionRecord;
  isSubmitting: boolean;
  plots: Plot[];
}

const ProductionRecordForm = ({ onSubmit, defaultValues, isSubmitting, plots }: ProductionRecordFormProps) => {
  const form = useForm<ProductionRecordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop_name: defaultValues?.crop_name ?? "",
      harvest_date: defaultValues?.harvest_date ? format(new Date(defaultValues.harvest_date), 'yyyy-MM-dd') : "",
      quantity: defaultValues?.quantity ?? undefined,
      unit: defaultValues?.unit ?? "",
      plot_id: defaultValues?.plot_id ?? "",
      quality: defaultValues?.quality ?? "",
      observations: defaultValues?.observations ?? "",
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        harvest_date: format(new Date(defaultValues.harvest_date), 'yyyy-MM-dd'),
        plot_id: defaultValues.plot_id ?? "",
        quality: defaultValues.quality ?? "",
        observations: defaultValues.observations ?? "",
      });
    } else {
      form.reset({
        crop_name: "",
        harvest_date: "",
        quantity: undefined,
        unit: "",
        plot_id: "",
        quality: "",
        observations: "",
      });
    }
  }, [defaultValues, form.reset]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="crop_name" render={({ field }) => ( <FormItem><FormLabel>Cultura</FormLabel><FormControl><Input placeholder="Ex: Soja, Milho" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="harvest_date" render={({ field }) => ( <FormItem><FormLabel>Data da Colheita</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField
            control={form.control}
            name="plot_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Talhão (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um talhão" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {plots.map((plot) => (
                      <SelectItem key={plot.id} value={plot.id}>
                        {plot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="unit" render={({ field }) => ( <FormItem><FormLabel>Unidade</FormLabel><FormControl><Input placeholder="Ex: Sacos, Toneladas" {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <FormField control={form.control} name="quality" render={({ field }) => ( <FormItem><FormLabel>Qualidade (Opcional)</FormLabel><FormControl><Input placeholder="Ex: Tipo A" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField control={form.control} name="observations" render={({ field }) => ( <FormItem><FormLabel>Observações (Opcional)</FormLabel><FormControl><Textarea placeholder="Observações sobre a colheita" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductionRecordForm;

