
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type InventoryItem = Tables<'inventory_items'>;
export type InventoryItemInsert = TablesInsert<'inventory_items'>;
export type InventoryItemUpdate = TablesUpdate<'inventory_items'>;

export const getInventoryItems = async () => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createInventoryItem = async (item: InventoryItemInsert) => {
  const { data, error } = await supabase.from('inventory_items').insert(item).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateInventoryItem = async ({ id, ...itemData }: InventoryItemUpdate & { id: string }) => {
  const { data, error } = await supabase.from('inventory_items').update(itemData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return id;
};
