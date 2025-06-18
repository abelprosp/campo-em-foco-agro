
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type HarvestCycle = Tables<'harvest_cycles'>;
export type HarvestCycleInsert = TablesInsert<'harvest_cycles'>;
export type HarvestCycleUpdate = TablesUpdate<'harvest_cycles'>;

export const getHarvestCycles = async () => {
  const { data, error } = await supabase
    .from("harvest_cycles")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createHarvestCycle = async (cycle: HarvestCycleInsert) => {
  const { data, error } = await supabase.from('harvest_cycles').insert(cycle).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateHarvestCycle = async ({ id, ...cycleData }: HarvestCycleUpdate & { id: string }) => {
  const { data, error } = await supabase.from('harvest_cycles').update(cycleData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteHarvestCycle = async (id: string) => {
  const { error } = await supabase.from('harvest_cycles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return id;
};
