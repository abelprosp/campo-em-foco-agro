
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Thermometer, Wind, CloudRain, AlertTriangle } from 'lucide-react';

import { getPlots, Plot } from '@/features/plots/api';
import { getPlotCenter } from '@/features/plots/plotUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const HIGH_TEMP_THRESHOLD = 35; // °C
const LOW_TEMP_THRESHOLD = 5; // °C
const HIGH_WIND_THRESHOLD = 40; // km/h

const fetchWeatherForPlot = async (plot: Plot) => {
  const center = getPlotCenter(plot);
  if (!center) return null;

  try {
    const { data, error } = await supabase.functions.invoke('get-weather', {
      body: { latitude: center.latitude, longitude: center.longitude },
    });
  
    if (error) throw new Error(error.message);
    if (data.error) throw new Error(data.error);

    return { plotName: plot.name, weather: data, plotId: plot.id };
  } catch (error) {
    console.error(`Error fetching weather for plot ${plot.name}:`, error instanceof Error ? error.message : String(error));
    return { plotName: plot.name, error: error instanceof Error ? error.message : String(error), plotId: plot.id };
  }
};

export const useWeatherAlerts = () => {
  const { user } = useAuth();
  const { data: plots = [] } = useQuery({
    queryKey: ['plots', user?.id],
    queryFn: getPlots,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  const [shownAlerts, setShownAlerts] = useState<string[]>([]);

  useEffect(() => {
    const checkWeather = async () => {
      if (plots.length === 0) return;

      const weatherChecks = plots.map(plot => fetchWeatherForPlot(plot));
      const results = await Promise.all(weatherChecks);

      const newShownAlerts = [...shownAlerts];

      results.forEach(result => {
        if (!result) return;
        
        if (result.error) {
          const errorAlertId = `${result.plotId}-fetch-error-${new Date().toDateString()}`; // Avoid showing error every time
          if (!shownAlerts.includes(errorAlertId)) {
             toast(`Erro ao buscar clima para "${result.plotName}"`, {
                description: "Não foi possível obter os dados do clima. Tente novamente mais tarde.",
                icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
             });
             newShownAlerts.push(errorAlertId);
          }
          return;
        }

        const { plotName, weather, plotId } = result;
        const { main, wind, weather: weatherDetails } = weather;

        const highTempAlertId = `${plotId}-high-temp`;
        if (main.temp > HIGH_TEMP_THRESHOLD && !shownAlerts.includes(highTempAlertId)) {
          toast(`Alerta: Temperatura alta em "${plotName}"`, {
            description: `A temperatura atual é de ${Math.round(main.temp)}°C.`,
            icon: <Thermometer className="h-4 w-4 text-red-500" />,
          });
          newShownAlerts.push(highTempAlertId);
        }

        const lowTempAlertId = `${plotId}-low-temp`;
        if (main.temp < LOW_TEMP_THRESHOLD && !shownAlerts.includes(lowTempAlertId)) {
          toast(`Alerta: Temperatura baixa em "${plotName}"`, {
            description: `A temperatura atual é de ${Math.round(main.temp)}°C.`,
            icon: <Thermometer className="h-4 w-4 text-blue-500" />,
          });
          newShownAlerts.push(lowTempAlertId);
        }

        const windSpeedKmh = wind.speed * 3.6;
        const highWindAlertId = `${plotId}-high-wind`;
        if (windSpeedKmh > HIGH_WIND_THRESHOLD && !shownAlerts.includes(highWindAlertId)) {
          toast(`Alerta: Vento forte em "${plotName}"`, {
            description: `A velocidade do vento é de ${windSpeedKmh.toFixed(1)} km/h.`,
            icon: <Wind className="h-4 w-4 text-gray-500" />,
          });
          newShownAlerts.push(highWindAlertId);
        }

        const condition = weatherDetails[0].main;
        const precipitationAlertId = `${plotId}-precipitation`;
        if (['Rain', 'Thunderstorm', 'Drizzle', 'Snow'].includes(condition) && !shownAlerts.includes(precipitationAlertId)) {
          toast(`Alerta: Precipitação em "${plotName}"`, {
            description: `Condição climática: ${weatherDetails[0].description}.`,
            icon: <CloudRain className="h-4 w-4 text-blue-400" />,
          });
          newShownAlerts.push(precipitationAlertId);
        }
      });
      if(newShownAlerts.length > shownAlerts.length) {
          setShownAlerts(newShownAlerts);
      }
    };

    const intervalId = setInterval(checkWeather, 1000 * 60 * 10); // Check every 10 minutes

    return () => clearInterval(intervalId);
  }, [plots, shownAlerts]);
};
