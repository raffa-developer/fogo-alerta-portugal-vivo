
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
}

interface FireData {
  incidents: FireIncident[];
  riskLevels: RiskLevel[];
  timestamp: string;
}

// Função para verificar e criar uma data válida
const createValidDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return new Date().toISOString();
  }
  
  const parsedDate = new Date(dateString);
  
  // Verificar se a data é válida
  if (isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }
  
  return parsedDate.toISOString();
};

// Function to fetch fire data from ProCiv API
const fetchFireData = async (): Promise<FireData> => {
  try {
    const response = await fetch('https://api.fogos.pt/v2/incidents/active');
    if (!response.ok) {
      throw new Error('Failed to fetch fire data');
    }
    
    const data = await response.json();
    
    // Transform the data to match our interface
    const incidents: FireIncident[] = data.data && Array.isArray(data.data) ? 
      data.data.map((incident: any) => ({
        id: incident.id || String(Math.random()),
        district: incident.district || 'Unknown',
        location: incident.location || 'Unknown',
        lat: parseFloat(incident.lat) || 0,
        lng: parseFloat(incident.lng) || 0,
        start: createValidDate(incident.date),
        status: incident.status?.toLowerCase() === 'active' ? 'active' : 
                incident.status?.toLowerCase() === 'contained' ? 'contained' : 'extinguished',
        type: incident.natureCode || 'Unknown',
        resources: {
          men: parseInt(incident.man) || 0,
          terrain: parseInt(incident.terrain) || 0,
          aerial: parseInt(incident.aerial) || 0,
        }
      })) : [];

    // Fetch risk levels (we would fetch this from another endpoint in a real app)
    // For now, let's generate mock data based on districts in Portugal
    const districts = [
      'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
      'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
      'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
      'Viana do Castelo', 'Vila Real', 'Viseu'
    ];
    
    const riskLevels: RiskLevel[] = districts.map(district => {
      const levels: ('low' | 'moderate' | 'high' | 'very-high' | 'extreme')[] = 
        ['low', 'moderate', 'high', 'very-high', 'extreme'];
      
      // Get a "random" but deterministic risk level based on the district name
      const hash = district.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      // Use a combination of the hash and day of year to determine the risk level
      const levelIndex = Math.floor((hash + dayOfYear) % levels.length);
      
      return {
        district,
        level: levels[levelIndex]
      };
    });
    
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
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

// Calculate risk color based on level
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
