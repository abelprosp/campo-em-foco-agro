
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Transaction = Tables<'transactions'>;
export type TransactionInsert = TablesInsert<'transactions'>;
export type TransactionUpdate = TablesUpdate<'transactions'>;

const uploadTransactionFile = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('transaction_files')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
    }

    const { data } = supabase.storage
        .from('transaction_files')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

const deleteTransactionFile = async (fileUrl: string) => {
    if (!fileUrl) return;
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage.from('transaction_files').remove([fileName]);
    if (error) {
        console.error("Falha ao excluir o arquivo antigo:", error.message);
    }
};

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createTransaction = async ({ file, ...transaction }: TransactionInsert & { file?: File | null }) => {
  let fileUrl = null;
  if (file && transaction.user_id) {
      fileUrl = await uploadTransactionFile(file, transaction.user_id);
  }
  
  const { data, error } = await supabase.from('transactions').insert({ ...transaction, file_url: fileUrl }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateTransaction = async ({ id, file, ...transactionData }: TransactionUpdate & { id: string; file?: File | null }) => {
  let fileUrl = transactionData.file_url; // Keep existing url by default

  if (file && transactionData.user_id) {
      // If there's a new file, upload it
      // First delete the old one if it exists
      if (transactionData.file_url) {
          await deleteTransactionFile(transactionData.file_url as string);
      }
      fileUrl = await uploadTransactionFile(file, transactionData.user_id);
  }

  const { data, error } = await supabase.from('transactions').update({ ...transactionData, file_url: fileUrl }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteTransaction = async (id: string) => {
  // Also delete associated file
  const { data: transaction } = await supabase.from('transactions').select('file_url').eq('id', id).single();
  if (transaction?.file_url) {
      await deleteTransactionFile(transaction.file_url);
  }

  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return id;
};
