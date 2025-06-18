
-- Adiciona a coluna crop_name à tabela de transações para permitir a análise de lucro por cultura.
-- Esta coluna será opcional, pois nem toda transação está ligada a uma cultura.
ALTER TABLE public.transactions ADD COLUMN crop_name TEXT;
