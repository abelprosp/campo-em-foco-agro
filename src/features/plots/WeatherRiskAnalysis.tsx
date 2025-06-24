import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plot } from './api';
import { getPlotCenter } from './plotUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, CloudRain, Zap, Cloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WeatherRiskAnalysisProps {
  plot: Plot;
}

interface RiskAnalysis {
  risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    probability: string;
    description: string;
    recommendations: string[];
  }>;
  summary: string;
  region_insights: string;
  recommended_crops: Array<{
    crop: string;
    reason: string;
  }>;
}

const fetchWeatherRiskAnalysis = async (latitude: number, longitude: number) => {
  const { data, error } = await supabase.functions.invoke('analyze-weather-risks', {
    body: { latitude, longitude },
  });
  if (error) throw new Error(error.message);
  return data;
};

const getRiskIcon = (riskType: string) => {
  const type = riskType.toLowerCase();
  if (type.includes('enchente') || type.includes('inundação')) {
    return <CloudRain className="h-4 w-4" />;
  }
  if (type.includes('granizo') || type.includes('tempestade')) {
    return <Zap className="h-4 w-4" />;
  }
  return <Cloud className="h-4 w-4" />;
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'default';
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Médio';
    case 'low':
      return 'Baixo';
    default:
      return severity;
  }
};

export const WeatherRiskAnalysis = ({ plot }: WeatherRiskAnalysisProps) => {
  const center = getPlotCenter(plot);

  const { data: riskAnalysis, isLoading, isError, error } = useQuery<RiskAnalysis>({
    queryKey: ['weather-risks', plot.id],
    queryFn: () => {
      if (!center) throw new Error('Geometria do talhão inválida para análise de riscos.');
      return fetchWeatherRiskAnalysis(center.latitude, center.longitude);
    },
    enabled: !!center,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });

  if (!center) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Riscos Climáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Não foi possível obter a localização do talhão para análise de riscos.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Riscos Climáticos - {plot.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Riscos Climáticos - {plot.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center text-destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          <span>Erro ao analisar riscos: {error?.message}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Riscos Climáticos - {plot.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskAnalysis?.summary && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{riskAnalysis.summary}</p>
          </div>
        )}
        
        {riskAnalysis?.risks && riskAnalysis.risks.length > 0 ? (
          <div className="space-y-3">
            {riskAnalysis.risks.map((risk, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(risk.type)}
                    <span className="font-medium">{risk.type}</span>
                  </div>
                  <Badge variant={getSeverityColor(risk.severity)}>
                    {getSeverityLabel(risk.severity)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  <strong>Probabilidade:</strong> {risk.probability}
                </p>
                
                <p className="text-sm">{risk.description}</p>
                
                {risk.recommendations && risk.recommendations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Recomendações:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {risk.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start gap-1">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Cloud className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhum risco climático significativo detectado no momento.</p>
          </div>
        )}

        {/* Insights da Região */}
        {riskAnalysis?.region_insights && (
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <h3 className="font-semibold text-green-900 mb-2">Insights da Região</h3>
            <p className="text-green-900 text-sm whitespace-pre-line">{riskAnalysis.region_insights}</p>
          </div>
        )}

        {/* Culturas Recomendadas */}
        {riskAnalysis?.recommended_crops && riskAnalysis.recommended_crops.length > 0 && (
          <div className="mt-6 p-4 bg-lime-50 border-l-4 border-lime-400 rounded">
            <h3 className="font-semibold text-lime-900 mb-2">Culturas Recomendadas para a Região</h3>
            <ul className="list-disc list-inside space-y-1">
              {riskAnalysis.recommended_crops.map((crop, idx) => (
                <li key={idx} className="text-lime-900 text-sm">
                  <span className="font-medium">{crop.crop}:</span> {crop.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
