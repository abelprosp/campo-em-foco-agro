
-- Adiciona a coluna farm_name na tabela de perfis
ALTER TABLE public.profiles ADD COLUMN farm_name TEXT;

-- Cria um bucket no Supabase Storage para os avatares
-- O limite de tamanho do arquivo é de 5MB e só são permitidos arquivos .png e .jpeg.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg']);

-- Política RLS para permitir leitura pública dos avatares
CREATE POLICY "Avatares podem ser lidos por todos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Política RLS para permitir que usuários autenticados enviem seus avatares
CREATE POLICY "Usuários autenticados podem enviar avatares"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Política RLS para permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner AND bucket_id = 'avatars');

-- Política RLS para permitir que usuários deletem seus próprios avatares
CREATE POLICY "Usuários podem deletar seus próprios avatares"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner AND bucket_id = 'avatars');
