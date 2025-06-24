import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Groq from 'https://esm.sh/groq-sdk@0.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('A chave de API da Groq (GROQ_API_KEY) não está configurada nos segredos do Supabase.');
    }
    const groq = new Groq({ apiKey: groqApiKey });

    const { messages, userId } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      throw new Error('O corpo da requisição deve conter um array "messages" e "userId".');
    }

    // Buscar dados contextuais da fazenda do usuário (igual ao generate-report)
    let farmContext = ''
    let kpis = {}
    let evolucaoProducao = []
    let evolucaoFinanceira = []
    let atividadesRecentes = []
    if (userId) {
      try {
        const [
          { data: activities, error: activitiesError },
          { data: transactions, error: transactionsError },
          { data: inventory, error: inventoryError },
          { data: production, error: productionError },
          { data: plots, error: plotsError },
        ] = await Promise.all([
          supabaseAdmin.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
          supabaseAdmin.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(300),
          supabaseAdmin.from('inventory_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
          supabaseAdmin.from('production_records').select('*').eq('user_id', userId).order('harvest_date', { ascending: false }).limit(300),
          supabaseAdmin.from('plots').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
        ])

        if (!activitiesError && !transactionsError && !inventoryError && !productionError && !plotsError) {
          // KPIs do mês atual
          const now = new Date();
          const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          const monthlyTransactions = (transactions || []).filter(t => {
            if (!t.date) return false;
            const transactionDate = new Date(t.date);
            return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
          });

          const receitaMensal = monthlyTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
          const despesasMensais = monthlyTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
          const lucroMensal = receitaMensal - despesasMensais;

          const monthlyProduction = (production || []).filter(r => {
            if (!r.harvest_date) return false;
            const harvestDate = new Date(r.harvest_date);
            return harvestDate >= startOfCurrentMonth && harvestDate <= endOfCurrentMonth;
          }).reduce((sum, r) => sum + Number(r.quantity), 0);

          kpis = {
            receitaMensal,
            despesasMensais,
            lucroMensal,
            producaoMensal: monthlyProduction,
          };

          // Evolução da produção e financeira dos últimos 6 meses
          const months = Array.from({ length: 6 }).map((_, i) => {
            const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            return {
              name: `${start.getMonth() + 1}/${start.getFullYear()}`,
              start,
              end,
              producao: 0,
              receita: 0,
              despesa: 0,
            };
          });

          (production || []).forEach(record => {
            if (!record.harvest_date) return;
            const recordDate = new Date(record.harvest_date);
            for (const month of months) {
              if (recordDate >= month.start && recordDate <= month.end) {
                month.producao += Number(record.quantity);
                break;
              }
            }
          });

          (transactions || []).forEach(transaction => {
            if (!transaction.date) return;
            const transactionDate = new Date(transaction.date);
            for (const month of months) {
              if (transactionDate >= month.start && transactionDate <= month.end) {
                if (transaction.type === 'receita') {
                  month.receita += transaction.amount;
                } else if (transaction.type === 'despesa') {
                  month.despesa += transaction.amount;
                }
                break;
              }
            }
          });

          evolucaoProducao = months.map(m => ({ mes: m.name, producao: m.producao }));
          evolucaoFinanceira = months.map(m => ({ mes: m.name, receita: m.receita, despesa: m.despesa }));

          // Atividades recentes (últimas 4)
          atividadesRecentes = (activities || [])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4)
            .map(activity => ({
              atividade: activity.name,
              talhao: activity.plot_id,
              data: activity.created_at
            }));

          farmContext = `\n      Dados de Atividades Recentes:\n      ${JSON.stringify(atividadesRecentes, null, 2)}\n\n      Dados de Transações Financeiras:\n      ${JSON.stringify(transactions, null, 2)}\n\n      Dados de Estoque (Insumos e Equipamentos):\n      ${JSON.stringify(inventory, null, 2)}\n\n      Dados de Produção Agrícola:\n      ${JSON.stringify(production, null, 2)}\n\n      KPIs do mês atual:\n      ${JSON.stringify(kpis, null, 2)}\n\n      Evolução da Produção (últimos 6 meses):\n      ${JSON.stringify(evolucaoProducao, null, 2)}\n\n      Evolução Financeira (últimos 6 meses):\n      ${JSON.stringify(evolucaoFinanceira, null, 2)}\n    `
        }
      } catch (contextError) {
        console.warn('Erro ao buscar contexto da fazenda:', contextError)
        // Continua sem contexto se houver erro
      }
    }

    // Prompt igual ao do relatório, mas adaptado para chat
    const systemPrompt = `Você é Tata, uma assistente virtual especialista em agronegócio.\n\nVocê tem acesso aos dados reais da fazenda deste usuário, fornecidos em formato JSON abaixo. Use esses dados para responder perguntas, dar recomendações, alertas, resumos ou insights personalizados sobre qualquer área da plataforma AgroAjuda. Seja proativa e, se identificar algo importante em qualquer área, informe o usuário mesmo que ele não pergunte diretamente.\n\nOs dados incluem:\n- KPIs do mês atual (receita, despesas, lucro, produção)\n- Evolução da produção e financeira dos últimos 6 meses\n- Atividades recentes\n- Dados brutos de transações, produção, estoque, atividades\n\n${farmContext ? farmContext : ''}\n\nSeja clara, objetiva, amigável e use um tom profissional. Responda em português. Se não houver dados em alguma seção, mencione isso.\n`;

    // Montar histórico para Groq
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'tata' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const tataReply = chatCompletion.choices[0]?.message?.content || 'Desculpe, não consegui responder agora.';

    return new Response(JSON.stringify({ reply: tataReply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 