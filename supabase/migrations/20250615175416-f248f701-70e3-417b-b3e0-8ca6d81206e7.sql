
ALTER TABLE public.user_usage
ADD CONSTRAINT fk_user_usage_to_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT fk_user_roles_to_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
