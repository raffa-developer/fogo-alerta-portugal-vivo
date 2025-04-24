
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  updateTime: string;
}

// Function to fetch weather data from IPMA API
const fetchWeatherData = async (): Promise<WeatherData[]> => {
  try {
    // In a real app, fetch data from IPMA API
    // For now, let's generate mock data for major cities in Portugal
    const cities = ['Lisboa', 'Porto', 'Coimbra', 'Faro', 'Évora', 'Braga'];
    
    return cities.map(city => {
      // Generate "random" but deterministic weather data
      const hash = city.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const today = new Date();
      const hourOfDay = today.getHours();
      
      // Temperature ranges from 15-35°C based on location and time
      const baseTemp = 15 + (hash % 5);
      const dayVariation = Math.sin((hourOfDay / 24) * Math.PI) * 10;
      const temperature = Math.round(baseTemp + dayVariation);
      
      // Humidity ranges from 20-80% based on location and temperature
      const humidity = Math.round(80 - temperature + (hash % 20));
      
      // Wind speed ranges from 1-30 km/h
      const windSpeed = Math.round(5 + (hash + hourOfDay) % 25);
      
      // Wind direction
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const windDirection = directions[(hash + hourOfDay) % directions.length];
      
      // Precipitation (mm) - mostly 0, sometimes a small amount
      const precipitationRoll = (hash + hourOfDay) % 10;
      const precipitation = precipitationRoll > 7 ? Math.round((precipitationRoll - 7) * 5) : 0;
      
      return {
        location: city,
        temperature,
        humidity,
        windSpeed,
        windDirection,
        precipitation,
        updateTime: today.toISOString()
      };
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    toast.error('Erro ao carregar dados meteorológicos');
    throw error;
  }
};

export function useWeatherData() {
  return useQuery({
    queryKey: ['weatherData'],
    queryFn: fetchWeatherData,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  });
}
