import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  updateTime: string;
}

interface IPMACityData {
  globalIdLocal: number;
  tMax: number;
  tMin: number;
  idWeatherType: number;
  precipitaProb: string;
  classWindSpeed: number;
}

// Helper function to map IPMA wind speed class to km/h
const mapWindSpeedClass = (classWindSpeed: number): number => {
  // IPMA classes: 1 (< 15 km/h), 2 (15-35 km/h), 3 (35-55 km/h), 4 (> 55 km/h)
  switch (classWindSpeed) {
    case 1:
      return 10; // Average for < 15 km/h
    case 2:
      return 25; // Average for 15-35 km/h
    case 3:
      return 45; // Average for 35-55 km/h
    case 4:
      return 65; // Average for > 55 km/h
    default:
      return 15; // Default if unknown
  }
};

// Helper function to estimate humidity based on weather type and precipitation
const estimateHumidity = (weatherType: number, precipProb: number): number => {
  // Weather types: 1 (clear), 2-3 (partly cloudy), 4-9 (cloudy/rainy), 10+ (thunderstorm)
  let baseHumidity = 50; // Default humidity

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
  return Math.min(95, Math.round(baseHumidity + precipFactor * 20));
};

// Function to calculate average weather conditions
const calculateAverageWeather = (data: IPMACityData[]): WeatherData => {
  if (!data || data.length === 0) {
    return {
      location: "Portugal (Média Nacional)",
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      windDirection: "N",
      precipitation: 0,
      updateTime: new Date().toISOString(),
    };
  }

  const sum = data.reduce(
    (acc, city) => {
      const tMax = isNaN(city.tMax) ? 0 : city.tMax;
      const tMin = isNaN(city.tMin) ? 0 : city.tMin;
      const precipProb = parseFloat(city.precipitaProb) || 0;
      const weatherType = isNaN(city.idWeatherType) ? 1 : city.idWeatherType;
      const windSpeed = isNaN(city.classWindSpeed) ? 1 : city.classWindSpeed;

      return {
        temperature: acc.temperature + (tMax + tMin) / 2,
        humidity: acc.humidity + estimateHumidity(weatherType, precipProb),
        windSpeed: acc.windSpeed + mapWindSpeedClass(windSpeed),
        precipitation: acc.precipitation + precipProb,
      };
    },
    { temperature: 0, humidity: 0, windSpeed: 0, precipitation: 0 }
  );

  const count = data.length;

  return {
    location: "Portugal (Média Nacional)",
    temperature: Math.round(sum.temperature / count),
    humidity: Math.round(sum.humidity / count),
    windSpeed: Math.round(sum.windSpeed / count),
    windDirection: "N", // Using North as default since we're showing average
    precipitation: Math.round(sum.precipitation / count),
    updateTime: new Date().toISOString(),
  };
};

// Function to fetch weather data from IPMA API
const fetchWeatherData = async (): Promise<WeatherData[]> => {
  try {
    const response = await fetch(
      "https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/hp-daily-forecast-day0.json"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch IPMA data");
    }

    const data = await response.json();

    // Calculate and return national average
    const nationalAverage = calculateAverageWeather(data.data);
    return [nationalAverage];
  } catch (error) {
    console.error("Error fetching weather data:", error);
    toast.error("Erro ao carregar dados meteorológicos do IPMA");
    throw error;
  }
};

// Simple mapping of IPMA location IDs to city names
// This is a simplified version - in a real app, we'd have a complete mapping
function getLocationNameFromIPMA(globalIdLocal: number): string {
  const locationMap: Record<number, string> = {
    1010500: "Aveiro",
    1020500: "Beja",
    1030300: "Braga",
    1040200: "Bragança",
    1050200: "Castelo Branco",
    1060300: "Coimbra",
    1070500: "Évora",
    1080500: "Faro",
    1090700: "Guarda",
    1100900: "Leiria",
    1110600: "Lisboa",
    1121400: "Portalegre",
    1131200: "Porto",
    1141600: "Santarém",
    1151200: "Setúbal",
    1160900: "Viana do Castelo",
    1171400: "Vila Real",
    1182300: "Viseu",
    // Ilhas
    2310100: "Açores",
    2310200: "Madeira",
    2310300: "Porto Santo",
    2310400: "São Miguel",
    2310500: "Terceira",
    2310600: "Pico",
    2310700: "Faial",
    2310800: "São Jorge",
    2310900: "Graciosa",
    2311000: "Flores",
    2311100: "Corvo",
    2311200: "Santa Maria",
  };

  return locationMap[globalIdLocal] || `Localidade ${globalIdLocal}`;
}

export function useWeatherData() {
  return useQuery({
    queryKey: ["weatherData"],
    queryFn: fetchWeatherData,
    refetchInterval: 1800000, // Refetch every 30 minutes
    staleTime: 1500000, // Consider data stale after 25 minutes
  });
}
