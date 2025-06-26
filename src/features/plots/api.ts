import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Plot = Tables<'plots'>;
export type PlotInsert = TablesInsert<'plots'>;
export type PlotUpdate = TablesUpdate<'plots'>;

export const getPlots = async () => {
  const { data, error } = await supabase
    .from("plots")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const createPlot = async (plot: PlotInsert) => {
  console.log('API - Criando talhão:', plot);
  const { data, error } = await supabase.from('plots').insert(plot).select().single();
  if (error) {
    console.error('API - Erro ao criar talhão:', error);
    throw new Error(error.message);
  }
  console.log('API - Talhão criado com sucesso:', data);
  return data;
};

export const updatePlot = async ({ id, ...plotData }: PlotUpdate & { id: string }) => {
  console.log('API - Atualizando talhão:', { id, ...plotData });
  const { data, error } = await supabase.from('plots').update(plotData).eq('id', id).select().single();
  if (error) {
    console.error('API - Erro ao atualizar talhão:', error);
    throw new Error(error.message);
  }
  console.log('API - Talhão atualizado com sucesso:', data);
  return data;
};

export const deletePlot = async (id: string) => {
  console.log('API - Excluindo talhão:', id);
  const { error } = await supabase.from('plots').delete().eq('id', id);
  if (error) {
    console.error('API - Erro ao excluir talhão:', error);
    throw new Error(error.message);
  }
  console.log('API - Talhão excluído com sucesso:', id);
  return id;
};
