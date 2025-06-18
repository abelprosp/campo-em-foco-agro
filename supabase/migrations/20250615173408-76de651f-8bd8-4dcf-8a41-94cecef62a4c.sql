
-- Adicionar o usuário como administrador na tabela user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'arturabel01@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.system_settings (key, value, description) VALUES
('free_trial_days', '30', 'Número de dias do teste gratuito'),
('pro_plan_price', '14.90', 'Preço mensal do plano Pro em reais'),
('billing_enabled', 'false', 'Se o sistema de cobrança está ativo');

-- Criar política RLS para system_settings (apenas admins podem modificar)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system settings" ON public.system_settings
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All users can view system settings" ON public.system_settings
FOR SELECT TO authenticated USING (true);

-- Criar tabela para rastrear uso de usuários
CREATE TABLE public.user_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  trial_start_date timestamp with time zone DEFAULT now(),
  trial_end_date timestamp with time zone,
  plan_type text DEFAULT 'freemium',
  subscription_status text DEFAULT 'trial',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Política RLS para user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON public.user_usage
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user usage" ON public.user_usage
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar automaticamente registro de uso quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  trial_days integer;
BEGIN
  -- Buscar dias de teste gratuito das configurações
  SELECT (value::text)::integer INTO trial_days 
  FROM public.system_settings 
  WHERE key = 'free_trial_days';
  
  -- Se não encontrar, usar 30 dias como padrão
  IF trial_days IS NULL THEN
    trial_days := 30;
  END IF;
  
  -- Inserir registro de uso do usuário
  INSERT INTO public.user_usage (user_id, trial_start_date, trial_end_date)
  VALUES (
    NEW.id, 
    now(), 
    now() + (trial_days || ' days')::interval
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para executar a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created_usage ON auth.users;
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_usage();
