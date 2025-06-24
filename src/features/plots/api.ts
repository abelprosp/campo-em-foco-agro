
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
  const { data, error } = await supabase.from('plots').insert(plot).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updatePlot = async ({ id, ...plotData }: PlotUpdate & { id: string }) => {
  const { data, error } = await supabase.from('plots').update(plotData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deletePlot = async (id: string) => {
  const { error } = await supabase.from('plots').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return id;
};
