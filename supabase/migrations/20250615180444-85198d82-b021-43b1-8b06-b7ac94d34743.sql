
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  trial_days integer;
BEGIN
  -- Buscar dias de teste gratuito das configurações
  -- Usar trim para remover aspas que podem ser adicionadas ao salvar a configuração pelo painel admin
  SELECT trim(value::text, '"')::integer INTO trial_days 
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
