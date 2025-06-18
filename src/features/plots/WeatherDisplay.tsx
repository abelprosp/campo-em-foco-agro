
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plot } from './api';
import { getPlotCenter } from './plotUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Thermometer, Wind, Droplets } from 'lucide-react';
import { WeatherRiskAnalysis } from './WeatherRiskAnalysis';

interface WeatherDisplayProps {
  plot: Plot;
}

const fetchWeather = async (latitude: number, longitude: number) => {
  const { data, error } = await supabase.functions.invoke('get-weather', {
    body: { latitude, longitude },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const WeatherDisplay = ({ plot }: WeatherDisplayProps) => {
  const center = getPlotCenter(plot);

  const { data: weather, isLoading, isError, error } = useQuery({
    queryKey: ['weather', plot.id],
    queryFn: () => {
      if (!center) throw new Error('Geometria do talhão inválida para buscar o clima.');
      return fetchWeather(center.latitude, center.longitude);
    },
    enabled: !!center,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  if (!center) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Clima em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span>Não foi possível obter a localização do talhão para exibir o clima.</span>
            </div>
          </CardContent>
        </Card>
        <WeatherRiskAnalysis plot={plot} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Clima em Tempo Real - {plot.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
        <WeatherRiskAnalysis plot={plot} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Clima em Tempo Real - {plot.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Erro ao buscar o clima: {error.message}</span>
          </CardContent>
        </Card>
        <WeatherRiskAnalysis plot={plot} />
      </div>
    );
  }
  
  const weatherIconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Clima em Tempo Real - {plot.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center">
              <img src={weatherIconUrl} alt={weather.weather[0].description} className="h-16 w-16 -ml-4 -mt-2"/>
              <div>
                <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
                <p className="text-muted-foreground capitalize">{weather.weather[0].description}</p>
              </div>
            </div>
            <div className="text-right space-y-1 text-sm">
               <div className="flex items-center justify-end">
                  <span className="text-muted-foreground mr-1">Sensação</span>
                  <Thermometer className="h-4 w-4 mr-1 text-muted-foreground"/>
                  <span>{Math.round(weather.main.feels_like)}°C</span>
               </div>
               <div className="flex items-center justify-end">
                  <span className="text-muted-foreground mr-1">Vento</span>
                  <Wind className="h-4 w-4 mr-1 text-muted-foreground"/>
                  <span>{(weather.wind.speed * 3.6).toFixed(1)} km/h</span>
               </div>
                <div className="flex items-center justify-end">
                  <span className="text-muted-foreground mr-1">Umidade</span>
                  <Droplets className="h-4 w-4 mr-1 text-muted-foreground"/>
                  <span>{weather.main.humidity}%</span>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <WeatherRiskAnalysis plot={plot} />
    </div>
  );
};
