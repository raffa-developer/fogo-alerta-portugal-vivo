
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
    // Fetch meteorological data from IPMA API
    const response = await fetch('https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/hp-daily-forecast-day0.json');
    if (!response.ok) {
      throw new Error('Failed to fetch IPMA data');
    }
    
    const data = await response.json();
    
    // Transform IPMA data to match our interface
    return data.data.map((city: any) => ({
      location: city.local,
      temperature: Math.round((city.tMax + city.tMin) / 2), // Average temperature
      humidity: city.hR || 0, // Relative humidity
      windSpeed: Math.round(city.ffVento * 3.6), // Convert m/s to km/h
      windDirection: city.ddVento, // Wind direction
      precipitation: city.precipitaProb || 0, // Precipitation probability
      updateTime: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    toast.error('Erro ao carregar dados meteorológicos do IPMA');
    throw error;
  }
};

export function useWeatherData() {
  return useQuery({
    queryKey: ['weatherData'],
    queryFn: fetchWeatherData,
    refetchInterval: 1800000, // Refetch every 30 minutes
    staleTime: 1500000, // Consider data stale after 25 minutes
  });
}

