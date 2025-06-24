
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  user_usage: Database['public']['Tables']['user_usage']['Row'] | null;
};
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_usage (
        trial_end_date,
        plan_type,
        subscription_status
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile | null;
};

export const updateProfile = async (profile: UpdateProfile) => {
  if (!profile.id) throw new Error("Profile ID is required for update.");

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profile.full_name,
      farm_name: profile.farm_name,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const uploadAvatar = async (userId: string, file: File) => {
  // To avoid collisions, let's use a unique path for each user.
  const filePath = `${userId}/${file.name}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite existing file
    });

  if (error) {
    throw error;
  }

  return filePath;
};

export const getAvatarPublicUrl = (path: string) => {
  if (!path) return null;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};
