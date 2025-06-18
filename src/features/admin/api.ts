
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type SystemSetting = Tables<'system_settings'>;
export type UserUsage = Tables<'user_usage'>;
export type UserRole = Tables<'user_roles'>;

export const getSystemSettings = async () => {
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("key");

  if (error) throw new Error(error.message);
  return data;
};

export const updateSystemSetting = async (key: string, value: any) => {
  const { data, error } = await supabase
    .from("system_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      user_usage (
        trial_start_date,
        trial_end_date,
        plan_type,
        subscription_status
      ),
      user_roles (
        role
      )
    `);

  if (error) {
    console.error("Error fetching all users:", error);
    throw new Error(error.message);
  }
  return data;
};

export const updateUserUsage = async (userId: string, updates: Partial<UserUsage>) => {
  const { data, error } = await supabase
    .from("user_usage")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getUserStats = async () => {
  const { count: totalUsers, error: totalUsersError } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true });

  if (totalUsersError) throw new Error(totalUsersError.message);

  const { count: activeTrials, error: activeTrialsError } = await supabase
    .from("user_usage")
    .select("*", { count: 'exact', head: true })
    .eq("subscription_status", "trial")
    .gte("trial_end_date", new Date().toISOString());

  if (activeTrialsError) throw new Error(activeTrialsError.message);

  const { count: proUsers, error: proUsersError } = await supabase
    .from("user_usage")
    .select("*", { count: 'exact', head: true })
    .eq("plan_type", "pro");

  if (proUsersError) throw new Error(proUsersError.message);

  return {
    totalUsers: totalUsers || 0,
    activeTrials: activeTrials || 0,
    proUsers: proUsers || 0,
  };
};

export const checkIsAdmin = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .single();

  if (error) return false;
  return !!data;
};
