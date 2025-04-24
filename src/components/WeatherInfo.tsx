
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherCondition {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
}

interface WeatherInfoProps {
  conditions?: WeatherCondition[];
  isLoading: boolean;
}

const WeatherInfo = ({ conditions = [], isLoading }: WeatherInfoProps) => {
  // Pick a location (for now hardcoded, could be based on user's location)
  const selectedLocation = conditions.length > 0 ? conditions[0] : null;
  
  // Get fire danger level based on weather
  const getFireDangerLevel = (condition: WeatherCondition) => {
    // Basic algorithm: high temp + low humidity + high wind = danger
    const tempFactor = Math.max(0, condition.temperature - 20) / 20; // 0-1 scale starting at 20°C
    const humidityFactor = (100 - condition.humidity) / 100; // 0-1 scale, lower humidity = higher risk
    const windFactor = Math.min(condition.windSpeed, 40) / 40; // 0-1 scale up to 40 km/h
    
    const combinedFactor = (tempFactor * 0.4) + (humidityFactor * 0.4) + (windFactor * 0.2);
    
    if (combinedFactor > 0.8) return { level: 'extreme', text: 'Extremo' };
    if (combinedFactor > 0.6) return { level: 'very-high', text: 'Muito Alto' };
    if (combinedFactor > 0.4) return { level: 'high', text: 'Alto' };
    if (combinedFactor > 0.2) return { level: 'moderate', text: 'Moderado' };
    return { level: 'low', text: 'Baixo' };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Condições Meteorológicas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !selectedLocation ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              {selectedLocation.location}
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">{selectedLocation.temperature}°C</span>
              {selectedLocation.precipitation > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {selectedLocation.precipitation}mm precipitação
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Humidade</div>
                <div className="font-medium">{selectedLocation.humidity}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Vento</div>
                <div className="font-medium">
                  {selectedLocation.windSpeed} km/h {selectedLocation.windDirection}
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="text-sm text-muted-foreground">Perigo de Incêndio</div>
                <div>
                  <span 
                    className="font-bold" 
                    style={{ color: `var(--risk-${getFireDangerLevel(selectedLocation).level})` }}
                  >
                    {getFireDangerLevel(selectedLocation).text}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherInfo;
