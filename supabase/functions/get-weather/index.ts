
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('Chave de API do OpenWeather não configurada nas variáveis de ambiente.')
    }

    const { latitude, longitude } = await req.json()
    if (!latitude || !longitude) {
      throw new Error('Latitude e longitude são obrigatórias.')
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`

    const weatherRes = await fetch(weatherUrl)
    if (!weatherRes.ok) {
      const errorData = await weatherRes.json();
      throw new Error(`Falha ao buscar dados do clima: ${errorData.message || weatherRes.statusText}`)
    }

    const weatherData = await weatherRes.json()

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
