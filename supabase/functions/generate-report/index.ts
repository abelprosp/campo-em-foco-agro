
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Groq from 'https://esm.sh/groq-sdk@0.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('A chave de API da Groq (GROQ_API_KEY) não está configurada nos segredos do Supabase.')
    }
    const groq = new Groq({ apiKey: groqApiKey })

    const [
      { data: activities, error: activitiesError },
      { data: transactions, error: transactionsError },
      { data: inventory, error: inventoryError },
      { data: production, error: productionError },
    ] = await Promise.all([
      supabaseAdmin.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('transactions').select('*').order('date', { ascending: false }).limit(200), // Fetch more transactions for chart
      supabaseAdmin.from('inventory_items').select('*').order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('production_records').select('*').order('harvest_date', { ascending: false }).limit(100), // Fetch more production for chart
    ])

    if (activitiesError || transactionsError || inventoryError || productionError) {
      console.error({ activitiesError, transactionsError, inventoryError, productionError })
      throw new Error('Falha ao buscar os dados de uma ou mais tabelas.')
    }
    
    const prompt = `
      Você é um especialista em agronegócio e análise de dados. Sua tarefa é analisar os dados de uma fazenda e gerar um relatório conciso com insights e recomendações.
      Os dados são fornecidos em formato JSON.

      Dados de Atividades Recentes:
      ${JSON.stringify(activities, null, 2)}

      Dados de Transações Financeiras:
      ${JSON.stringify(transactions, null, 2)}

      Dados de Estoque (Insumos e Equipamentos):
      ${JSON.stringify(inventory, null, 2)}

      Dados de Produção Agrícola:
      ${JSON.stringify(production, null, 2)}

      Com base nesses dados, por favor, gere um relatório com as seguintes seções:
      1.  **Resumo Geral:** Uma visão geral do estado atual da fazenda.
      2.  **Análise Financeira:** Comente sobre o saldo geral e aponte transações recentes mais significativas. A evolução detalhada de receitas e despesas será mostrada em um gráfico.
      3.  **Análise de Produção e Atividades:** Comente sobre as atividades recentes mais importantes. A evolução da produção será mostrada em um gráfico.
      4.  **Gestão de Estoque:** Analise o nível dos itens em estoque, destacando itens com baixo estoque se houver.
      5.  **Recomendações:** Forneça de 2 a 3 recomendações acionáveis para otimizar as operações da fazenda.

      Seja claro, objetivo e use um tom profissional. Formate a saída em markdown. Se não houver dados em alguma seção, mencione isso. Os gráficos para análise financeira e de produção serão adicionados separadamente no relatório final, então foque nos insights textuais que complementam os gráficos.
    `

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
    })

    const report = chatCompletion.choices[0]?.message?.content || 'Não foi possível gerar o relatório.'

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
