import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "./api";

const formSchema = z.object({
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo." }),
  type: z.enum(["receita", "despesa"], { required_error: "Tipo é obrigatório." }),
  date: z.date({ required_error: "Data é obrigatória." }),
  category: z.string().optional(),
  crop_name: z.string().optional(),
  file: z.any().optional(),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSubmit: (values: TransactionFormValues & { file?: File | null, file_url?: string | null }) => void;
  defaultValues?: Partial<Transaction & { crop_name?: string | null }>;
  isPending: boolean;
}

export const TransactionForm = ({ onSubmit, defaultValues = {}, isPending }: TransactionFormProps) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      description: defaultValues.description || "",
      amount: defaultValues.amount || undefined,
      category: defaultValues.category || "",
      crop_name: defaultValues.crop_name || "",
      date: defaultValues.date ? new Date(defaultValues.date + 'T00:00:00') : new Date(),
      type: defaultValues.type || undefined,
      file: undefined,
    },
  });

  const currentFileUrl = defaultValues?.file_url;

  const handleFormSubmit = (values: TransactionFormValues) => {
    const { file, ...rest } = values;
    const submissionValues = {
      ...rest,
      file: file && file.length > 0 ? file[0] : null,
      file_url: currentFileUrl,
    };
    onSubmit(submissionValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Salário, Aluguel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Moradia, Lazer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1">
          <FormField
            control={form.control}
            name="crop_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cultura (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Soja, Milho" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormItem>
          <FormLabel>Anexo (Opcional - PDF, JPG, PNG)</FormLabel>
          <FormControl>
            <Input type="file" {...form.register("file")} accept=".pdf,.jpg,.jpeg,.png"/>
          </FormControl>
          {currentFileUrl && !form.watch("file")?.[0] && (
             <p className="text-sm text-muted-foreground mt-1">
               Anexo atual: <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{currentFileUrl.split('/').pop()}</a>
             </p>
          )}
          <FormMessage />
        </FormItem>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </form>
    </Form>
  );
};
