import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Package } from 'lucide-react';
import { useInvoices, InvoiceData } from '@/hooks/useInvoices';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems, InventoryItem } from '@/features/inventory/api';
import { useAuth } from '@/contexts/AuthContext';

const invoiceSchema = z.object({
  numero: z.string().min(1, 'Número é obrigatório'),
  serie: z.string().min(1, 'Série é obrigatória'),
  dataEmissao: z.date(),
  cliente: z.object({
    nome: z.string().min(1, 'Nome do cliente é obrigatório'),
    cpfCnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    uf: z.string().min(2, 'UF é obrigatória').max(2),
    cep: z.string().min(1, 'CEP é obrigatório'),
  }),
  emitente: z.object({
    nome: z.string().min(1, 'Nome do emitente é obrigatório'),
    cnpj: z.string().min(1, 'CNPJ é obrigatório'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    uf: z.string().min(2, 'UF é obrigatória').max(2),
    cep: z.string().min(1, 'CEP é obrigatório'),
  }),
  itens: z.array(z.object({
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    quantidade: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
    valorUnitario: z.number().min(0.01, 'Valor unitário deve ser maior que 0'),
    valorTotal: z.number().min(0.01, 'Valor total deve ser maior que 0'),
  })).min(1, 'Pelo menos um item é obrigatório'),
  tributos: z.object({
    icms: z.number().min(0, 'ICMS deve ser maior ou igual a 0'),
    ipi: z.number().min(0, 'IPI deve ser maior ou igual a 0'),
    pis: z.number().min(0, 'PIS deve ser maior ou igual a 0'),
    cofins: z.number().min(0, 'COFINS deve ser maior ou igual a 0'),
  }),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const InvoiceForm = () => {
  const { generateDANFE, isGenerating } = useInvoices();
  const { user } = useAuth();
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventoryItems", user?.id],
    queryFn: getInventoryItems,
    enabled: !!user,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      dataEmissao: new Date(),
      itens: [{ descricao: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }],
      tributos: { icms: 0, ipi: 0, pis: 0, cofins: 0 },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itens',
  });

  const watchedItens = watch('itens');

  // Calcula valor total automaticamente
  const updateItemTotal = (index: number, quantidade: number, valorUnitario: number) => {
    const valorTotal = quantidade * valorUnitario;
    setValue(`itens.${index}.valorTotal`, valorTotal);
  };

  const valorTotalNota = watchedItens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);

  const onSubmit = async (data: InvoiceFormData) => {
    // Since the form is validated by Zod, we know all required fields are present
    // We can safely cast to InvoiceData as the validation ensures completeness
    const invoiceData = {
      numero: data.numero,
      serie: data.serie,
      dataEmissao: data.dataEmissao,
      cliente: {
        nome: data.cliente.nome,
        cpfCnpj: data.cliente.cpfCnpj,
        endereco: data.cliente.endereco,
        cidade: data.cliente.cidade,
        uf: data.cliente.uf,
        cep: data.cliente.cep,
      },
      emitente: {
        nome: data.emitente.nome,
        cnpj: data.emitente.cnpj,
        endereco: data.emitente.endereco,
        cidade: data.emitente.cidade,
        uf: data.emitente.uf,
        cep: data.emitente.cep,
      },
      itens: data.itens.map(item => ({
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
      })),
      tributos: {
        icms: data.tributos.icms,
        ipi: data.tributos.ipi,
        pis: data.tributos.pis,
        cofins: data.tributos.cofins,
      },
      valorTotal: valorTotalNota,
    } as InvoiceData;

    await generateDANFE(invoiceData);
  };

  const addInventoryItem = (item: InventoryItem) => {
    append({
      descricao: item.name + (item.description ? ` - ${item.description}` : ''),
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    });
    setIsInventoryDialogOpen(false);
    toast.success('Item adicionado à nota fiscal!');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Emissão de Nota Fiscal - DANFE</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Nota */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Nota Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  {...register('numero')}
                  placeholder="000001"
                />
                {errors.numero && (
                  <p className="text-sm text-red-500 mt-1">{errors.numero.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="serie">Série *</Label>
                <Input
                  id="serie"
                  {...register('serie')}
                  placeholder="001"
                />
                {errors.serie && (
                  <p className="text-sm text-red-500 mt-1">{errors.serie.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                <Input
                  id="dataEmissao"
                  type="date"
                  {...register('dataEmissao', { valueAsDate: true })}
                />
                {errors.dataEmissao && (
                  <p className="text-sm text-red-500 mt-1">{errors.dataEmissao.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emitente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Emitente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="emitente.nome">Razão Social *</Label>
                <Input
                  id="emitente.nome"
                  {...register('emitente.nome')}
                  placeholder="Nome da empresa"
                />
                {errors.emitente?.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.emitente.nome.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="emitente.cnpj">CNPJ *</Label>
                <Input
                  id="emitente.cnpj"
                  {...register('emitente.cnpj')}
                  placeholder="00.000.000/0001-00"
                />
                {errors.emitente?.cnpj && (
                  <p className="text-sm text-red-500 mt-1">{errors.emitente.cnpj.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="emitente.cep">CEP *</Label>
                <Input
                  id="emitente.cep"
                  {...register('emitente.cep')}
                  placeholder="00000-000"
                />
                {errors.emitente?.cep && (
                  <p className="text-sm text-red-500 mt-1">{errors.emitente.cep.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="emitente.endereco">Endereço *</Label>
                <Input
                  id="emitente.endereco"
                  {...register('emitente.endereco')}
                  placeholder="Rua, número, bairro"
                />
                {errors.emitente?.endereco && (
                  <p className="text-sm text-red-500 mt-1">{errors.emitente.endereco.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="emitente.cidade">Cidade *</Label>
                <Input
                  id="emitente.cidade"
                  {...register('emitente.cidade')}
                  placeholder="Nome da cidade"
                />
                {errors.emitente?.cidade && (
                  <p className="text-sm text-red-500 mt-1">{errors.emitente.cidade.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="emitente.uf">UF *</Label>
                <Input
                  id="emitente.uf"
                  {...register('emitente.uf')}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.emitente?.uf && (
                  <p className="text-sm text-red-500 mt-1">{errors.emitente.uf.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Destinatário */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Destinatário</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="cliente.nome">Nome/Razão Social *</Label>
                <Input
                  id="cliente.nome"
                  {...register('cliente.nome')}
                  placeholder="Nome do cliente"
                />
                {errors.cliente?.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.cliente.nome.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cliente.cpfCnpj">CPF/CNPJ *</Label>
                <Input
                  id="cliente.cpfCnpj"
                  {...register('cliente.cpfCnpj')}
                  placeholder="000.000.000-00"
                />
                {errors.cliente?.cpfCnpj && (
                  <p className="text-sm text-red-500 mt-1">{errors.cliente.cpfCnpj.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cliente.cep">CEP *</Label>
                <Input
                  id="cliente.cep"
                  {...register('cliente.cep')}
                  placeholder="00000-000"
                />
                {errors.cliente?.cep && (
                  <p className="text-sm text-red-500 mt-1">{errors.cliente.cep.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cliente.endereco">Endereço *</Label>
                <Input
                  id="cliente.endereco"
                  {...register('cliente.endereco')}
                  placeholder="Rua, número, bairro"
                />
                {errors.cliente?.endereco && (
                  <p className="text-sm text-red-500 mt-1">{errors.cliente.endereco.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cliente.cidade">Cidade *</Label>
                <Input
                  id="cliente.cidade"
                  {...register('cliente.cidade')}
                  placeholder="Nome da cidade"
                />
                {errors.cliente?.cidade && (
                  <p className="text-sm text-red-500 mt-1">{errors.cliente.cidade.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cliente.uf">UF *</Label>
                <Input
                  id="cliente.uf"
                  {...register('cliente.uf')}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.cliente?.uf && (
                  <p className="text-sm text-red-500 mt-1">{errors.cliente.uf.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Produtos/Serviços
                <div className="flex gap-2">
                  <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Package className="w-4 h-4 mr-2" />
                        Do Estoque
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Selecionar do Estoque</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto">
                        {inventoryItems.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Nenhum item encontrado no estoque.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {inventoryItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                onClick={() => addInventoryItem(item)}
                              >
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    Estoque: {item.quantity} {item.unit}
                                  </p>
                                </div>
                                <Button type="button" size="sm">
                                  Adicionar
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ descricao: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label htmlFor={`itens.${index}.descricao`}>Descrição *</Label>
                      <Input
                        {...register(`itens.${index}.descricao`)}
                        placeholder="Descrição do produto/serviço"
                      />
                      {errors.itens?.[index]?.descricao && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.itens[index]?.descricao?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`itens.${index}.quantidade`}>Quantidade *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`itens.${index}.quantidade`, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const quantidade = parseFloat(e.target.value) || 0;
                            const valorUnitario = watchedItens[index]?.valorUnitario || 0;
                            updateItemTotal(index, quantidade, valorUnitario);
                          },
                        })}
                        placeholder="1"
                      />
                      {errors.itens?.[index]?.quantidade && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.itens[index]?.quantidade?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`itens.${index}.valorUnitario`}>Valor Unit. *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`itens.${index}.valorUnitario`, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const valorUnitario = parseFloat(e.target.value) || 0;
                            const quantidade = watchedItens[index]?.quantidade || 0;
                            updateItemTotal(index, quantidade, valorUnitario);
                          },
                        })}
                        placeholder="0,00"
                      />
                      {errors.itens?.[index]?.valorUnitario && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.itens[index]?.valorUnitario?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Valor Total</Label>
                        <Input
                          value={`R$ ${(watchedItens[index]?.valorTotal || 0).toFixed(2)}`}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tributos */}
          <Card>
            <CardHeader>
              <CardTitle>Tributos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tributos.icms">ICMS (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('tributos.icms', { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.tributos?.icms && (
                  <p className="text-sm text-red-500 mt-1">{errors.tributos.icms.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tributos.ipi">IPI (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('tributos.ipi', { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.tributos?.ipi && (
                  <p className="text-sm text-red-500 mt-1">{errors.tributos.ipi.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tributos.pis">PIS (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('tributos.pis', { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.tributos?.pis && (
                  <p className="text-sm text-red-500 mt-1">{errors.tributos.pis.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tributos.cofins">COFINS (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('tributos.cofins', { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.tributos?.cofins && (
                  <p className="text-sm text-red-500 mt-1">{errors.tributos.cofins.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo e Botão */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Valor Total da Nota:</span>
                <span className="text-2xl font-bold text-green-600">
                  R$ {valorTotalNota.toFixed(2)}
                </span>
              </div>
              <Separator className="mb-4" />
              <Button type="submit" disabled={isGenerating} className="w-full">
                {isGenerating ? 'Gerando DANFE...' : 'Gerar DANFE'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
