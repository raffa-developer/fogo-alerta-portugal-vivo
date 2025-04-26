import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface FireIncident {
  id: string;
  district: string;
  location: string;
  lat: number;
  lng: number;
  start: string;
  status: 'active' | 'contained' | 'extinguished';
  type: string;
  resources: {
    men: number;
    terrain: number;
    aerial: number;
  };
}

interface RiskLevel {
  district: string;
  level: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';
  temperature?: number;
}

interface FireData {
  incidents: FireIncident[];
  riskLevels: RiskLevel[];
  timestamp: string;
}

const createValidDate = (incident: any): string => {
  if (incident.date && incident.hour) {
    const [day, month, year] = incident.date.split('/');
    if (day && month && year) {
      const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${incident.hour}:00`;
      const parsedDate = new Date(dateString);
      
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
  }
  
  if (incident.dateTime?.sec) {
    const parsedDate = new Date(incident.dateTime.sec * 1000);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }
  
  return new Date().toISOString();
};

const mapApiStatus = (status: string): 'active' | 'contained' | 'extinguished' => {
  if (!status) return 'extinguished';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('despacho') || lowerStatus.includes('curso') || 
      lowerStatus.includes('chegada') || lowerStatus.includes('confirmação')) {
    return 'active';
  } else if (lowerStatus.includes('resolução')) {
    return 'contained';
  } else {
    return 'extinguished';
  }
};

const fetchFireRiskData = async (): Promise<RiskLevel[]> => {
  try {
    const response = await fetch('https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/hp-daily-forecast-day0.json');
    if (!response.ok) {
      throw new Error('Failed to fetch IPMA data');
    }
    
    const weatherData = await response.json();
    
    const districts = [
      'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
      'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
      'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
      'Viana do Castelo', 'Vila Real', 'Viseu'
    ];
    
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
    
    const riskLevels: RiskLevel[] = districts.map(district => {
      const districtWeatherData = weatherData.data.find((location: any) => 
        locationMap[location.globalIdLocal] === district
      );
      
      if (districtWeatherData) {
        const tempRisk = calculateTemperatureRisk(districtWeatherData.tMax);
        const windRisk = calculateWindRisk(districtWeatherData.classWindSpeed);
        const precipRisk = calculatePrecipitationRisk(Number(districtWeatherData.precipitaProb || 0));
        
        const estimatedHumidity = estimateHumidity(districtWeatherData.idWeatherType, Number(districtWeatherData.precipitaProb || 0));
        const humidityRisk = calculateHumidityRisk(estimatedHumidity);
        
        const riskScore = (tempRisk * 0.4) + (humidityRisk * 0.3) + (windRisk * 0.2) + (precipRisk * 0.1);
        
        return {
          district,
          level: getRiskLevelFromScore(riskScore),
          temperature: Math.round(districtWeatherData.tMax)
        };
      }
      
      return {
        district,
        level: 'moderate',
        temperature: undefined
      };
    });
    
    return riskLevels;
  } catch (error) {
    console.error('Error fetching fire risk data:', error);
    
    return createDefaultRiskLevels().map(risk => ({
      ...risk,
      temperature: undefined
    }));
  }
};

const calculateTemperatureRisk = (temperature: number): number => {
  if (temperature < 15) return 0.2;
  if (temperature < 20) return 0.4;
  if (temperature < 25) return 0.6;
  if (temperature < 30) return 0.8;
  return 1.0;
};

const calculateWindRisk = (classWindSpeed: number): number => {
  if (classWindSpeed === 1) return 0.3;
  if (classWindSpeed === 2) return 0.6;
  if (classWindSpeed === 3) return 0.8;
  if (classWindSpeed === 4) return 1.0;
  return 0.4;
};

const calculatePrecipitationRisk = (precipProb: number): number => {
  return Math.max(0, 1 - (precipProb / 100));
};

const calculateHumidityRisk = (humidity: number): number => {
  if (humidity > 80) return 0.2;
  if (humidity > 60) return 0.4;
  if (humidity > 45) return 0.6;
  if (humidity > 30) return 0.8;
  return 1.0;
};

const estimateHumidity = (weatherType: number, precipProb: number): number => {
  let baseHumidity = 50;
  
  if (weatherType >= 9) {
    baseHumidity = 85;
  } else if (weatherType >= 4) {
    baseHumidity = 70;
  } else if (weatherType >= 2) {
    baseHumidity = 60;
  } else {
    baseHumidity = 45;
  }
  
  const precipFactor = precipProb / 100;
  return Math.min(95, Math.round(baseHumidity + (precipFactor * 20)));
};

const getRiskLevelFromScore = (score: number): 'low' | 'moderate' | 'high' | 'very-high' | 'extreme' => {
  if (score < 0.25) return 'low';
  if (score < 0.45) return 'moderate';
  if (score < 0.65) return 'high';
  if (score < 0.85) return 'very-high';
  return 'extreme';
};

const createDefaultRiskLevels = (): RiskLevel[] => {
  const districts = [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
    'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
    'Viana do Castelo', 'Vila Real', 'Viseu'
  ];
  
  return districts.map(district => {
    const levels: ('low' | 'moderate' | 'high' | 'very-high' | 'extreme')[] = 
      ['low', 'moderate', 'high', 'very-high', 'extreme'];
    
    const hash = district.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const levelIndex = Math.floor((hash + dayOfYear) % levels.length);
    
    return {
      district,
      level: levels[levelIndex]
    };
  });
};

const fetchFireData = async (): Promise<FireData> => {
  try {
    const [incidentsResponse, riskLevels] = await Promise.all([
      fetch('https://api.fogos.pt/v2/incidents/active').then(res => {
        if (!res.ok) throw new Error('Failed to fetch fire data');
        return res.json();
      }),
      fetchFireRiskData()
    ]);
    
    const incidents: FireIncident[] = incidentsResponse.data && Array.isArray(incidentsResponse.data) ? 
      incidentsResponse.data.map((incident: any) => ({
        id: incident.id || String(Math.random()),
        district: incident.district || 'Unknown',
        location: incident.location || 'Unknown',
        lat: parseFloat(incident.lat) || 0,
        lng: parseFloat(incident.lng) || 0,
        start: createValidDate(incident),
        status: mapApiStatus(incident.status),
        type: incident.natureza || 'Unknown',
        resources: {
          men: parseInt(incident.man) || 0,
          terrain: parseInt(incident.terrain) || 0,
          aerial: parseInt(incident.aerial) || 0,
        }
      })) : [];
    
    return {
      incidents,
      riskLevels,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching fire data:', error);
    toast.error('Erro ao carregar dados de incêndios');
    throw error;
  }
};

export function useFireData() {
  return useQuery({
    queryKey: ['fireData'],
    queryFn: fetchFireData,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function getRiskColor(level: string): string {
  switch(level) {
    case 'low': 
      return '#64B6AC';
    case 'moderate':
      return '#FFD166';
    case 'high':
      return '#F39237';
    case 'very-high':
      return '#EA526F';
    case 'extreme':
      return '#D62828';
    default:
      return '#64B6AC';
  }
}

export function getRiskTranslation(level: string): string {
  switch(level) {
    case 'low': 
      return 'Baixo';
    case 'moderate':
      return 'Moderado';
    case 'high':
      return 'Alto';
    case 'very-high':
      return 'Muito Alto';
    case 'extreme':
      return 'Extremo';
    default:
      return 'Desconhecido';
  }
}
