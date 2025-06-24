import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Groq from 'https://esm.sh/groq-sdk@0.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('Chave de API do OpenWeather não configurada nas variáveis de ambiente.')
    }

    if (!GROQ_API_KEY) {
      throw new Error('Chave de API da Groq não configurada nas variáveis de ambiente.')
    }

    const { latitude, longitude } = await req.json()
    if (!latitude || !longitude) {
      throw new Error('Latitude e longitude são obrigatórias.')
    }

    // Buscar dados do clima atual
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
    const weatherRes = await fetch(weatherUrl)
    if (!weatherRes.ok) {
      const errorData = await weatherRes.json();
      throw new Error(`Falha ao buscar dados do clima: ${errorData.message || weatherRes.statusText}`)
    }
    const weatherData = await weatherRes.json()

    // Buscar previsão de 5 dias
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
    const forecastRes = await fetch(forecastUrl)
    if (!forecastRes.ok) {
      const errorData = await forecastRes.json();
      throw new Error(`Falha ao buscar previsão: ${errorData.message || forecastRes.statusText}`)
    }
    const forecastData = await forecastRes.json()

    // Inicializar cliente Groq
    const groq = new Groq({ apiKey: GROQ_API_KEY })

    const prompt = `
Analise os seguintes dados meteorológicos e identifique possíveis riscos climáticos para agricultura:

DADOS ATUAIS:
- Temperatura: ${weatherData.main.temp}°C (sensação: ${weatherData.main.feels_like}°C)
- Umidade: ${weatherData.main.humidity}%
- Pressão: ${weatherData.main.pressure} hPa
- Vento: ${weatherData.wind.speed} m/s
- Condição: ${weatherData.weather[0].description}
- Visibilidade: ${weatherData.visibility || 'N/A'} metros

PREVISÃO DOS PRÓXIMOS DIAS:
${forecastData.list.slice(0, 8).map((item: any, index: number) => 
  `${index + 1}. ${new Date(item.dt * 1000).toLocaleString('pt-BR')}: ${item.main.temp}°C, ${item.weather[0].description}, Vento: ${item.wind.speed}m/s, Umidade: ${item.main.humidity}%`
).join('\n')}

Baseado nesses dados, identifique e analise os seguintes tipos de riscos climáticos:
1. Enchentes e inundações
2. Granizo e tempestades severas
3. Secas prolongadas
4. Ventos fortes
5. Geadas
6. Outros riscos relevantes

Além disso, forneça:
- Insights sobre a região analisada (potenciais, desafios, características agrícolas, oportunidades)
- Quais culturas agrícolas são mais indicadas para essa região e por quê (leve em conta clima, solo, histórico agrícola do Brasil)

Retorne a resposta APENAS em formato JSON válido, seguindo esta estrutura:
{
  "summary": "Resumo geral da análise de riscos",
  "risks": [
    {
      "type": "Nome do risco",
      "severity": "low|medium|high",
      "probability": "Descrição da probabilidade",
      "description": "Descrição detalhada do risco",
      "recommendations": ["recomendação 1", "recomendação 2"]
    }
  ],
  "region_insights": "Texto com insights sobre a região, potenciais, desafios, oportunidades agrícolas. Se não houver dados específicos, forneça recomendações gerais para regiões agrícolas do Brasil.",
  "recommended_crops": [
    {
      "crop": "Nome da cultura",
      "reason": "Justificativa para recomendação desta cultura para a região. Se não houver dados específicos, recomende culturas comuns para o clima brasileiro."
    }
  ]
}
IMPORTANTE: NUNCA omita os campos region_insights e recommended_crops, mesmo que precise ser genérico. Sempre preencha esses campos.

Seja preciso, use linguagem acessível ao produtor rural e foque em riscos reais e recomendações práticas baseadas nos dados meteorológicos fornecidos e conhecimento agronômico do Brasil.
`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em meteorologia agrícola. Analise dados meteorológicos e identifique riscos climáticos para agricultura. Responda sempre em formato JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 2000,
    })

    const response = chatCompletion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Não foi possível gerar a análise de riscos.')
    }

    // Tentar fazer parse do JSON
    let analysis
    try {
      analysis = JSON.parse(response)
      // Fallback para garantir que os campos sempre existam
      if (!('region_insights' in analysis)) {
        analysis.region_insights = 'Não foi possível gerar insights para a região no momento.'
      }
      if (!('recommended_crops' in analysis)) {
        analysis.recommended_crops = [
          { crop: 'Milho', reason: 'Cultura adaptada a diversas regiões do Brasil.' },
          { crop: 'Soja', reason: 'Boa produtividade em climas variados.' }
        ]
      }
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', response)
      // Fallback caso a IA não retorne JSON válido
      analysis = {
        summary: 'Erro ao processar análise de riscos climáticos.',
        risks: [],
        region_insights: 'Não foi possível gerar insights para a região no momento.',
        recommended_crops: [
          { crop: 'Milho', reason: 'Cultura adaptada a diversas regiões do Brasil.' },
          { crop: 'Soja', reason: 'Boa produtividade em climas variados.' }
        ]
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: 'Erro ao analisar riscos climáticos.',
      risks: [],
      region_insights: '',
      recommended_crops: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
