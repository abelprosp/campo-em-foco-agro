import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type ProductionRecord = Database['public']['Tables']['production_records']['Row'];
export type InsertProductionRecord = Database['public']['Tables']['production_records']['Insert'];
export type UpdateProductionRecord = Database['public']['Tables']['production_records']['Update'];

export const getProductionRecords = async () => {
  const { data, error } = await supabase
    .from("production_records")
    .select("*")
    .order("harvest_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createProductionRecord = async (record: InsertProductionRecord) => {
  const { data, error } = await supabase
    .from("production_records")
    .insert(record)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateProductionRecord = async ({ id, ...record }: UpdateProductionRecord & { id: string }) => {
  const { data, error } = await supabase
    .from("production_records")
    .update(record)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteProductionRecord = async (id: string) => {
  const { error } = await supabase
    .from("production_records")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};
