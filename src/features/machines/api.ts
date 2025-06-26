import { supabase } from "@/integrations/supabase/client";

export async function getMachines(userId: string) {
  const { data, error } = await supabase
    .from("maquinas")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function addMachine(machine: any) {
  const { data, error } = await supabase
    .from("maquinas")
    .insert([machine])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
} 