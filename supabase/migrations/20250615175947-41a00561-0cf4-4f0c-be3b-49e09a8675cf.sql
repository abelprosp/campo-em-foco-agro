
-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Update the function to populate email on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Backfill email for existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Add a unique constraint to the email column now that it's populated
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
