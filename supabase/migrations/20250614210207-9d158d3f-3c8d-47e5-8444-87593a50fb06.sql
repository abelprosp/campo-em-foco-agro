
-- Adiciona a coluna file_url para armazenar o link do anexo
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Cria um novo bucket no Supabase Storage para os arquivos das transações, se ele não existir.
-- Define um limite de 5MB por arquivo e permite apenas PDFs e imagens.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('transaction_files', 'transaction_files', true, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Limpa políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own files" ON storage.objects;

-- Políticas de segurança para o bucket de armazenamento

-- Permite que usuários autenticados vejam seus próprios arquivos
CREATE POLICY "Authenticated users can view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'transaction_files' AND auth.uid()::text = owner_id);

-- Permite que usuários autenticados façam upload de arquivos.
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'transaction_files');

-- Permite que os usuários atualizem seus próprios arquivos.
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'transaction_files' AND auth.uid()::text = owner_id);

-- Permite que os usuários excluam seus próprios arquivos.
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'transaction_files' AND auth.uid()::text = owner_id);

