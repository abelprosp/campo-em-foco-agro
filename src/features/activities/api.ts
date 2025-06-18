
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Activity = Tables<'activities'>;
export type ActivityInsert = TablesInsert<'activities'>;
export type ActivityUpdate = TablesUpdate<'activities'>;

export const getActivities = async () => {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createActivity = async (activity: ActivityInsert) => {
  const { data, error } = await supabase.from('activities').insert(activity).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateActivity = async ({ id, ...activityData }: ActivityUpdate & { id: string }) => {
  const { data, error } = await supabase.from('activities').update(activityData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteActivity = async (id: string) => {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return id;
};
