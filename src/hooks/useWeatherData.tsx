
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

// Helper function to map IPMA wind speed class to km/h
const mapWindSpeedClass = (classWindSpeed: number): number => {
  // IPMA classes: 1 (< 15 km/h), 2 (15-35 km/h), 3 (35-55 km/h), 4 (> 55 km/h)
  switch(classWindSpeed) {
    case 1: return 10;  // Average for < 15 km/h
    case 2: return 25;  // Average for 15-35 km/h
    case 3: return 45;  // Average for 35-55 km/h
    case 4: return 65;  // Average for > 55 km/h
    default: return 15; // Default if unknown
  }
};

// Helper function to estimate humidity based on weather type and precipitation
const estimateHumidity = (weatherType: number, precipProb: number): number => {
  // Weather types: 1 (clear), 2-3 (partly cloudy), 4-9 (cloudy/rainy), 10+ (thunderstorm)
  let baseHumidity = 50;  // Default humidity
  
  if (weatherType >= 9) {
    // Heavy rain or thunderstorms
    baseHumidity = 85;
  } else if (weatherType >= 4) {
    // Cloudy or light rain
    baseHumidity = 70;
  } else if (weatherType >= 2) {
    // Partly cloudy
    baseHumidity = 60;
  } else {
    // Clear sky
    baseHumidity = 45;
  }
  
  // Adjust based on precipitation probability
  const precipFactor = precipProb / 100;
  return Math.min(95, Math.round(baseHumidity + (precipFactor * 20)));
};

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
    return data.data.map((city: any) => {
      const location = getLocationNameFromIPMA(city.globalIdLocal);
      return {
        location: location || 'Localização desconhecida',
        temperature: Math.round((city.tMax + city.tMin) / 2), // Average temperature
        humidity: estimateHumidity(city.idWeatherType, parseFloat(city.precipitaProb) || 0),
        windSpeed: mapWindSpeedClass(city.classWindSpeed),
        windDirection: city.predWindDir || 'N',
        precipitation: parseFloat(city.precipitaProb) || 0, // Precipitation probability
        updateTime: data.dataUpdate || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    toast.error('Erro ao carregar dados meteorológicos do IPMA');
    throw error;
  }
};

// Simple mapping of IPMA location IDs to city names
// This is a simplified version - in a real app, we'd have a complete mapping
function getLocationNameFromIPMA(globalIdLocal: number): string {
  const locationMap: Record<number, string> = {
    1010500: 'Aveiro',
    1020500: 'Beja',
    1030300: 'Braga',
    1040200: 'Bragança',
    1050200: 'Castelo Branco',
    1060300: 'Coimbra',
    1070500: 'Évora',
    1080500: 'Faro',
    1090700: 'Guarda',
    1100900: 'Leiria',
    1110600: 'Lisboa',
    1121400: 'Portalegre',
    1131200: 'Porto',
    1141600: 'Santarém',
    1151200: 'Setúbal',
    1160900: 'Viana do Castelo',
    1171400: 'Vila Real',
    1182300: 'Viseu'
  };
  
  return locationMap[globalIdLocal] || `Localidade ${globalIdLocal}`;
}

export function useWeatherData() {
  return useQuery({
    queryKey: ['weatherData'],
    queryFn: fetchWeatherData,
    refetchInterval: 1800000, // Refetch every 30 minutes
    staleTime: 1500000, // Consider data stale after 25 minutes
  });
}
