import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Plot } from "./api";
import { PlotEditorMap } from "./PlotEditorMap";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  area_hectares: z.preprocess(
    (a) => (a === '' || a === null) ? null : parseFloat(z.string().parse(a)),
    z.number().positive("A área deve ser um número positivo.").optional().nullable()
  ),
  geometry: z.any().optional().nullable(),
});

type PlotFormValues = z.infer<typeof formSchema>;

interface PlotFormProps {
  onSubmit: (values: PlotFormValues) => void;
  defaultValues?: Partial<Plot>;
  isPending: boolean;
}

export const PlotForm = ({ onSubmit, defaultValues, isPending }: PlotFormProps) => {
  const form = useForm<PlotFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      area_hectares: defaultValues?.area_hectares || null,
      geometry: defaultValues?.geometry || null,
    },
  });

  useEffect(() => {
    console.log('PlotForm - defaultValues:', defaultValues);
    console.log('PlotForm - form values:', form.getValues());
    
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      const newValues = {
        name: defaultValues.name || "",
        area_hectares: defaultValues.area_hectares || null,
        geometry: defaultValues.geometry || null,
      };
      console.log('PlotForm - Aplicando novos valores:', newValues);
      form.reset(newValues);
    } else {
      console.log('PlotForm - Resetando formulário para valores vazios');
      form.reset({
        name: "",
        area_hectares: null,
        geometry: null,
      });
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: PlotFormValues) => {
    console.log('PlotForm - valores submetidos:', values);
    console.log('PlotForm - validando valores...');
    
    try {
      // Testar validação manualmente
      const validatedData = formSchema.parse(values);
      console.log('PlotForm - valores validados com sucesso:', validatedData);
      onSubmit(values);
    } catch (error) {
      console.error('PlotForm - erro na validação:', error);
      // Mesmo assim, tentar submeter
      onSubmit(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Talhão</FormLabel>
              <FormControl>
                <Input placeholder="Talhão A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="area_hectares"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área (em hectares)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10.5" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="geometry"
          render={() => (
            <FormItem>
              <FormLabel>Geometria do Talhão (opcional)</FormLabel>
              <FormControl>
                <PlotEditorMap
                  initialGeometry={form.getValues('geometry')}
                  onGeometryChange={(geom) => form.setValue('geometry', geom, { shouldValidate: true, shouldDirty: true })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('Teste - Valores atuais do formulário:', form.getValues());
            console.log('Teste - defaultValues:', defaultValues);
          }}
          className="w-full"
        >
          Testar Formulário
        </Button>
      </form>
    </Form>
  );
};
